"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

function NestScene3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.FogExp2(0x87ceeb, 0.006);

    // Camera: elevated 3/4 view looking at the island and nest
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 300);
    camera.position.set(18, 16, 22);
    camera.lookAt(0, 3, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // Lighting
    scene.add(new THREE.AmbientLight(0xfff8e1, 0.7));
    const sunLight = new THREE.DirectionalLight(0xfff4e0, 1.4);
    sunLight.position.set(10, 25, 8);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(1024, 1024);
    scene.add(sunLight);
    scene.add(new THREE.HemisphereLight(0xd0eeff, 0xc8f082, 0.5));

    const outlineMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });
    function addOutline(mesh: THREE.Mesh, thickness = 0.03) {
      const outline = new THREE.Mesh(mesh.geometry, outlineMat);
      outline.scale.multiplyScalar(1 + thickness);
      mesh.add(outline);
    }

    // === TEXTURES ===
    function makeGrassTexture() {
      const c = document.createElement("canvas"); c.width = 256; c.height = 256;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#3da55c"; ctx.fillRect(0, 0, 256, 256);
      const greens = ["#35974f", "#42b066", "#2e8a45", "#4aba6e"];
      for (let i = 0; i < 2000; i++) {
        ctx.strokeStyle = greens[Math.floor(Math.random() * greens.length)];
        ctx.lineWidth = 0.5 + Math.random();
        const x = Math.random() * 256, y = Math.random() * 256;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (Math.random() - 0.5) * 3, y - 2 - Math.random() * 5); ctx.stroke();
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(6, 6);
      return tex;
    }

    function makeWaterTexture() {
      const c = document.createElement("canvas"); c.width = 256; c.height = 256;
      const ctx = c.getContext("2d")!;
      const grad = ctx.createLinearGradient(0, 0, 256, 256);
      grad.addColorStop(0, "#3b82f6"); grad.addColorStop(0.5, "#60a5fa"); grad.addColorStop(1, "#3b82f6");
      ctx.fillStyle = grad; ctx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 150; i++) {
        ctx.strokeStyle = `rgba(255,255,255,${0.05 + Math.random() * 0.1})`;
        ctx.lineWidth = 0.5 + Math.random();
        const x = Math.random() * 256, y = Math.random() * 256;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 5 + Math.random() * 15, y + (Math.random() - 0.5) * 2); ctx.stroke();
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 4);
      return tex;
    }

    const grassTex = makeGrassTexture();
    const waterTex = makeWaterTexture();

    // === WATER ===
    const water = new THREE.Mesh(
      new THREE.CircleGeometry(80, 32),
      new THREE.MeshPhongMaterial({ map: waterTex, color: 0x4a90d9, shininess: 80, transparent: true, opacity: 0.85 })
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.6;
    scene.add(water);

    // === GARDEN ISLAND (below) ===
    const ISLAND_RADIUS = 14;
    const island = new THREE.Mesh(
      new THREE.CylinderGeometry(ISLAND_RADIUS, ISLAND_RADIUS - 1, 1.5, 32),
      new THREE.MeshLambertMaterial({ map: grassTex, color: 0x3da55c })
    );
    island.position.y = -0.3;
    island.receiveShadow = true;
    scene.add(island);

    // Beach ring
    const beach = new THREE.Mesh(
      new THREE.TorusGeometry(ISLAND_RADIUS - 0.3, 0.8, 8, 32),
      new THREE.MeshLambertMaterial({ color: 0xe8d5a3 })
    );
    beach.rotation.x = -Math.PI / 2;
    beach.position.y = -0.5;
    scene.add(beach);

    // === NEST STRUCTURE (foreground, close to camera) ===
    const nestGroup = new THREE.Group();

    // Nest bowl (woven twigs)
    const nestBowlGeo = new THREE.TorusGeometry(2.5, 0.6, 8, 16);
    const nestMat = new THREE.MeshLambertMaterial({ color: 0x8B6914 });
    const nestBowl = new THREE.Mesh(nestBowlGeo, nestMat);
    nestBowl.rotation.x = -Math.PI / 2;
    addOutline(nestBowl, 0.04);
    nestGroup.add(nestBowl);

    // Nest inner filling
    const nestInner = new THREE.Mesh(
      new THREE.CircleGeometry(2.2, 16),
      new THREE.MeshLambertMaterial({ color: 0x6B4E2A })
    );
    nestInner.rotation.x = -Math.PI / 2;
    nestInner.position.y = -0.1;
    nestGroup.add(nestInner);

    // Twigs layered around the nest
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const twig = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.06, 1.5 + Math.random(), 4),
        new THREE.MeshLambertMaterial({ color: 0x7A5C2E + Math.floor(Math.random() * 0x202020) })
      );
      twig.position.set(Math.cos(angle) * 2.2, 0.2, Math.sin(angle) * 2.2);
      twig.rotation.z = (Math.random() - 0.5) * 0.5;
      twig.rotation.y = angle + Math.random();
      nestGroup.add(twig);
    }

    // Small eggs in nest
    const eggMat = new THREE.MeshPhongMaterial({ color: 0xF5F0E8, shininess: 30 });
    for (let i = 0; i < 3; i++) {
      const egg = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 6), eggMat);
      egg.scale.set(0.8, 1.0, 0.8);
      egg.position.set(Math.cos(i * 2.1) * 0.6, 0.1, Math.sin(i * 2.1) * 0.6);
      addOutline(egg, 0.05);
      nestGroup.add(egg);
    }

    // Spots on eggs
    const spotMat = new THREE.MeshLambertMaterial({ color: 0xC4A882 });
    for (let i = 0; i < 8; i++) {
      const spot = new THREE.Mesh(new THREE.SphereGeometry(0.06, 4, 3), spotMat);
      spot.position.set(
        Math.cos(i * 0.8) * 0.7 + (Math.random() - 0.5) * 0.3,
        0.3,
        Math.sin(i * 0.8) * 0.7 + (Math.random() - 0.5) * 0.3
      );
      nestGroup.add(spot);
    }

    // Scale up the nest for the 3/4 view
    nestGroup.scale.set(1.8, 1.8, 1.8);
    nestGroup.position.set(0, 1.2, 2);
    scene.add(nestGroup);

    // === LIGHTHOUSE ===
    const lhGroup = new THREE.Group();
    const lhHeight = 7;
    const lhBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.9, lhHeight, 8),
      new THREE.MeshPhongMaterial({ color: 0xf5f0e0, shininess: 20 })
    );
    lhBody.position.y = lhHeight / 2;
    lhBody.castShadow = true;
    addOutline(lhBody, 0.02);
    lhGroup.add(lhBody);

    // Red stripes
    const lhStripeMat = new THREE.MeshPhongMaterial({ color: 0xcc3333, shininess: 15 });
    for (let s = 0; s < 3; s++) {
      const sy = 1.5 + s * 2.0;
      const sr = 0.9 - (sy / lhHeight) * 0.3;
      const stripe = new THREE.Mesh(
        new THREE.CylinderGeometry(sr - 0.01, sr + 0.02, 0.6, 8),
        lhStripeMat
      );
      stripe.position.y = sy;
      lhGroup.add(stripe);
    }

    // Deck
    const lhDeckMat = new THREE.MeshPhongMaterial({ color: 0x333333, shininess: 30 });
    const lhDeck = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.15, 12), lhDeckMat);
    lhDeck.position.y = lhHeight + 0.08;
    lhGroup.add(lhDeck);

    // Railing
    for (let r = 0; r < 12; r++) {
      const ra = (r / 12) * Math.PI * 2;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 4), lhDeckMat);
      post.position.set(Math.cos(ra) * 0.95, lhHeight + 0.35, Math.sin(ra) * 0.95);
      lhGroup.add(post);
    }
    const lhRail = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.03, 4, 12), lhDeckMat);
    lhRail.rotation.x = -Math.PI / 2;
    lhRail.position.y = lhHeight + 0.55;
    lhGroup.add(lhRail);

    // Lamp room
    const lhLamp = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.55, 0.8, 8),
      new THREE.MeshPhongMaterial({ color: 0xfff9c4, transparent: true, opacity: 0.7, shininess: 60, emissive: 0xfff176, emissiveIntensity: 0.3 })
    );
    lhLamp.position.y = lhHeight + 0.55;
    lhGroup.add(lhLamp);

    // Roof
    const lhRoof = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.5, 8), new THREE.MeshPhongMaterial({ color: 0xcc3333, shininess: 20 }));
    lhRoof.position.y = lhHeight + 1.2;
    addOutline(lhRoof, 0.03);
    lhGroup.add(lhRoof);

    // Light
    const lhLight = new THREE.PointLight(0xfff9c4, 1.5, 20);
    lhLight.position.y = lhHeight + 0.55;
    lhGroup.add(lhLight);

    lhGroup.position.set(-8, 0, -6);
    scene.add(lhGroup);

    // === TREES on the island (3/4 view with trunks) ===
    function nestTree(x: number, z: number, sc: number, col: number) {
      const g = new THREE.Group();
      // Trunk
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15 * sc, 0.25 * sc, 2.5 * sc, 6),
        new THREE.MeshLambertMaterial({ color: 0x6b3e1e })
      );
      trunk.position.y = 1.25 * sc;
      trunk.castShadow = true;
      addOutline(trunk, 0.04);
      g.add(trunk);
      // Foliage
      const fMat = new THREE.MeshLambertMaterial({ color: col });
      [{ r: 1.4, y: 3.0 }, { r: 1.6, y: 3.8 }, { r: 1.2, y: 4.5 }, { r: 0.9, y: 5.0 }].forEach((l) => {
        const f = new THREE.Mesh(new THREE.SphereGeometry(l.r * sc, 7, 6), fMat);
        f.position.set((Math.random() - 0.5) * 0.5 * sc, l.y * sc, (Math.random() - 0.5) * 0.4 * sc);
        f.castShadow = true;
        addOutline(f, 0.03);
        g.add(f);
      });
      g.position.set(x, 0, z);
      return g;
    }

    const treeColors = [0x1a6b1a, 0x228b22, 0x2e8b57];
    for (let angle = 0; angle < Math.PI * 2; angle += 0.5 + Math.random() * 0.3) {
      const r = ISLAND_RADIUS - 3 + (Math.random() - 0.5) * 2;
      const tx = Math.cos(angle) * r;
      const tz = Math.sin(angle) * r;
      scene.add(nestTree(tx, tz, 0.7 + Math.random() * 0.4, treeColors[Math.floor(Math.random() * 3)]));
    }

    // Some interior trees
    for (let i = 0; i < 6; i++) {
      const tx = (Math.random() - 0.5) * ISLAND_RADIUS;
      const tz = (Math.random() - 0.5) * ISLAND_RADIUS;
      if (Math.sqrt(tx * tx + tz * tz) < ISLAND_RADIUS - 2) {
        scene.add(nestTree(tx, tz, 0.6 + Math.random() * 0.3, treeColors[Math.floor(Math.random() * 3)]));
      }
    }

    // Flowers on the island
    const flowerColors = [0xf472b6, 0xfbbf24, 0xc084fc, 0xfb923c, 0xe11d48, 0x9b59b6, 0xffffff];
    for (let i = 0; i < 60; i++) {
      const fx = (Math.random() - 0.5) * ISLAND_RADIUS * 1.6;
      const fz = (Math.random() - 0.5) * ISLAND_RADIUS * 1.6;
      if (Math.sqrt(fx * fx + fz * fz) > ISLAND_RADIUS - 1.5) continue;
      const flowerG = new THREE.Group();
      // Stem
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.02, 0.3, 4),
        new THREE.MeshLambertMaterial({ color: 0x2d7a2d })
      );
      stem.position.y = 0.15;
      flowerG.add(stem);
      // Petals
      const col = flowerColors[Math.floor(Math.random() * flowerColors.length)];
      for (let p = 0; p < 5; p++) {
        const pa = (p / 5) * Math.PI * 2;
        const petal = new THREE.Mesh(
          new THREE.SphereGeometry(0.05, 5, 4),
          new THREE.MeshPhongMaterial({ color: col, shininess: 20 })
        );
        petal.position.set(Math.cos(pa) * 0.04, 0.32, Math.sin(pa) * 0.04);
        petal.scale.set(1.3, 0.3, 0.6);
        flowerG.add(petal);
      }
      flowerG.position.set(fx, 0, fz);
      scene.add(flowerG);
    }

    // === CLOUDS ===
    const clouds: THREE.Group[] = [];
    const cloudData = [
      { x: -18, y: 13, z: -12, s: 2.0, sp: 0.006 },
      { x: 12, y: 15, z: -15, s: 2.5, sp: 0.004 },
      { x: -8, y: 14, z: -10, s: 1.5, sp: 0.007 },
      { x: 22, y: 12, z: -9, s: 2.2, sp: 0.005 },
    ];
    cloudData.forEach((cd) => {
      const g = new THREE.Group();
      const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 });
      [[0, 0, 0, 1], [1, 0.2, 0.2, 0.8], [-0.9, 0.1, -0.1, 0.75], [0.4, 0.4, 0, 0.6]].forEach(([px, py, pz, s]) => {
        const m = new THREE.Mesh(new THREE.SphereGeometry((s as number) * cd.s, 7, 6), mat);
        m.position.set((px as number) * cd.s, (py as number) * cd.s, (pz as number) * cd.s);
        g.add(m);
      });
      g.position.set(cd.x, cd.y, cd.z);
      clouds.push(g);
      scene.add(g);
    });

    // === BIRDS flying below ===
    const birds: THREE.Group[] = [];
    for (let i = 0; i < 4; i++) {
      const g = new THREE.Group();
      const mat = new THREE.MeshLambertMaterial({ color: 0x333333 + Math.floor(Math.random() * 0x333333) });
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 4), mat);
      body.scale.set(1, 0.6, 1.5);
      g.add(body);
      const wingMat = new THREE.MeshLambertMaterial({ color: mat.color.getHex(), transparent: true, opacity: 0.9 });
      for (const side of [-1, 1]) {
        const wing = new THREE.Mesh(new THREE.SphereGeometry(0.08, 5, 3), wingMat);
        wing.position.set(side * 0.12, 0.02, 0);
        wing.scale.set(2, 0.2, 1);
        wing.userData = { isWing: true, side };
        g.add(wing);
      }
      g.position.set((Math.random() - 0.5) * 20, 10 + Math.random() * 8, (Math.random() - 0.5) * 15);
      g.userData = { speed: 0.03 + Math.random() * 0.03, phase: Math.random() * 10 };
      birds.push(g);
      scene.add(g);
    }

    // === ANIMATION ===
    let time = 0;
    const clock = new THREE.Clock();

    function animate() {
      frameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      time += delta;

      // Gentle camera sway (3/4 view orbiting slowly)
      const camAngle = time * 0.12;
      camera.position.x = 18 * Math.cos(camAngle) + Math.sin(time * 0.2) * 1.0;
      camera.position.z = 22 * Math.sin(camAngle) + Math.cos(time * 0.15) * 0.8;
      camera.position.y = 16 + Math.sin(time * 0.15) * 0.8;
      camera.lookAt(0, 3, 0);

      // Nest gentle rock
      nestGroup.rotation.z = Math.sin(time * 0.5) * 0.02;

      // Lighthouse light pulse
      lhLight.intensity = 1.0 + Math.sin(time * 2) * 0.5;

      // Water animation
      waterTex.offset.x = time * 0.012;
      waterTex.offset.y = time * 0.008;

      // Clouds drift
      clouds.forEach((c, i) => {
        c.position.x += cloudData[i].sp;
        if (c.position.x > 30) c.position.x = -30;
      });

      // Birds circle
      birds.forEach((b) => {
        const sp = b.userData.speed;
        const ph = b.userData.phase;
        b.position.x += Math.cos(time * sp + ph) * 0.02;
        b.position.z += Math.sin(time * sp + ph) * 0.02;
        b.position.y += Math.sin(time * 2 + ph) * 0.003;
        b.rotation.y = Math.atan2(Math.cos(time * sp + ph), Math.sin(time * sp + ph));
        b.children.forEach((child) => {
          if (child.userData?.isWing) {
            child.rotation.z = Math.sin(time * 12 + ph) * 0.5 * child.userData.side;
          }
        });
      });

      renderer.render(scene, camera);
    }
    animate();

    function handleResize() {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 w-full h-full" style={{ zIndex: 0 }} />;
}

export { NestScene3D };
