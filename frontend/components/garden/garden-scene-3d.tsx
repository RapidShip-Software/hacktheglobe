"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type GardenScene3DProps = { health: number; skyState: "clear" | "cloudy" | "stormy" };

function GardenScene3D({ health, skyState }: GardenScene3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Seeded PRNG so trees/bushes/flowers stay consistent across re-renders
    let _seed = 42;
    const seededRandom = () => { _seed = (_seed * 16807 + 0) % 2147483647; return (_seed - 1) / 2147483646; };
    const rand = seededRandom;

    const scene = new THREE.Scene();
    const skyColor = skyState === "clear" ? 0x87ceeb : skyState === "cloudy" ? 0xb0c4de : 0x708090;
    scene.background = new THREE.Color(skyColor);
    scene.fog = new THREE.Fog(skyColor, 25, 60);

    const isPortrait = container.clientHeight > container.clientWidth;
    const fov = isPortrait ? 65 : 50;
    const camZ = isPortrait ? 20 : 18;
    const camera = new THREE.PerspectiveCamera(fov, container.clientWidth / container.clientHeight, 0.1, 200);
    camera.position.set(0, 6, camZ);
    camera.lookAt(0, 1.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // Lighting
    scene.add(new THREE.AmbientLight(0xfff8e1, 0.65));
    const sunLight = new THREE.DirectionalLight(0xfff4e0, 1.8);
    sunLight.position.set(8, 15, 5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(1024, 1024);
    sunLight.shadow.camera.near = 0.5; sunLight.shadow.camera.far = 50;
    sunLight.shadow.camera.left = -25; sunLight.shadow.camera.right = 25;
    sunLight.shadow.camera.top = 25; sunLight.shadow.camera.bottom = -25;
    scene.add(sunLight);
    const fillLight = new THREE.DirectionalLight(0x8ec8f0, 0.25);
    fillLight.position.set(-6, 8, -4);
    scene.add(fillLight);

    // === OUTLINE MATERIAL (inverted hull — must be before any addOutline calls) ===
    const outlineMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });
    function addOutline(mesh: THREE.Mesh, thickness = 0.03) {
      const outline = new THREE.Mesh(mesh.geometry, outlineMat);
      outline.scale.multiplyScalar(1 + thickness);
      mesh.add(outline);
    }

    // === SUN (always visible, warm and bright) ===
    const sunPos = new THREE.Vector3(10, 8, 6);
    const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(1.8, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffee88 }));
    sunMesh.position.copy(sunPos);
    addOutline(sunMesh, 0.02);
    scene.add(sunMesh);
    const glow1 = new THREE.Mesh(new THREE.SphereGeometry(3.0, 16, 16), new THREE.MeshBasicMaterial({ color: 0xfff4b0, transparent: true, opacity: 0.3 }));
    glow1.position.copy(sunPos);
    scene.add(glow1);
    const glow2 = new THREE.Mesh(new THREE.SphereGeometry(5.0, 16, 16), new THREE.MeshBasicMaterial({ color: 0xfffde7, transparent: true, opacity: 0.12 }));
    glow2.position.copy(sunPos);
    scene.add(glow2);
    // Sun rays (subtle radial lines)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const rayGeo = new THREE.CylinderGeometry(0.08, 0.02, 4, 4);
      const rayMat = new THREE.MeshBasicMaterial({ color: 0xfff9c4, transparent: true, opacity: 0.15 });
      const ray = new THREE.Mesh(rayGeo, rayMat);
      ray.position.copy(sunPos);
      ray.position.x += Math.cos(angle) * 3.5;
      ray.position.y += Math.sin(angle) * 3.5;
      ray.rotation.z = angle + Math.PI / 2;
      scene.add(ray);
    }

    // === PROCEDURAL TEXTURES ===
    function makeGrassTexture() {
      const c = document.createElement("canvas"); c.width = 256; c.height = 256;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#3da55c"; ctx.fillRect(0, 0, 256, 256);
      const greens = ["#35974f", "#42b066", "#2e8a45", "#4aba6e", "#339950", "#3da55c"];
      for (let i = 0; i < 3000; i++) {
        ctx.strokeStyle = greens[Math.floor(rand() * greens.length)];
        ctx.lineWidth = 0.5 + rand();
        const x = rand() * 256, y = rand() * 256;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (rand() - 0.5) * 3, y - 2 - rand() * 5); ctx.stroke();
      }
      // Add subtle noise
      for (let i = 0; i < 500; i++) {
        ctx.fillStyle = `rgba(${rand() > 0.5 ? 0 : 80}, ${40 + rand() * 60}, ${rand() > 0.5 ? 0 : 30}, 0.08)`;
        ctx.fillRect(rand() * 256, rand() * 256, 2 + rand() * 3, 2 + rand() * 3);
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(12, 12);
      return tex;
    }

    function makeDirtTexture() {
      const c = document.createElement("canvas"); c.width = 128; c.height = 128;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#c4a56a"; ctx.fillRect(0, 0, 128, 128);
      const dirts = ["#b8965a", "#d4b67a", "#a8884e", "#c9a862", "#bfa068"];
      for (let i = 0; i < 800; i++) {
        ctx.fillStyle = dirts[Math.floor(rand() * dirts.length)];
        const s = 1 + rand() * 4;
        ctx.fillRect(rand() * 128, rand() * 128, s, s);
      }
      // Small pebbles
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = `rgba(${120 + rand() * 60}, ${100 + rand() * 50}, ${70 + rand() * 40}, 0.5)`;
        ctx.beginPath(); ctx.arc(rand() * 128, rand() * 128, 1 + rand() * 2, 0, Math.PI * 2); ctx.fill();
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 10);
      return tex;
    }

    function makeBarkTexture() {
      const c = document.createElement("canvas"); c.width = 64; c.height = 128;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#6b3e1e"; ctx.fillRect(0, 0, 64, 128);
      for (let y = 0; y < 128; y += 2) {
        ctx.strokeStyle = `rgba(${50 + rand() * 30}, ${25 + rand() * 20}, ${10 + rand() * 15}, ${0.3 + rand() * 0.3})`;
        ctx.lineWidth = 1 + rand();
        ctx.beginPath();
        ctx.moveTo(0, y + rand() * 2);
        let x = 0;
        while (x < 64) { x += 3 + rand() * 5; ctx.lineTo(x, y + (rand() - 0.5) * 3); }
        ctx.stroke();
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      return tex;
    }

    function makeTerracottaTexture() {
      const c = document.createElement("canvas"); c.width = 128; c.height = 128;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#c0652a"; ctx.fillRect(0, 0, 128, 128);
      for (let i = 0; i < 500; i++) {
        ctx.fillStyle = `rgba(${160 + rand() * 40}, ${80 + rand() * 30}, ${30 + rand() * 20}, 0.15)`;
        ctx.fillRect(rand() * 128, rand() * 128, 1 + rand() * 3, 1 + rand() * 3);
      }
      // Horizontal rings (wheel marks)
      for (let y = 10; y < 128; y += 8 + rand() * 6) {
        ctx.strokeStyle = `rgba(${140 + rand() * 30}, ${60 + rand() * 20}, ${20 + rand() * 15}, 0.2)`;
        ctx.lineWidth = 0.5 + rand();
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(128, y + (rand() - 0.5) * 2); ctx.stroke();
      }
      return new THREE.CanvasTexture(c);
    }

    const grassTex = makeGrassTexture();
    const dirtTex = makeDirtTexture();
    const barkTex = makeBarkTexture();
    const terracottaTex = makeTerracottaTexture();

    // === GROUND ===
    const groundGeo = new THREE.PlaneGeometry(100, 100, 30, 30);
    const gPos = groundGeo.attributes.position;
    for (let i = 0; i < gPos.count; i++) gPos.setZ(i, Math.sin(gPos.getX(i) * 0.15) * 0.25 + Math.cos(gPos.getY(i) * 0.12) * 0.2);
    groundGeo.computeVertexNormals();
    const ground = new THREE.Mesh(groundGeo, new THREE.MeshLambertMaterial({ map: grassTex, color: 0x3da55c }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grass path (dirt texture)
    const path = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 16), new THREE.MeshLambertMaterial({ map: dirtTex, color: 0xd4b07a }));
    path.rotation.x = -Math.PI / 2; path.position.set(0, 0.03, 2); path.receiveShadow = true;
    scene.add(path);

    // === HELPERS ===
    function makeMesh(geo: THREE.BufferGeometry, mat: THREE.Material, px: number, py: number, pz: number, shadow = false, outline = false) {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(px, py, pz);
      if (shadow) m.castShadow = true;
      if (outline) addOutline(m);
      return m;
    }

    function shrub(x: number, z: number, sc: number, col: number) {
      const g = new THREE.Group();
      const mat = new THREE.MeshLambertMaterial({ color: col });
      for (let i = 0; i < 5; i++) {
        const r = (0.25 + rand() * 0.35) * sc;
        const m = new THREE.Mesh(new THREE.SphereGeometry(r, 7, 5), mat);
        m.position.set((rand() - 0.5) * sc * 0.7, r * 0.7, (rand() - 0.5) * sc * 0.5);
        m.castShadow = true;
        addOutline(m, 0.04);
               g.add(m);
      }
      g.position.set(x, 0, z);
      return g;
    }

    function tree(x: number, z: number, sc: number, col: number) {
      const g = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15 * sc, 0.25 * sc, 2.5 * sc, 6), new THREE.MeshLambertMaterial({ map: barkTex, color: 0x6b3e1e }));
      trunk.position.y = 1.25 * sc; trunk.castShadow = true; addOutline(trunk, 0.05); g.add(trunk);
      const fMat = new THREE.MeshLambertMaterial({ color: col });
      [{ r: 1.4, y: 3.0 }, { r: 1.6, y: 3.8 }, { r: 1.2, y: 4.5 }, { r: 0.9, y: 5.0 }, { r: 1.3, y: 3.4 }].forEach((l) => {
        const f = new THREE.Mesh(new THREE.SphereGeometry(l.r * sc, 7, 6), fMat);
        f.position.set((rand() - 0.5) * 0.5 * sc, l.y * sc, (rand() - 0.5) * 0.4 * sc);
        f.castShadow = true; addOutline(f, 0.03); g.add(f);
      });
      g.position.set(x, 0, z); return g;
    }

    // === FLOWER TYPES ===
    // Type 1: Rose (layered petals, round)
    function createRose(x: number, z: number, col: number, sc: number) {
      const g = new THREE.Group();
      g.add(makeMesh(new THREE.CylinderGeometry(0.02, 0.025, 0.35 * sc, 4), new THREE.MeshLambertMaterial({ color: 0x2d7a2d }), 0, 0.175 * sc, 0));
      const fy = 0.38 * sc;
      for (let ring = 0; ring < 3; ring++) {
        const count = 5 + ring * 2;
        const rad = 0.04 * sc + ring * 0.03 * sc;
        const pSize = 0.035 * sc + ring * 0.01 * sc;
        for (let i = 0; i < count; i++) {
          const a = (i / count) * Math.PI * 2;
          const p = new THREE.Mesh(new THREE.SphereGeometry(pSize, 6, 4), new THREE.MeshPhongMaterial({ color: ring === 2 ? col : new THREE.Color(col).lerp(new THREE.Color(0xffffff), 0.2 - ring * 0.1).getHex(), shininess: 20 }));
          p.position.set(Math.cos(a) * rad, fy - ring * 0.01, Math.sin(a) * rad);
          p.scale.y = 0.5; g.add(p);
        }
      }
      g.position.set(x, 0, z); return g;
    }

    // Type 2: Tulip (cup shape)
    function createTulip(x: number, z: number, col: number, sc: number) {
      const g = new THREE.Group();
      g.add(makeMesh(new THREE.CylinderGeometry(0.015, 0.02, 0.45 * sc, 4), new THREE.MeshLambertMaterial({ color: 0x2d7a2d }), 0, 0.225 * sc, 0));
      const fy = 0.45 * sc;
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const p = new THREE.Mesh(new THREE.SphereGeometry(0.05 * sc, 6, 5), new THREE.MeshPhongMaterial({ color: col, shininess: 25 }));
        p.position.set(Math.cos(a) * 0.03 * sc, fy, Math.sin(a) * 0.03 * sc);
        p.scale.set(0.7, 1.2, 0.7);
        g.add(p);
      }
      // Leaves (long, upright)
      for (let i = 0; i < 2; i++) {
        const l = new THREE.Mesh(new THREE.SphereGeometry(0.04 * sc, 5, 3), new THREE.MeshLambertMaterial({ color: 0x3da55c }));
        l.position.set(i === 0 ? -0.06 * sc : 0.06 * sc, 0.15 * sc, 0);
        l.scale.set(0.6, 2.5, 0.4);
        g.add(l);
      }
      g.position.set(x, 0, z); return g;
    }

    // Type 3: Daisy (flat petals radiating out)
    function createDaisy(x: number, z: number, sc: number) {
      const g = new THREE.Group();
      g.add(makeMesh(new THREE.CylinderGeometry(0.015, 0.02, 0.3 * sc, 4), new THREE.MeshLambertMaterial({ color: 0x2d7a2d }), 0, 0.15 * sc, 0));
      const fy = 0.32 * sc;
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        const p = new THREE.Mesh(new THREE.SphereGeometry(0.03 * sc, 5, 4), new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 15 }));
        p.position.set(Math.cos(a) * 0.06 * sc, fy, Math.sin(a) * 0.06 * sc);
        p.scale.set(1.5, 0.3, 0.6); p.rotation.y = a;
        g.add(p);
      }
      const c = new THREE.Mesh(new THREE.SphereGeometry(0.025 * sc, 6, 4), new THREE.MeshPhongMaterial({ color: 0xfde047, shininess: 30 }));
      c.position.y = fy + 0.01; g.add(c);
      g.position.set(x, 0, z); return g;
    }

    // Type 4: Lavender (tall spike)
    function createLavender(x: number, z: number, sc: number) {
      const g = new THREE.Group();
      g.add(makeMesh(new THREE.CylinderGeometry(0.012, 0.015, 0.5 * sc, 4), new THREE.MeshLambertMaterial({ color: 0x4a7a4a }), 0, 0.25 * sc, 0));
      for (let y = 0.35; y < 0.6; y += 0.04) {
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2 + y * 3;
          const b = new THREE.Mesh(new THREE.SphereGeometry(0.018 * sc, 4, 3), new THREE.MeshPhongMaterial({ color: 0x9b59b6, shininess: 15 }));
          b.position.set(Math.cos(a) * 0.025 * sc, y * sc, Math.sin(a) * 0.025 * sc);
          g.add(b);
        }
      }
      g.position.set(x, 0, z); return g;
    }

    // Type 5: Sunflower (large, yellow)
    function createSunflower(x: number, z: number, sc: number) {
      const g = new THREE.Group();
      g.add(makeMesh(new THREE.CylinderGeometry(0.025, 0.03, 0.55 * sc, 5), new THREE.MeshLambertMaterial({ color: 0x2d7a2d }), 0, 0.275 * sc, 0));
      const fy = 0.58 * sc;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const p = new THREE.Mesh(new THREE.SphereGeometry(0.04 * sc, 5, 4), new THREE.MeshPhongMaterial({ color: 0xfbbf24, shininess: 20 }));
        p.position.set(Math.cos(a) * 0.06 * sc, fy, Math.sin(a) * 0.06 * sc);
        p.scale.set(1.3, 0.3, 0.6); p.rotation.y = a;
        g.add(p);
      }
      const c = new THREE.Mesh(new THREE.SphereGeometry(0.04 * sc, 6, 5), new THREE.MeshPhongMaterial({ color: 0x6b3e1e, shininess: 10 }));
      c.position.y = fy + 0.01; g.add(c);
      // Big leaves
      for (let i = 0; i < 2; i++) {
        const l = new THREE.Mesh(new THREE.SphereGeometry(0.06 * sc, 5, 4), new THREE.MeshLambertMaterial({ color: 0x3da55c }));
        l.position.set(i === 0 ? -0.1 * sc : 0.1 * sc, 0.2 * sc, 0);
        l.scale.set(1.8, 0.4, 0.8);
        g.add(l);
      }
      g.position.set(x, 0, z); return g;
    }

    const flowerCreators = [
      (x: number, z: number) => createRose(x, z, [0xf472b6, 0xe11d48, 0xf43f5e, 0xec4899][Math.floor(rand() * 4)], 1 + rand() * 0.5),
      (x: number, z: number) => createTulip(x, z, [0xf472b6, 0xfbbf24, 0xc084fc, 0xfb923c, 0xe11d48][Math.floor(rand() * 5)], 1 + rand() * 0.5),
      (x: number, z: number) => createDaisy(x, z, 1 + rand() * 0.4),
      (x: number, z: number) => createLavender(x, z, 1 + rand() * 0.5),
      (x: number, z: number) => createSunflower(x, z, 0.8 + rand() * 0.4),
    ];

    // === PLANT FLOWER BORDERS (varied types) ===
    for (let z = -4; z < 12; z += 0.8 + rand() * 0.4) {
      for (let row = 0; row < 3; row++) {
        const lx = -2.0 - row * 0.9 + (rand() - 0.5) * 0.5;
        scene.add(flowerCreators[Math.floor(rand() * flowerCreators.length)](lx, z + (rand() - 0.5) * 0.4));
        const rx = 2.0 + row * 0.9 + (rand() - 0.5) * 0.5;
        scene.add(flowerCreators[Math.floor(rand() * flowerCreators.length)](rx, z + (rand() - 0.5) * 0.4));
      }
    }

    // === FILL BACKGROUND with more flowers, shrubs, trees ===
    // Scatter flowers everywhere beyond borders
    for (let i = 0; i < 80; i++) {
      const fx = (rand() - 0.5) * 40;
      const fz = (rand() - 0.5) * 30 - 2;
      if (Math.abs(fx) < 5 && fz > -3 && fz < 12) continue; // skip path area
      scene.add(flowerCreators[Math.floor(rand() * flowerCreators.length)](fx, fz));
    }

    // Side hedges
    const sc = [0x2d7a2d, 0x357a35, 0x268026, 0x3a8a3a];
    for (let z = -6; z < 10; z += 2.2) {
      scene.add(shrub(-5.5 + (rand() - 0.5) * 0.3, z, 0.9 + rand() * 0.3, sc[Math.floor(rand() * 4)]));
      scene.add(shrub(5.5 + (rand() - 0.5) * 0.3, z, 0.9 + rand() * 0.3, sc[Math.floor(rand() * 4)]));
    }
    // Back hedge wall (dense)
    for (let x = -20; x <= 20; x += 2) scene.add(shrub(x, -10 + (rand() - 0.5), 1.2 + rand() * 0.6, 0x1e6b1e));
    // Side hedge walls (far)
    for (let z = -12; z < 12; z += 2.5) {
      scene.add(shrub(-10 + (rand() - 0.5), z, 1.0 + rand() * 0.4, 0x1e6b1e));
      scene.add(shrub(10 + (rand() - 0.5), z, 1.0 + rand() * 0.4, 0x1e6b1e));
    }

    // Trees — more, filling edges
    const treePositions = [
      [-8, -6, 1.0], [-6, -8, 0.8], [8, -7, 1.1], [10, -5, 0.7], [-10, -4, 0.9], [6, -9, 0.85],
      [-12, -8, 1.0], [12, -9, 0.9], [-14, -5, 0.8], [14, -6, 0.85], [-9, -12, 1.1], [9, -11, 0.95],
      [-15, -2, 0.7], [15, -3, 0.75], [-7, -14, 0.9], [7, -13, 0.8],
    ];
    treePositions.forEach(([tx, tz, ts]) => scene.add(tree(tx, tz, ts, [0x1a6b1a, 0x228b22, 0x2e8b57][Math.floor(rand() * 3)])));

    // === GARDEN ARCH ===
    const archGroup = new THREE.Group();
    const archMat = new THREE.MeshPhongMaterial({ map: barkTex, color: 0x4a3728, shininess: 15 });
    const pillarGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.5, 6);
    const lp = new THREE.Mesh(pillarGeo, archMat); lp.position.set(-1.2, 1.75, 0); lp.castShadow = true; archGroup.add(lp);
    const rp = new THREE.Mesh(pillarGeo.clone(), archMat); rp.position.set(1.2, 1.75, 0); rp.castShadow = true; archGroup.add(rp);
    const archTop = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.07, 6, 16, Math.PI), archMat);
    archTop.position.set(0, 3.5, 0); archTop.rotation.z = Math.PI; archGroup.add(archTop);
    const vineMat = new THREE.MeshLambertMaterial({ color: 0x2d8a2d });
    for (let i = 0; i < 20; i++) { const a = (i / 20) * Math.PI; const v = new THREE.Mesh(new THREE.SphereGeometry(0.12 + rand() * 0.1, 5, 4), vineMat); v.position.set(Math.cos(a) * 1.25, 3.5 + Math.sin(a) * 1.25, (rand() - 0.5) * 0.2); archGroup.add(v); }
    for (let y = 0.3; y < 3.2; y += 0.35) { const v = new THREE.Mesh(new THREE.SphereGeometry(0.1, 5, 4), vineMat); v.position.set(-1.2 + (rand() - 0.5) * 0.2, y, 0); archGroup.add(v); const v2 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 5, 4), vineMat); v2.position.set(1.2 + (rand() - 0.5) * 0.2, y, 0); archGroup.add(v2); }
    // Arch flowers
    const archCols = [0xf472b6, 0xe11d48, 0xc084fc, 0xfbbf24, 0xfb923c];
    for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI; const f = new THREE.Mesh(new THREE.SphereGeometry(0.07, 5, 4), new THREE.MeshPhongMaterial({ color: archCols[i % 5], shininess: 20 })); f.position.set(Math.cos(a) * 1.38, 3.5 + Math.sin(a) * 1.38, 0.15); archGroup.add(f); }
    archGroup.position.set(0, 0, -5);
    scene.add(archGroup);

    // Big tall tree behind the arch
    scene.add(tree(0, -7, 1.8, 0x1a6b1a));

    // === CENTRAL PLANT ===
    const plantGroup = new THREE.Group();
    const h_val = Math.max(0, Math.min(1, health));
    const plantHeight = 0.4 + h_val * 0.6;
    const stemColorVal = h_val > 0.5 ? 0x22c55e : h_val > 0.2 ? 0x84cc16 : 0x8b7355;
    const leafColorVal = h_val > 0.5 ? 0x4ade80 : h_val > 0.2 ? 0xa3e635 : 0xa16207;
    const petalColorVal = h_val > 0.7 ? 0xf472b6 : h_val > 0.4 ? 0xfbbf24 : 0x999999;
    const petalColorDark = h_val > 0.7 ? 0xdb2777 : h_val > 0.4 ? 0xf59e0b : 0x777777;

    // Pot
    const potBody = makeMesh(new THREE.CylinderGeometry(0.3, 0.38, 0.55, 12), new THREE.MeshPhongMaterial({ map: terracottaTex, color: 0xc0652a, shininess: 30 }), 0, 0.275, 0, true, true);
    plantGroup.add(potBody);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.05, 8, 16), new THREE.MeshPhongMaterial({ color: 0xd4896a, shininess: 40 }));
    rim.position.y = 0.55; rim.rotation.x = Math.PI / 2; addOutline(rim, 0.05); plantGroup.add(rim);
    plantGroup.add(makeMesh(new THREE.CylinderGeometry(0.28, 0.28, 0.06, 12), new THREE.MeshLambertMaterial({ color: 0x5c3a1e }), 0, 0.55, 0));

    // Stem
    const stemBase = 0.58;
    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, stemBase, 0),
      new THREE.Vector3(-0.04, stemBase + plantHeight * 0.35, 0.02),
      new THREE.Vector3(0.02, stemBase + plantHeight * 0.65, -0.015),
      new THREE.Vector3(0, stemBase + plantHeight, 0),
    ]);
    const stemMat = new THREE.MeshPhongMaterial({ color: stemColorVal, shininess: 20 });
    const stemMesh = new THREE.Mesh(new THREE.TubeGeometry(stemCurve, 12, 0.05, 6, false), stemMat);
    stemMesh.castShadow = true;
    plantGroup.add(stemMesh);

    // Branches + leaves (offset leaves outward so they don't clip stem)
    [{ t: 0.35, a: -Math.PI / 3, l: 0.4 }, { t: 0.55, a: Math.PI / 4, l: 0.5 }, { t: 0.72, a: -Math.PI / 5, l: 0.3 }].forEach((bd) => {
      const bs = stemCurve.getPoint(bd.t);
      const be = new THREE.Vector3(bs.x + Math.sin(bd.a) * bd.l, bs.y + bd.l * 0.25, bs.z + Math.cos(bd.a) * 0.1);
      const mid = new THREE.Vector3((bs.x + be.x) / 2, (bs.y + be.y) / 2 + 0.08, (bs.z + be.z) / 2);
      plantGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([bs, mid, be]), 8, 0.025, 5, false), stemMat));
      if (h_val > 0.15) {
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.08 * h_val + 0.03, 7, 5), new THREE.MeshPhongMaterial({ color: leafColorVal, shininess: 15 }));
        // Position leaf at end of branch, offset outward
        leaf.position.set(be.x + Math.sin(bd.a) * 0.06, be.y, be.z + Math.cos(bd.a) * 0.04);
        leaf.scale.set(1.4, 0.3, 0.7);
        leaf.rotation.z = bd.a * 0.4;
        leaf.castShadow = true;
        addOutline(leaf, 0.06);
        plantGroup.add(leaf);
      }
    });

    // Flower head
    const flowerParts: THREE.Mesh[] = [];
    if (h_val > 0.4) {
      const ft = stemCurve.getPoint(1.0);
      const fh = new THREE.Group();
      fh.position.copy(ft);
      fh.rotation.x = Math.PI * 0.38;
      // Inner petals
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const p = new THREE.Mesh(new THREE.SphereGeometry(0.12, 7, 5), new THREE.MeshPhongMaterial({ color: petalColorVal, shininess: 30, emissive: petalColorVal, emissiveIntensity: 0.08 }));
        p.position.set(Math.cos(a) * 0.1, 0, Math.sin(a) * 0.1);
        p.scale.set(1.0, 0.5, 0.7); p.castShadow = true;
        addOutline(p, 0.06);
        flowerParts.push(p); fh.add(p);
      }
      // Outer petals
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2 + 0.25;
        const p = new THREE.Mesh(new THREE.SphereGeometry(0.13, 7, 5), new THREE.MeshPhongMaterial({ color: petalColorDark, shininess: 25 }));
        p.position.set(Math.cos(a) * 0.18, -0.02, Math.sin(a) * 0.18);
        p.scale.set(1.0, 0.45, 0.7); p.castShadow = true;
        addOutline(p, 0.05);
        flowerParts.push(p); fh.add(p);
      }
      // Center
      const fc = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), new THREE.MeshPhongMaterial({ color: 0xfde047, shininess: 50, emissive: 0xfde047, emissiveIntensity: 0.15 }));
      fc.position.set(0, 0.02, 0); addOutline(fc, 0.06); flowerParts.push(fc); fh.add(fc);
      plantGroup.add(fh);
    }

    // Sparkles
    const sparkles: THREE.Mesh[] = [];
    if (h_val > 0.8) {
      for (let i = 0; i < 8; i++) {
        const s = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 4), new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0 }));
        s.position.set((rand() - 0.5) * 1.2, 0.6 + rand() * plantHeight, (rand() - 0.5) * 0.8);
        sparkles.push(s); plantGroup.add(s);
      }
    }

    plantGroup.position.set(0, 0, 3);
    plantGroup.scale.set(2.2, 2.2, 2.2);
    scene.add(plantGroup);

    // === ANIMALS ===
    const eyeWhiteMat = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 60 });
    const eyePupilMat = new THREE.MeshPhongMaterial({ color: 0x111111, shininess: 80 });

    // Rabbit — cute, round, proper proportions
    function createRabbit(x: number, z: number, facing = 0) {
      const g = new THREE.Group();
      const furMat = new THREE.MeshLambertMaterial({ color: 0xf0e6d8 });
      const bellyMat = new THREE.MeshLambertMaterial({ color: 0xfaf5ef });

      // Body (round, sitting position)
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), furMat);
      body.position.set(0, 0.18, 0); body.scale.set(0.85, 0.9, 1.0);
      addOutline(body, 0.04); g.add(body);
      // Belly
      const belly = new THREE.Mesh(new THREE.SphereGeometry(0.12, 7, 5), bellyMat);
      belly.position.set(0, 0.15, 0.08); g.add(belly);

      // Head (large relative to body — cute)
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), furMat);
      head.position.set(0, 0.38, 0.1);
      addOutline(head, 0.04); g.add(head);
      // Cheeks
      const cheekL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 5), furMat);
      cheekL.position.set(-0.08, 0.35, 0.17); cheekL.scale.set(1, 0.8, 0.7); g.add(cheekL);
      const cheekR = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 5), furMat);
      cheekR.position.set(0.08, 0.35, 0.17); cheekR.scale.set(1, 0.8, 0.7); g.add(cheekR);
      // Snout
      const snout = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 5), bellyMat);
      snout.position.set(0, 0.35, 0.21); snout.scale.set(1, 0.7, 0.8); g.add(snout);

      // Eyes (big, cute, with pupils and highlights)
      for (const side of [-1, 1]) {
        const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), eyeWhiteMat);
        eyeWhite.position.set(side * 0.065, 0.42, 0.18);
        g.add(eyeWhite);
        const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 5), eyePupilMat);
        pupil.position.set(side * 0.065, 0.42, 0.21);
        g.add(pupil);
        // Eye highlight
        const highlight = new THREE.Mesh(new THREE.SphereGeometry(0.008, 5, 4), eyeWhiteMat);
        highlight.position.set(side * 0.055, 0.43, 0.225);
        g.add(highlight);
      }

      // Nose (pink triangle-ish)
      const nose = new THREE.Mesh(new THREE.SphereGeometry(0.018, 5, 4), new THREE.MeshPhongMaterial({ color: 0xffaaaa, shininess: 40 }));
      nose.position.set(0, 0.37, 0.24); nose.scale.set(1.2, 0.7, 0.6); g.add(nose);

      // Ears (long, distinctive rabbit ears)
      for (const side of [-1, 1]) {
        // Outer ear
        const ear = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.15, 4, 6), furMat);
        ear.position.set(side * 0.05, 0.56, 0.06);
        ear.rotation.z = side * 0.15;
        ear.rotation.x = -0.1;
        addOutline(ear, 0.05); g.add(ear);
        // Inner ear (pink)
        const innerEar = new THREE.Mesh(new THREE.CapsuleGeometry(0.015, 0.1, 4, 6), new THREE.MeshLambertMaterial({ color: 0xffcccc }));
        innerEar.position.set(side * 0.05, 0.56, 0.075);
        innerEar.rotation.z = side * 0.15;
        innerEar.rotation.x = -0.1;
        g.add(innerEar);
      }

      // Front paws
      for (const side of [-1, 1]) {
        const paw = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 4), furMat);
        paw.position.set(side * 0.08, 0.04, 0.12); paw.scale.set(0.7, 0.5, 1.0);
        g.add(paw);
      }
      // Back feet (larger)
      for (const side of [-1, 1]) {
        const foot = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), furMat);
        foot.position.set(side * 0.1, 0.03, -0.05); foot.scale.set(0.6, 0.4, 1.3);
        addOutline(foot, 0.04); g.add(foot);
      }

      // Fluffy tail
      const tail = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 5), bellyMat);
      tail.position.set(0, 0.2, -0.16);
      addOutline(tail, 0.05); g.add(tail);

      g.rotation.y = facing;
      g.position.set(x, 0.08, z);
      return g;
    }
    scene.add(createRabbit(-2, 6, 0.3));
    const rabbit2 = createRabbit(2, 8, -0.2);
    rabbit2.position.y = 0.2;
    scene.add(rabbit2);

    // Deer — graceful, proper proportions with neck, spots, eyes
    function createDeer(x: number, z: number, facing = 0) {
      const g = new THREE.Group();
      const furMat = new THREE.MeshLambertMaterial({ color: 0xc4883e });
      const lightFurMat = new THREE.MeshLambertMaterial({ color: 0xe8c88a });
      const darkMat = new THREE.MeshLambertMaterial({ color: 0x8b5e3c });

      // Body (elongated)
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), furMat);
      body.position.set(0, 0.55, 0); body.scale.set(0.65, 0.55, 1.1);
      addOutline(body, 0.03); g.add(body);
      // Belly (lighter underside)
      const belly = new THREE.Mesh(new THREE.SphereGeometry(0.22, 7, 5), lightFurMat);
      belly.position.set(0, 0.48, 0); belly.scale.set(0.5, 0.35, 0.9); g.add(belly);

      // White spots on back
      for (let i = 0; i < 6; i++) {
        const spot = new THREE.Mesh(new THREE.SphereGeometry(0.025, 5, 4), lightFurMat);
        spot.position.set((rand() - 0.5) * 0.2, 0.6 + rand() * 0.1, (rand() - 0.5) * 0.25);
        g.add(spot);
      }

      // Neck (connecting body to head)
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.3, 6), furMat);
      neck.position.set(0, 0.78, 0.25); neck.rotation.x = 0.4;
      g.add(neck);

      // Head
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), furMat);
      head.position.set(0, 0.9, 0.35);
      addOutline(head, 0.04); g.add(head);
      // Snout (elongated, deer-like)
      const snout = new THREE.Mesh(new THREE.SphereGeometry(0.06, 7, 5), furMat);
      snout.position.set(0, 0.85, 0.45); snout.scale.set(0.7, 0.6, 1.2);
      g.add(snout);
      // Nose (dark)
      const nose = new THREE.Mesh(new THREE.SphereGeometry(0.025, 5, 4), new THREE.MeshPhongMaterial({ color: 0x333333, shininess: 40 }));
      nose.position.set(0, 0.86, 0.52); g.add(nose);

      // Eyes (large, gentle, on sides of head)
      for (const side of [-1, 1]) {
        const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), eyeWhiteMat);
        eyeWhite.position.set(side * 0.1, 0.93, 0.38);
        g.add(eyeWhite);
        const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 5), eyePupilMat);
        pupil.position.set(side * 0.11, 0.93, 0.4);
        g.add(pupil);
        const highlight = new THREE.Mesh(new THREE.SphereGeometry(0.006, 5, 4), eyeWhiteMat);
        highlight.position.set(side * 0.105, 0.94, 0.415);
        g.add(highlight);
      }

      // Ears (pointed, deer-like, angled outward)
      for (const side of [-1, 1]) {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 5), furMat);
        ear.position.set(side * 0.1, 1.02, 0.3);
        ear.rotation.z = side * 0.5;
        ear.rotation.x = -0.2;
        addOutline(ear, 0.05); g.add(ear);
        const innerEar = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.08, 4), new THREE.MeshLambertMaterial({ color: 0xffcccc }));
        innerEar.position.set(side * 0.1, 1.02, 0.32);
        innerEar.rotation.z = side * 0.5;
        innerEar.rotation.x = -0.2;
        g.add(innerEar);
      }

      // Antlers (branching)
      for (const side of [-1, 1]) {
        const antlerMat = new THREE.MeshLambertMaterial({ color: 0x6b4e2a });
        // Main stem
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.3, 4), antlerMat);
        stem.position.set(side * 0.06, 1.15, 0.28);
        stem.rotation.z = side * 0.25; stem.rotation.x = -0.15;
        g.add(stem);
        // Branch 1
        const branch1 = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.015, 0.15, 4), antlerMat);
        branch1.position.set(side * 0.08, 1.25, 0.25);
        branch1.rotation.z = side * 0.6; branch1.rotation.x = -0.2;
        g.add(branch1);
        // Branch 2
        const branch2 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.1, 4), antlerMat);
        branch2.position.set(side * 0.05, 1.28, 0.3);
        branch2.rotation.z = side * -0.2; branch2.rotation.x = -0.4;
        g.add(branch2);
      }

      // Legs (slender, proper deer legs with hooves)
      const legPositions = [
        { x: -0.1, z: 0.2 }, { x: 0.1, z: 0.2 }, // front
        { x: -0.1, z: -0.2 }, { x: 0.1, z: -0.2 }, // back
      ];
      legPositions.forEach((lp, i) => {
        // Upper leg
        const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.025, 0.3, 5), furMat);
        upper.position.set(lp.x, 0.35, lp.z); g.add(upper);
        // Lower leg
        const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.018, 0.2, 5), darkMat);
        lower.position.set(lp.x, 0.12, lp.z); g.add(lower);
        // Hoof
        const hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.025, 0.04, 5), new THREE.MeshLambertMaterial({ color: 0x333333 }));
        hoof.position.set(lp.x, 0.02, lp.z); g.add(hoof);
      });

      // Tail (short, upright)
      const tail = new THREE.Mesh(new THREE.SphereGeometry(0.03, 5, 4), lightFurMat);
      tail.position.set(0, 0.6, -0.3); tail.scale.set(0.8, 1.5, 0.6);
      g.add(tail);

      g.rotation.y = facing;
      g.position.set(x, 0.1, z);
      return g;
    }
    scene.add(createDeer(-4, 4, 0.5));
    const deer2 = createDeer(7, 3, -0.6);
    deer2.position.y = 0.25;
    scene.add(deer2);

    // === BIRDS ===
    function createBird(startX: number, y: number, z: number, speed: number, color: number) {
      const g = new THREE.Group();
      const mat = new THREE.MeshLambertMaterial({ color });
      // Body
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 4), mat);
      body.scale.set(1, 0.6, 1.5); g.add(body);
      // Wings
      const wingMat = new THREE.MeshLambertMaterial({ color, transparent: true, opacity: 0.9 });
      const lWing = new THREE.Mesh(new THREE.SphereGeometry(0.06, 5, 3), wingMat);
      lWing.position.set(-0.1, 0.02, 0); lWing.scale.set(2, 0.2, 1);
      lWing.userData = { isWing: true, side: -1 }; g.add(lWing);
      const rWing = new THREE.Mesh(new THREE.SphereGeometry(0.06, 5, 3), wingMat);
      rWing.position.set(0.1, 0.02, 0); rWing.scale.set(2, 0.2, 1);
      rWing.userData = { isWing: true, side: 1 }; g.add(rWing);
      // Beak
      const beak = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.05, 4), new THREE.MeshLambertMaterial({ color: 0xffa000 }));
      beak.position.set(0, 0, 0.12); beak.rotation.x = Math.PI / 2; g.add(beak);
      g.position.set(startX, y, z);
      g.userData = { speed, startX };
      return g;
    }

    const birds: THREE.Group[] = [];
    const birdData = [
      { x: -15, y: 8, z: -5, sp: 0.04, col: 0x333333 },
      { x: 10, y: 9, z: -7, sp: -0.03, col: 0x555555 },
      { x: -8, y: 7.5, z: -3, sp: 0.05, col: 0x4a4a4a },
      { x: 5, y: 8.5, z: -6, sp: -0.035, col: 0x3a3a3a },
      { x: -12, y: 9.5, z: -8, sp: 0.045, col: 0x666666 },
    ];
    birdData.forEach((bd) => {
      const b = createBird(bd.x, bd.y, bd.z, bd.sp, bd.col);
      birds.push(b); scene.add(b);
    });

    // === CLOUDS ===
    const clouds: THREE.Group[] = [];
    const cloudData = [{ x: -12, y: 10, z: -8, s: 1.5, sp: 0.008 }, { x: 5, y: 12, z: -12, s: 2.0, sp: 0.005 }, { x: -5, y: 11, z: -10, s: 1.2, sp: 0.007 }, { x: 15, y: 9, z: -9, s: 1.8, sp: 0.006 }, { x: -18, y: 10.5, z: -11, s: 1.4, sp: 0.009 }];
    cloudData.forEach((cd) => {
      const g = new THREE.Group();
      const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 });
      [[0, 0, 0, 1], [1, 0.2, 0.2, 0.8], [-0.9, 0.1, -0.1, 0.75], [0.4, 0.4, 0, 0.6], [-0.4, 0.3, 0.2, 0.65]].forEach(([px, py, pz, s]) => {
        g.add(makeMesh(new THREE.SphereGeometry((s as number) * cd.s, 7, 6), mat, (px as number) * cd.s, (py as number) * cd.s, (pz as number) * cd.s));
      });
      g.position.set(cd.x, cd.y, cd.z); clouds.push(g); scene.add(g);
    });

    // === 3D BUTTERFLIES ===
    const butterflies: THREE.Group[] = [];
    const bfColors = [0x60a5fa, 0x4ade80, 0xfb923c, 0xc084fc, 0xf472b6, 0xfbbf24];
    const bfData = [
      { col: 0, x: -3, y: 2.5, z: 5, sp: 0.7, r: 3 },
      { col: 1, x: 4, y: 3, z: 2, sp: 0.5, r: 4 },
      { col: 2, x: -1, y: 2, z: 8, sp: 0.6, r: 2.5 },
      { col: 3, x: 2, y: 3.5, z: -1, sp: 0.8, r: 3.5 },
      { col: 4, x: -5, y: 2.2, z: 3, sp: 0.55, r: 2 },
      { col: 5, x: 6, y: 2.8, z: 6, sp: 0.65, r: 3 },
    ];
    bfData.forEach((bd) => {
      const g = new THREE.Group();
      const col = bfColors[bd.col];
      const wingMat = new THREE.MeshPhongMaterial({ color: col, shininess: 30, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
      const bodyMat = new THREE.MeshLambertMaterial({ color: new THREE.Color(col).multiplyScalar(0.6).getHex() });
      // Body
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4), bodyMat);
      body.scale.set(0.5, 0.5, 1.5);
      g.add(body);
      // Wings (4: upper left, upper right, lower left, lower right)
      for (const side of [-1, 1]) {
        const upperWing = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 5), wingMat);
        upperWing.position.set(side * 0.08, 0.02, 0);
        upperWing.scale.set(1.8, 0.15, 1.2);
        upperWing.userData = { isButterfly: true, side, upper: true };
        g.add(upperWing);
        const lowerWing = new THREE.Mesh(new THREE.SphereGeometry(0.08, 5, 4), wingMat);
        lowerWing.position.set(side * 0.06, -0.01, -0.05);
        lowerWing.scale.set(1.4, 0.15, 1.0);
        lowerWing.userData = { isButterfly: true, side, upper: false };
        g.add(lowerWing);
      }
      // Antennae
      for (const side of [-1, 1]) {
        const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.12, 3), bodyMat);
        ant.position.set(side * 0.02, 0.04, 0.08);
        ant.rotation.x = -0.4;
        ant.rotation.z = side * 0.3;
        g.add(ant);
        const tip = new THREE.Mesh(new THREE.SphereGeometry(0.012, 4, 3), wingMat);
        tip.position.set(side * 0.04, 0.09, 0.12);
        g.add(tip);
      }
      g.position.set(bd.x, bd.y, bd.z);
      g.userData = { speed: bd.sp, radius: bd.r, startX: bd.x, startZ: bd.z, phase: rand() * Math.PI * 2 };
      butterflies.push(g);
      scene.add(g);
    });

    // === CANOPY FRAME (overhanging branches at camera edges) ===
    const canopyLeafMat = new THREE.MeshLambertMaterial({ color: 0x228B22, transparent: true, opacity: 0.7 });
    const canopyBranchMat = new THREE.MeshLambertMaterial({ color: 0x4a3218 });
    const canopyLeaves: THREE.Mesh[] = [];
    // Left canopy branch
    const lBranch = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.3, 6, 5), canopyBranchMat);
    lBranch.position.set(-6, 6, 12);
    lBranch.rotation.z = 0.8;
    lBranch.rotation.y = 0.3;
    // scene.add(lBranch); // Removed floating log
    for (let i = 0; i < 12; i++) {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.6 + rand() * 0.4, 6, 5), canopyLeafMat);
      leaf.position.set(-5 + (rand() - 0.5) * 4, 7 + rand() * 2, 11 + (rand() - 0.5) * 3);
      leaf.scale.set(1.5, 0.4, 1.0);
      canopyLeaves.push(leaf);
      // scene.add(leaf);
    }
    // Right canopy branch
    const rBranch = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.25, 5, 5), canopyBranchMat);
    rBranch.position.set(7, 6.5, 13);
    rBranch.rotation.z = -0.7;
    rBranch.rotation.y = -0.2;
    // scene.add(rBranch);
    for (let i = 0; i < 10; i++) {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.5 + rand() * 0.3, 6, 5), canopyLeafMat);
      leaf.position.set(6 + (rand() - 0.5) * 3, 7.5 + rand() * 1.5, 12 + (rand() - 0.5) * 2);
      leaf.scale.set(1.4, 0.35, 0.9);
      canopyLeaves.push(leaf);
      // scene.add(leaf);
    }

    // === FIREFLIES ===
    const fireflies: THREE.Mesh[] = [];
    for (let i = 0; i < 15; i++) {
      const ff = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 5, 4),
        new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0 })
      );
      ff.position.set(
        (rand() - 0.5) * 14,
        0.5 + rand() * 4,
        (rand() - 0.5) * 14 + 2
      );
      ff.userData = { phase: rand() * Math.PI * 2, driftX: (rand() - 0.5) * 0.003, driftZ: (rand() - 0.5) * 0.003 };
      fireflies.push(ff);
      scene.add(ff);
    }

    // === ANIMATION ===
    let time = 0;
    function animate() {
      frameRef.current = requestAnimationFrame(animate);
      time += 0.01;
      clouds.forEach((c, i) => { c.position.x += cloudData[i].sp; if (c.position.x > 25) c.position.x = -25; });
      // Birds flying + wing flap
      birds.forEach((b) => {
        b.position.x += b.userData.speed;
        b.position.y += Math.sin(time * 5 + b.userData.startX) * 0.005;
        if (b.position.x > 25) b.position.x = -25;
        if (b.position.x < -25) b.position.x = 25;
        b.children.forEach((child) => {
          if (child.userData?.isWing) {
            child.rotation.z = Math.sin(time * 12 + b.userData.startX) * 0.6 * child.userData.side;
          }
        });
      });
      // Butterflies: figure-8 flight + wing flap
      butterflies.forEach((bf) => {
        const { speed, radius, startX, startZ, phase } = bf.userData;
        bf.position.x = startX + Math.cos(time * speed + phase) * radius;
        bf.position.z = startZ + Math.sin(time * speed * 2 + phase) * radius * 0.5;
        bf.position.y += Math.sin(time * 3 + phase) * 0.003;
        bf.rotation.y = Math.atan2(
          -Math.sin(time * speed + phase) * radius * speed,
          Math.cos(time * speed * 2 + phase) * radius * 0.5 * speed * 2
        );
        bf.children.forEach((child) => {
          if (child.userData?.isButterfly) {
            const flapSpeed = child.userData.upper ? 8 : 9;
            child.rotation.z = Math.sin(time * flapSpeed + phase) * 0.7 * child.userData.side;
          }
        });
      });
      // Canopy leaf sway
      canopyLeaves.forEach((leaf, i) => {
        leaf.rotation.z = Math.sin(time * 0.5 + i * 0.3) * 0.05;
        leaf.rotation.x = Math.sin(time * 0.3 + i * 0.5) * 0.03;
      });
      // Fireflies
      fireflies.forEach((ff, i) => {
        const ph = time * 1.5 + ff.userData.phase;
        (ff.material as THREE.MeshBasicMaterial).opacity = Math.max(0, Math.sin(ph) * 0.6 + 0.1);
        ff.position.x += ff.userData.driftX;
        ff.position.z += ff.userData.driftZ;
        ff.position.y += Math.sin(ph * 0.7) * 0.002;
        if (Math.abs(ff.position.x) > 8) ff.userData.driftX *= -1;
        if (Math.abs(ff.position.z) > 10) ff.userData.driftZ *= -1;
      });
      camera.position.x = Math.sin(time * 0.3) * 0.3;
      camera.position.y = 6 + Math.sin(time * 0.5) * 0.15;
      camera.lookAt(0, 1.5, 0);
      plantGroup.rotation.z = Math.sin(time * 0.8) * 0.015;
      plantGroup.rotation.x = Math.sin(time * 0.6) * 0.008;
      flowerParts.forEach((p, i) => { const s = 1 + Math.sin(time * 2 + i * 0.5) * 0.04; p.scale.x = s; p.scale.z = s * 0.7; });
      sparkles.forEach((s, i) => { const ph = time * 3 + i * 1.2; (s.material as THREE.MeshBasicMaterial).opacity = Math.max(0, Math.sin(ph) * 0.8); s.position.y += Math.sin(ph) * 0.002; const sc = 0.8 + Math.sin(ph) * 0.5; s.scale.set(sc, sc, sc); });
      renderer.render(scene, camera);
    }
    animate();

    function handleResize() { if (!container) return; camera.aspect = container.clientWidth / container.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(container.clientWidth, container.clientHeight); }
    window.addEventListener("resize", handleResize);
    return () => { cancelAnimationFrame(frameRef.current); window.removeEventListener("resize", handleResize); renderer.dispose(); if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement); };
  }, [skyState, health]);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} />;
}

export { GardenScene3D };
