"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type TimeOfDay = "day" | "sunset" | "night";

function TeamScene3D({ timeOfDay = "day" }: { timeOfDay?: TimeOfDay }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const skyCol = timeOfDay === "sunset" ? 0xff8c5a : timeOfDay === "night" ? 0x0d1b2a : 0x87ceeb;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(skyCol);
    scene.fog = new THREE.FogExp2(skyCol, 0.008);

    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 200);
    camera.position.set(6, 4, 8);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = timeOfDay === "night" ? 0.8 : timeOfDay === "sunset" ? 1.1 : 1.4;
    container.appendChild(renderer.domElement);

    // Lighting (adapts to time of day)
    const ambCol = timeOfDay === "night" ? 0x222244 : timeOfDay === "sunset" ? 0xffbe8a : 0xfff8e1;
    const ambInt = timeOfDay === "night" ? 0.3 : timeOfDay === "sunset" ? 0.5 : 0.7;
    scene.add(new THREE.AmbientLight(ambCol, ambInt));
    const skyLight = new THREE.DirectionalLight(
      timeOfDay === "night" ? 0x8888cc : timeOfDay === "sunset" ? 0xff6030 : 0xfff4e0,
      timeOfDay === "night" ? 0.3 : timeOfDay === "sunset" ? 1.0 : 1.4
    );
    skyLight.position.set(-5, 15, -5);
    scene.add(skyLight);

    const outlineMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });
    function addOutline(mesh: THREE.Mesh, thickness = 0.03) {
      const outline = new THREE.Mesh(mesh.geometry, outlineMat);
      outline.scale.multiplyScalar(1 + thickness);
      mesh.add(outline);
    }

    // Ground (grass circle island)
    function makeGrassTexture() {
      const c = document.createElement("canvas"); c.width = 256; c.height = 256;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#2a6b3c"; ctx.fillRect(0, 0, 256, 256);
      const greens = ["#256b35", "#308040", "#1e5a2d"];
      for (let i = 0; i < 1500; i++) {
        ctx.strokeStyle = greens[Math.floor(Math.random() * greens.length)];
        ctx.lineWidth = 0.5 + Math.random();
        const x = Math.random() * 256, y = Math.random() * 256;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (Math.random() - 0.5) * 3, y - 2 - Math.random() * 4); ctx.stroke();
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 4);
      return tex;
    }

    const grassTex = makeGrassTexture();
    const ISLAND_R = 10;
    const island = new THREE.Mesh(
      new THREE.CylinderGeometry(ISLAND_R, ISLAND_R - 0.8, 1.5, 24),
      new THREE.MeshLambertMaterial({ map: grassTex, color: 0x2a6b3c })
    );
    island.position.y = -0.3;
    scene.add(island);

    // Water
    const water = new THREE.Mesh(
      new THREE.CircleGeometry(40, 24),
      new THREE.MeshPhongMaterial({ color: 0x1a3060, shininess: 60, transparent: true, opacity: 0.7 })
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.8;
    scene.add(water);

    // === CAMPFIRE (center) ===
    const campfireGroup = new THREE.Group();

    // Stone ring
    for (let i = 0; i < 10; i++) {
      const sa = (i / 10) * Math.PI * 2;
      const stone = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.2 + Math.random() * 0.1, 0),
        new THREE.MeshLambertMaterial({ color: 0x555555 + Math.floor(Math.random() * 0x222222) })
      );
      stone.position.set(Math.cos(sa) * 1.0, 0.08, Math.sin(sa) * 1.0);
      stone.rotation.set(Math.random(), Math.random(), Math.random());
      campfireGroup.add(stone);
    }

    // Logs
    const logMat = new THREE.MeshLambertMaterial({ color: 0x5C3A1E });
    for (let i = 0; i < 4; i++) {
      const la = (i / 4) * Math.PI * 2 + 0.2;
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.9, 5), logMat);
      log.position.set(Math.cos(la) * 0.35, 0.12, Math.sin(la) * 0.35);
      log.rotation.z = Math.PI / 2; log.rotation.y = la;
      campfireGroup.add(log);
    }

    // Fire (multiple layers)
    const fireMeshes: THREE.Mesh[] = [];
    const fireColors = [0xff4400, 0xff5500, 0xff6600, 0xff8800, 0xffaa00, 0xffcc33, 0xffdd66];
    for (let i = 0; i < 7; i++) {
      const f = new THREE.Mesh(
        new THREE.SphereGeometry(0.18 - i * 0.02, 6, 5),
        new THREE.MeshBasicMaterial({ color: fireColors[i], transparent: true, opacity: 0.85 - i * 0.08 })
      );
      f.position.y = 0.25 + i * 0.18;
      fireMeshes.push(f);
      campfireGroup.add(f);
    }

    // Embers/sparks
    const embers: THREE.Mesh[] = [];
    for (let i = 0; i < 12; i++) {
      const ember = new THREE.Mesh(
        new THREE.SphereGeometry(0.02, 4, 3),
        new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0 })
      );
      ember.position.set(
        (Math.random() - 0.5) * 0.5,
        0.5 + Math.random() * 0.5,
        (Math.random() - 0.5) * 0.5
      );
      ember.userData = { phase: Math.random() * Math.PI * 2, speed: 0.5 + Math.random() * 1.5 };
      embers.push(ember);
      campfireGroup.add(ember);
    }

    // Fire light (warm, flickering)
    const fireLight = new THREE.PointLight(0xff6600, 5, 25);
    fireLight.position.y = 1.2;
    fireLight.castShadow = true;
    campfireGroup.add(fireLight);

    // Secondary warm fill
    const fillLight = new THREE.PointLight(0xff8844, 1, 8);
    fillLight.position.set(0, 1.5, 0);
    campfireGroup.add(fillLight);

    campfireGroup.position.set(0, 0, 0);
    scene.add(campfireGroup);

    // === PURPLE FLAG ===
    const flagGroup = new THREE.Group();
    // Pole
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.06, 4, 6),
      new THREE.MeshLambertMaterial({ color: 0x6b3e1e })
    );
    pole.position.y = 2;
    addOutline(pole, 0.04);
    flagGroup.add(pole);
    // Flag cloth (purple)
    const flagCloth = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 1.0),
      new THREE.MeshLambertMaterial({ color: 0x7c3aed, side: THREE.DoubleSide })
    );
    flagCloth.position.set(0.95, 3.5, 0);
    addOutline(flagCloth, 0.04);
    flagGroup.add(flagCloth);
    // Canopy text on flag (small white tree icon)
    const flagIcon = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 6, 5),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    flagIcon.position.set(0.95, 3.5, 0.02);
    flagGroup.add(flagIcon);
    flagGroup.position.set(3, 0, -2);
    scene.add(flagGroup);

    // === LOG SEATS (4 around campfire) ===
    const seatData = [
      { x: -2.5, z: 0, ry: 0 }, { x: 2.5, z: 0, ry: Math.PI },
      { x: 0, z: -2.5, ry: Math.PI / 2 }, { x: 0, z: 2.5, ry: -Math.PI / 2 },
    ];
    seatData.forEach((sp) => {
      const seat = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.25, 1.6, 6),
        logMat
      );
      seat.position.set(sp.x, 0.3, sp.z);
      seat.rotation.z = Math.PI / 2;
      seat.rotation.y = sp.ry;
      addOutline(seat, 0.03);
      scene.add(seat);
    });

    // === TREES (ring around edges, dark silhouettes) ===
    const treeMat = new THREE.MeshLambertMaterial({ color: 0x0a3a15 });
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x3a2510 });
    for (let a = 0; a < Math.PI * 2; a += 0.4 + Math.random() * 0.3) {
      const r = ISLAND_R - 2.5 + (Math.random() - 0.5) * 1.5;
      const tx = Math.cos(a) * r, tz = Math.sin(a) * r;
      const g = new THREE.Group();
      const sc = 0.6 + Math.random() * 0.4;
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * sc, 0.2 * sc, 2 * sc, 5), trunkMat);
      trunk.position.y = sc; g.add(trunk);
      for (let j = 0; j < 3; j++) {
        const f = new THREE.Mesh(new THREE.SphereGeometry((1 + Math.random() * 0.5) * sc, 6, 5), treeMat);
        f.position.set((Math.random() - 0.5) * 0.4 * sc, (2.5 + j * 0.8) * sc, (Math.random() - 0.5) * 0.3 * sc);
        g.add(f);
      }
      g.position.set(tx, 0, tz);
      scene.add(g);
    }

    // Stars
    for (let i = 0; i < 80; i++) {
      const star = new THREE.Mesh(
        new THREE.SphereGeometry(0.03 + Math.random() * 0.03, 4, 3),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 + Math.random() * 0.5 })
      );
      const a = Math.random() * Math.PI * 2;
      const elev = 0.2 + Math.random() * 0.8;
      const dist = 30 + Math.random() * 20;
      star.position.set(Math.cos(a) * dist, elev * dist * 0.5 + 5, Math.sin(a) * dist);
      star.userData = { twinklePhase: Math.random() * Math.PI * 2 };
      scene.add(star);
    }

    // Moon
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(2, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xeeeedd })
    );
    moon.position.set(-15, 18, -20);
    scene.add(moon);
    const moonGlow = new THREE.Mesh(
      new THREE.SphereGeometry(3.5, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xccccbb, transparent: true, opacity: 0.1 })
    );
    moonGlow.position.copy(moon.position);
    scene.add(moonGlow);

    // === ANIMATION ===
    let time = 0;
    const clock = new THREE.Clock();

    function animate() {
      frameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      time += delta;

      // Camera gentle orbit
      const camAngle = time * 0.08;
      camera.position.x = Math.cos(camAngle) * 8;
      camera.position.z = Math.sin(camAngle) * 8;
      camera.position.y = 4 + Math.sin(time * 0.2) * 0.3;
      camera.lookAt(0, 0.8, 0);

      // Fire flicker
      fireLight.intensity = 2.5 + Math.sin(time * 8) * 0.8 + Math.sin(time * 13) * 0.5;
      fillLight.intensity = 0.8 + Math.sin(time * 6) * 0.3;
      fireMeshes.forEach((f, i) => {
        f.scale.y = 1 + Math.sin(time * (6 + i * 2)) * 0.3;
        f.scale.x = 1 + Math.sin(time * (5 + i * 1.5) + i) * 0.15;
        f.position.y = 0.25 + i * 0.18 + Math.sin(time * (7 + i)) * 0.04;
      });

      // Flag wave
      flagCloth.rotation.y = Math.sin(time * 2) * 0.15;
      flagCloth.position.x = 0.95 + Math.sin(time * 2.5) * 0.05;

      // Embers float up
      embers.forEach((e) => {
        const ph = e.userData.phase;
        const sp = e.userData.speed;
        e.position.y += sp * delta;
        e.position.x += Math.sin(time * 3 + ph) * 0.003;
        (e.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - (e.position.y - 0.5) / 2);
        if (e.position.y > 2.5) {
          e.position.set((Math.random() - 0.5) * 0.3, 0.4, (Math.random() - 0.5) * 0.3);
        }
      });

      // Star twinkle
      scene.children.forEach((child) => {
        if (child.userData?.twinklePhase !== undefined) {
          const m = child as THREE.Mesh;
          if (m.material && (m.material as THREE.MeshBasicMaterial).opacity !== undefined) {
            (m.material as THREE.MeshBasicMaterial).opacity = 0.2 + Math.sin(time * 2 + child.userData.twinklePhase) * 0.4;
          }
        }
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
  }, [timeOfDay]);

  return <div ref={containerRef} className="fixed inset-0 w-full h-full" style={{ zIndex: 0 }} />;
}

export { TeamScene3D };
