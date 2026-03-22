"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

function LandingScene3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.FogExp2(0x87ceeb, 0.008);

    // Camera: aerial view, will orbit
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 300);
    const ORBIT_RADIUS = 35;
    const ORBIT_HEIGHT = 32;
    const ORBIT_SPEED = 0.15; // radians per second
    camera.position.set(0, ORBIT_HEIGHT, ORBIT_RADIUS);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    container.appendChild(renderer.domElement);

    // Lighting
    scene.add(new THREE.AmbientLight(0xfff8e1, 0.7));
    const sunLight = new THREE.DirectionalLight(0xfff4e0, 1.6);
    sunLight.position.set(12, 20, 8);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(1024, 1024);
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 60;
    sunLight.shadow.camera.left = -25;
    sunLight.shadow.camera.right = 25;
    sunLight.shadow.camera.top = 25;
    sunLight.shadow.camera.bottom = -25;
    scene.add(sunLight);
    scene.add(new THREE.HemisphereLight(0xd0eeff, 0xc8f082, 0.5));

    // === OUTLINE MATERIAL ===
    const outlineMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });
    function addOutline(mesh: THREE.Mesh, thickness = 0.03) {
      const outline = new THREE.Mesh(mesh.geometry, outlineMat);
      outline.scale.multiplyScalar(1 + thickness);
      mesh.add(outline);
    }

    // === PROCEDURAL TEXTURES ===
    function makeGrassTexture() {
      const c = document.createElement("canvas"); c.width = 256; c.height = 256;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#3da55c"; ctx.fillRect(0, 0, 256, 256);
      const greens = ["#35974f", "#42b066", "#2e8a45", "#4aba6e", "#339950", "#3da55c"];
      for (let i = 0; i < 3000; i++) {
        ctx.strokeStyle = greens[Math.floor(Math.random() * greens.length)];
        ctx.lineWidth = 0.5 + Math.random();
        const x = Math.random() * 256, y = Math.random() * 256;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (Math.random() - 0.5) * 3, y - 2 - Math.random() * 5); ctx.stroke();
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(8, 8);
      return tex;
    }

    function makeWaterTexture() {
      const c = document.createElement("canvas"); c.width = 256; c.height = 256;
      const ctx = c.getContext("2d")!;
      const grad = ctx.createLinearGradient(0, 0, 256, 256);
      grad.addColorStop(0, "#3b82f6");
      grad.addColorStop(0.5, "#60a5fa");
      grad.addColorStop(1, "#3b82f6");
      ctx.fillStyle = grad; ctx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 200; i++) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 + Math.random() * 0.1})`;
        ctx.lineWidth = 0.5 + Math.random();
        const x = Math.random() * 256, y = Math.random() * 256;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 5 + Math.random() * 15, y + (Math.random() - 0.5) * 2); ctx.stroke();
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 4);
      return tex;
    }

    function makeBarkTexture() {
      const c = document.createElement("canvas"); c.width = 64; c.height = 128;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#6b3e1e"; ctx.fillRect(0, 0, 64, 128);
      for (let y = 0; y < 128; y += 2) {
        ctx.strokeStyle = `rgba(${50 + Math.random() * 30}, ${25 + Math.random() * 20}, ${10 + Math.random() * 15}, ${0.3 + Math.random() * 0.3})`;
        ctx.lineWidth = 1 + Math.random();
        ctx.beginPath();
        ctx.moveTo(0, y + Math.random() * 2);
        let x = 0;
        while (x < 64) { x += 3 + Math.random() * 5; ctx.lineTo(x, y + (Math.random() - 0.5) * 3); }
        ctx.stroke();
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      return tex;
    }

    function makeDirtTexture() {
      const c = document.createElement("canvas"); c.width = 128; c.height = 128;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#c4a56a"; ctx.fillRect(0, 0, 128, 128);
      const dirts = ["#b8965a", "#d4b67a", "#a8884e", "#c9a862", "#bfa068"];
      for (let i = 0; i < 800; i++) {
        ctx.fillStyle = dirts[Math.floor(Math.random() * dirts.length)];
        const s = 1 + Math.random() * 4;
        ctx.fillRect(Math.random() * 128, Math.random() * 128, s, s);
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 10);
      return tex;
    }

    function makeTerracottaTexture() {
      const c = document.createElement("canvas"); c.width = 128; c.height = 128;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#c0652a"; ctx.fillRect(0, 0, 128, 128);
      for (let i = 0; i < 500; i++) {
        ctx.fillStyle = `rgba(${160 + Math.random() * 40}, ${80 + Math.random() * 30}, ${30 + Math.random() * 20}, 0.15)`;
        ctx.fillRect(Math.random() * 128, Math.random() * 128, 1 + Math.random() * 3, 1 + Math.random() * 3);
      }
      return new THREE.CanvasTexture(c);
    }

    const grassTex = makeGrassTexture();
    const waterTex = makeWaterTexture();
    const barkTex = makeBarkTexture();
    const dirtTex = makeDirtTexture();
    const terracottaTex = makeTerracottaTexture();

    // === WATER PLANE (large, beneath everything) ===
    const waterGeo = new THREE.CircleGeometry(80, 32);
    const waterMat = new THREE.MeshPhongMaterial({
      map: waterTex,
      color: 0x4a90d9,
      shininess: 80,
      transparent: true,
      opacity: 0.85,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.6;
    scene.add(water);

    // === ISLAND (circular ground, slightly raised with edge taper) ===
    const ISLAND_RADIUS = 16;
    const islandGeo = new THREE.CylinderGeometry(ISLAND_RADIUS, ISLAND_RADIUS - 1, 1.5, 32, 4);
    // Taper the bottom vertices slightly inward for a natural island look
    const iPos = islandGeo.attributes.position;
    for (let i = 0; i < iPos.count; i++) {
      const y = iPos.getY(i);
      if (y < -0.3) {
        const x = iPos.getX(i);
        const z = iPos.getZ(i);
        const dist = Math.sqrt(x * x + z * z);
        if (dist > ISLAND_RADIUS * 0.6) {
          iPos.setY(i, y - (dist / ISLAND_RADIUS) * 0.5);
        }
      }
    }
    islandGeo.computeVertexNormals();

    const islandMat = new THREE.MeshLambertMaterial({ map: grassTex, color: 0x3da55c });
    const island = new THREE.Mesh(islandGeo, islandMat);
    island.position.y = -0.3;
    island.receiveShadow = true;
    scene.add(island);

    // Dirt edge ring (beach)
    const beachGeo = new THREE.TorusGeometry(ISLAND_RADIUS - 0.3, 0.8, 8, 32);
    const beachMat = new THREE.MeshLambertMaterial({ color: 0xe8d5a3 });
    const beach = new THREE.Mesh(beachGeo, beachMat);
    beach.rotation.x = -Math.PI / 2;
    beach.position.y = -0.5;
    scene.add(beach);

    // === SUN ===
    const sunPos = new THREE.Vector3(25, 8, 18);
    const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(2.5, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffee88 }));
    sunMesh.position.copy(sunPos);
    addOutline(sunMesh, 0.02);
    scene.add(sunMesh);
    const glow1 = new THREE.Mesh(new THREE.SphereGeometry(4.0, 16, 16), new THREE.MeshBasicMaterial({ color: 0xfff4b0, transparent: true, opacity: 0.25 }));
    glow1.position.copy(sunPos);
    scene.add(glow1);
    const glow2 = new THREE.Mesh(new THREE.SphereGeometry(6.5, 16, 16), new THREE.MeshBasicMaterial({ color: 0xfffde7, transparent: true, opacity: 0.1 }));
    glow2.position.copy(sunPos);
    scene.add(glow2);
    // Sun rays
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const rayGeo = new THREE.CylinderGeometry(0.1, 0.03, 5, 4);
      const rayMat = new THREE.MeshBasicMaterial({ color: 0xfff9c4, transparent: true, opacity: 0.12 });
      const ray = new THREE.Mesh(rayGeo, rayMat);
      ray.position.copy(sunPos);
      ray.position.x += Math.cos(angle) * 4.5;
      ray.position.y += Math.sin(angle) * 4.5;
      ray.rotation.z = angle + Math.PI / 2;
      scene.add(ray);
    }

    // === HELPERS ===
    function makeMesh(geo: THREE.BufferGeometry, mat: THREE.Material, px: number, py: number, pz: number, shadow = false, outline = false) {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(px, py, pz);
      if (shadow) m.castShadow = true;
      if (outline) addOutline(m);
      return m;
    }

    function isOnIsland(x: number, z: number) {
      return Math.sqrt(x * x + z * z) < ISLAND_RADIUS - 1.5;
    }

    function shrub(x: number, z: number, sc: number, col: number) {
      const g = new THREE.Group();
      const mat = new THREE.MeshLambertMaterial({ color: col });
      for (let i = 0; i < 5; i++) {
        const r = (0.25 + Math.random() * 0.35) * sc;
        const m = new THREE.Mesh(new THREE.SphereGeometry(r, 7, 5), mat);
        m.position.set((Math.random() - 0.5) * sc * 0.7, r * 0.7, (Math.random() - 0.5) * sc * 0.5);
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
        f.position.set((Math.random() - 0.5) * 0.5 * sc, l.y * sc, (Math.random() - 0.5) * 0.4 * sc);
        f.castShadow = true; addOutline(f, 0.03); g.add(f);
      });
      g.position.set(x, 0, z); return g;
    }

    // === FLOWER TYPES ===
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
      g.position.set(x, 0, z); return g;
    }

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
      const ct = new THREE.Mesh(new THREE.SphereGeometry(0.025 * sc, 6, 4), new THREE.MeshPhongMaterial({ color: 0xfde047, shininess: 30 }));
      ct.position.y = fy + 0.01; g.add(ct);
      g.position.set(x, 0, z); return g;
    }

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
      const ct = new THREE.Mesh(new THREE.SphereGeometry(0.04 * sc, 6, 5), new THREE.MeshPhongMaterial({ color: 0x6b3e1e, shininess: 10 }));
      ct.position.y = fy + 0.01; g.add(ct);
      g.position.set(x, 0, z); return g;
    }

    const flowerCreators = [
      (x: number, z: number) => createRose(x, z, [0xf472b6, 0xe11d48, 0xf43f5e, 0xec4899][Math.floor(Math.random() * 4)], 1 + Math.random() * 0.5),
      (x: number, z: number) => createTulip(x, z, [0xf472b6, 0xfbbf24, 0xc084fc, 0xfb923c, 0xe11d48][Math.floor(Math.random() * 5)], 1 + Math.random() * 0.5),
      (x: number, z: number) => createDaisy(x, z, 1 + Math.random() * 0.4),
      (x: number, z: number) => createLavender(x, z, 1 + Math.random() * 0.5),
      (x: number, z: number) => createSunflower(x, z, 0.8 + Math.random() * 0.4),
    ];

    // === DIRT PATH (through center of island) ===
    const path = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 20), new THREE.MeshLambertMaterial({ map: dirtTex, color: 0xd4b07a }));
    path.rotation.x = -Math.PI / 2; path.position.set(0, 0.05, 2); path.receiveShadow = true;
    scene.add(path);

    // === FLOWER BORDERS along path ===
    for (let z = -6; z < 10; z += 0.8 + Math.random() * 0.4) {
      for (let row = 0; row < 2; row++) {
        const lx = -2.0 - row * 0.9 + (Math.random() - 0.5) * 0.5;
        const lz = z + (Math.random() - 0.5) * 0.4;
        if (isOnIsland(lx, lz)) scene.add(flowerCreators[Math.floor(Math.random() * flowerCreators.length)](lx, lz));
        const rx = 2.0 + row * 0.9 + (Math.random() - 0.5) * 0.5;
        if (isOnIsland(rx, lz)) scene.add(flowerCreators[Math.floor(Math.random() * flowerCreators.length)](rx, lz));
      }
    }

    // Scatter flowers across island
    for (let i = 0; i < 100; i++) {
      const fx = (Math.random() - 0.5) * ISLAND_RADIUS * 1.8;
      const fz = (Math.random() - 0.5) * ISLAND_RADIUS * 1.8;
      if (Math.abs(fx) < 3 && fz > -5 && fz < 10) continue; // skip path
      if (!isOnIsland(fx, fz)) continue;
      scene.add(flowerCreators[Math.floor(Math.random() * flowerCreators.length)](fx, fz));
    }

    // === SHRUBS (ring around edge + clusters) ===
    const shrubColors = [0x2d7a2d, 0x357a35, 0x268026, 0x3a8a3a];
    for (let angle = 0; angle < Math.PI * 2; angle += 0.35 + Math.random() * 0.2) {
      const r = ISLAND_RADIUS - 2.5 + (Math.random() - 0.5) * 2;
      const sx = Math.cos(angle) * r;
      const sz = Math.sin(angle) * r;
      if (isOnIsland(sx, sz)) {
        scene.add(shrub(sx, sz, 0.8 + Math.random() * 0.5, shrubColors[Math.floor(Math.random() * 4)]));
      }
    }

    // === TREES (ring around island + some interior) ===
    const treeColors = [0x1a6b1a, 0x228b22, 0x2e8b57];
    // Edge ring
    for (let angle = 0; angle < Math.PI * 2; angle += 0.5 + Math.random() * 0.3) {
      const r = ISLAND_RADIUS - 3 + (Math.random() - 0.5) * 2;
      const tx = Math.cos(angle) * r;
      const tz = Math.sin(angle) * r;
      if (isOnIsland(tx, tz)) {
        scene.add(tree(tx, tz, 0.7 + Math.random() * 0.5, treeColors[Math.floor(Math.random() * 3)]));
      }
    }
    // Interior trees (sparse)
    const interiorTrees = [
      [-5, -4, 1.0], [6, -3, 0.9], [-7, 5, 0.8], [8, 6, 0.85],
      [-3, -7, 0.75], [4, -6, 0.9], [-9, 0, 1.1], [9, 1, 0.95],
    ];
    interiorTrees.forEach(([tx, tz, ts]) => {
      if (isOnIsland(tx, tz)) scene.add(tree(tx, tz, ts, treeColors[Math.floor(Math.random() * 3)]));
    });

    // === GARDEN ARCH ===
    const archGroup = new THREE.Group();
    const archMat = new THREE.MeshPhongMaterial({ map: barkTex, color: 0x4a3728, shininess: 15 });
    const pillarGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.5, 6);
    const lp = new THREE.Mesh(pillarGeo, archMat); lp.position.set(-1.2, 1.75, 0); lp.castShadow = true; archGroup.add(lp);
    const rp = new THREE.Mesh(pillarGeo.clone(), archMat); rp.position.set(1.2, 1.75, 0); rp.castShadow = true; archGroup.add(rp);
    const archTop = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.07, 6, 16, Math.PI), archMat);
    archTop.position.set(0, 3.5, 0); archTop.rotation.z = Math.PI; archGroup.add(archTop);
    const vineMat = new THREE.MeshLambertMaterial({ color: 0x2d8a2d });
    for (let i = 0; i < 20; i++) { const a = (i / 20) * Math.PI; const v = new THREE.Mesh(new THREE.SphereGeometry(0.12 + Math.random() * 0.1, 5, 4), vineMat); v.position.set(Math.cos(a) * 1.25, 3.5 + Math.sin(a) * 1.25, (Math.random() - 0.5) * 0.2); archGroup.add(v); }
    const archCols = [0xf472b6, 0xe11d48, 0xc084fc, 0xfbbf24, 0xfb923c];
    for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI; const f = new THREE.Mesh(new THREE.SphereGeometry(0.07, 5, 4), new THREE.MeshPhongMaterial({ color: archCols[i % 5], shininess: 20 })); f.position.set(Math.cos(a) * 1.38, 3.5 + Math.sin(a) * 1.38, 0.15); archGroup.add(f); }
    archGroup.position.set(0, 0, -4);
    scene.add(archGroup);

    // === CENTRAL PLANT (healthy, blooming for landing page) ===
    const plantGroup = new THREE.Group();
    const plantHeight = 0.9;
    const stemMat = new THREE.MeshPhongMaterial({ color: 0x22c55e, shininess: 20 });

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
    plantGroup.add(new THREE.Mesh(new THREE.TubeGeometry(stemCurve, 12, 0.05, 6, false), stemMat));

    // Branches + leaves
    [{ t: 0.35, a: -Math.PI / 3, l: 0.4 }, { t: 0.55, a: Math.PI / 4, l: 0.5 }, { t: 0.72, a: -Math.PI / 5, l: 0.3 }].forEach((bd) => {
      const bs = stemCurve.getPoint(bd.t);
      const be = new THREE.Vector3(bs.x + Math.sin(bd.a) * bd.l, bs.y + bd.l * 0.25, bs.z + Math.cos(bd.a) * 0.1);
      const mid = new THREE.Vector3((bs.x + be.x) / 2, (bs.y + be.y) / 2 + 0.08, (bs.z + be.z) / 2);
      plantGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([bs, mid, be]), 8, 0.025, 5, false), stemMat));
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.11, 7, 5), new THREE.MeshPhongMaterial({ color: 0x4ade80, shininess: 15 }));
      leaf.position.set(be.x + Math.sin(bd.a) * 0.06, be.y, be.z + Math.cos(bd.a) * 0.04);
      leaf.scale.set(1.4, 0.3, 0.7);
      leaf.rotation.z = bd.a * 0.4;
      leaf.castShadow = true;
      addOutline(leaf, 0.06);
      plantGroup.add(leaf);
    });

    // Flower head (blooming)
    const flowerParts: THREE.Mesh[] = [];
    const ft = stemCurve.getPoint(1.0);
    const fh = new THREE.Group();
    fh.position.copy(ft);
    fh.rotation.x = Math.PI * 0.38;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const p = new THREE.Mesh(new THREE.SphereGeometry(0.12, 7, 5), new THREE.MeshPhongMaterial({ color: 0xf472b6, shininess: 30, emissive: 0xf472b6, emissiveIntensity: 0.08 }));
      p.position.set(Math.cos(a) * 0.1, 0, Math.sin(a) * 0.1);
      p.scale.set(1.0, 0.5, 0.7); p.castShadow = true;
      addOutline(p, 0.06);
      flowerParts.push(p); fh.add(p);
    }
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + 0.25;
      const p = new THREE.Mesh(new THREE.SphereGeometry(0.13, 7, 5), new THREE.MeshPhongMaterial({ color: 0xdb2777, shininess: 25 }));
      p.position.set(Math.cos(a) * 0.18, -0.02, Math.sin(a) * 0.18);
      p.scale.set(1.0, 0.45, 0.7); p.castShadow = true;
      addOutline(p, 0.05);
      flowerParts.push(p); fh.add(p);
    }
    const fc = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), new THREE.MeshPhongMaterial({ color: 0xfde047, shininess: 50, emissive: 0xfde047, emissiveIntensity: 0.15 }));
    fc.position.set(0, 0.02, 0); addOutline(fc, 0.06); flowerParts.push(fc); fh.add(fc);
    plantGroup.add(fh);

    // Sparkles
    const sparkles: THREE.Mesh[] = [];
    for (let i = 0; i < 8; i++) {
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 4), new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0 }));
      s.position.set((Math.random() - 0.5) * 1.2, 0.6 + Math.random() * plantHeight, (Math.random() - 0.5) * 0.8);
      sparkles.push(s); plantGroup.add(s);
    }

    plantGroup.position.set(0, 0, 3);
    plantGroup.scale.set(2.5, 2.5, 2.5);
    scene.add(plantGroup);

    // === ANIMALS ===
    const eyeWhiteMat = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 60 });
    const eyePupilMat = new THREE.MeshPhongMaterial({ color: 0x111111, shininess: 80 });

    function createRabbit(x: number, z: number, facing = 0) {
      const g = new THREE.Group();
      const furMat = new THREE.MeshLambertMaterial({ color: 0xf0e6d8 });
      const bellyMat = new THREE.MeshLambertMaterial({ color: 0xfaf5ef });
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), furMat);
      body.position.set(0, 0.18, 0); body.scale.set(0.85, 0.9, 1.0); addOutline(body, 0.04); g.add(body);
      const belly = new THREE.Mesh(new THREE.SphereGeometry(0.12, 7, 5), bellyMat);
      belly.position.set(0, 0.15, 0.08); g.add(belly);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), furMat);
      head.position.set(0, 0.38, 0.1); addOutline(head, 0.04); g.add(head);
      const nose = new THREE.Mesh(new THREE.SphereGeometry(0.018, 5, 4), new THREE.MeshPhongMaterial({ color: 0xffaaaa, shininess: 40 }));
      nose.position.set(0, 0.37, 0.24); nose.scale.set(1.2, 0.7, 0.6); g.add(nose);
      for (const side of [-1, 1]) {
        const ew = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), eyeWhiteMat);
        ew.position.set(side * 0.065, 0.42, 0.18); g.add(ew);
        const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 5), eyePupilMat);
        pupil.position.set(side * 0.065, 0.42, 0.21); g.add(pupil);
        const ear = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.15, 4, 6), furMat);
        ear.position.set(side * 0.05, 0.56, 0.06); ear.rotation.z = side * 0.15; addOutline(ear, 0.05); g.add(ear);
      }
      const tail = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 5), bellyMat);
      tail.position.set(0, 0.2, -0.16); addOutline(tail, 0.05); g.add(tail);
      g.rotation.y = facing;
      g.position.set(x, 0.08, z);
      return g;
    }

    function createDeer(x: number, z: number, facing = 0) {
      const g = new THREE.Group();
      const furMat = new THREE.MeshLambertMaterial({ color: 0xc4883e });
      const lightFurMat = new THREE.MeshLambertMaterial({ color: 0xe8c88a });
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), furMat);
      body.position.set(0, 0.55, 0); body.scale.set(0.65, 0.55, 1.1); addOutline(body, 0.03); g.add(body);
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.3, 6), furMat);
      neck.position.set(0, 0.78, 0.25); neck.rotation.x = 0.4; g.add(neck);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), furMat);
      head.position.set(0, 0.9, 0.35); addOutline(head, 0.04); g.add(head);
      for (const side of [-1, 1]) {
        const ew = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), eyeWhiteMat);
        ew.position.set(side * 0.1, 0.93, 0.38); g.add(ew);
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 5), furMat);
        ear.position.set(side * 0.1, 1.02, 0.3); ear.rotation.z = side * 0.5; addOutline(ear, 0.05); g.add(ear);
        const antlerMat = new THREE.MeshLambertMaterial({ color: 0x6b4e2a });
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.3, 4), antlerMat);
        stem.position.set(side * 0.06, 1.15, 0.28); stem.rotation.z = side * 0.25; g.add(stem);
      }
      const legPositions = [{ x: -0.1, z: 0.2 }, { x: 0.1, z: 0.2 }, { x: -0.1, z: -0.2 }, { x: 0.1, z: -0.2 }];
      legPositions.forEach((lpos) => {
        const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.025, 0.3, 5), furMat);
        upper.position.set(lpos.x, 0.35, lpos.z); g.add(upper);
        const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.018, 0.2, 5), new THREE.MeshLambertMaterial({ color: 0x8b5e3c }));
        lower.position.set(lpos.x, 0.12, lpos.z); g.add(lower);
      });
      const tail = new THREE.Mesh(new THREE.SphereGeometry(0.03, 5, 4), lightFurMat);
      tail.position.set(0, 0.6, -0.3); tail.scale.set(0.8, 1.5, 0.6); g.add(tail);
      g.rotation.y = facing;
      g.position.set(x, 0.1, z);
      return g;
    }

    // Place animals
    scene.add(createRabbit(-3, 5, 0.3));
    scene.add(createRabbit(3, 7, -0.5));
    scene.add(createRabbit(6, -2, 1.2));
    scene.add(createDeer(-6, 3, 0.5));
    scene.add(createDeer(7, 2, -0.6));

    // === BIRDS ===
    function createBird(startX: number, y: number, z: number, speed: number, color: number) {
      const g = new THREE.Group();
      const mat = new THREE.MeshLambertMaterial({ color });
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 4), mat);
      body.scale.set(1, 0.6, 1.5); g.add(body);
      const wingMat = new THREE.MeshLambertMaterial({ color, transparent: true, opacity: 0.9 });
      const lWing = new THREE.Mesh(new THREE.SphereGeometry(0.06, 5, 3), wingMat);
      lWing.position.set(-0.1, 0.02, 0); lWing.scale.set(2, 0.2, 1);
      lWing.userData = { isWing: true, side: -1 }; g.add(lWing);
      const rWing = new THREE.Mesh(new THREE.SphereGeometry(0.06, 5, 3), wingMat);
      rWing.position.set(0.1, 0.02, 0); rWing.scale.set(2, 0.2, 1);
      rWing.userData = { isWing: true, side: 1 }; g.add(rWing);
      const beak = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.05, 4), new THREE.MeshLambertMaterial({ color: 0xffa000 }));
      beak.position.set(0, 0, 0.12); beak.rotation.x = Math.PI / 2; g.add(beak);
      g.position.set(startX, y, z);
      g.userData = { speed, startX };
      return g;
    }

    const birds: THREE.Group[] = [];
    const birdData = [
      { x: -15, y: 10, z: -5, sp: 0.04, col: 0x333333 },
      { x: 10, y: 11, z: -7, sp: -0.03, col: 0x555555 },
      { x: -8, y: 9, z: -3, sp: 0.05, col: 0x4a4a4a },
      { x: 5, y: 10.5, z: -6, sp: -0.035, col: 0x3a3a3a },
      { x: -12, y: 12, z: -8, sp: 0.045, col: 0x666666 },
    ];
    birdData.forEach((bd) => {
      const b = createBird(bd.x, bd.y, bd.z, bd.sp, bd.col);
      birds.push(b); scene.add(b);
    });

    // === CLOUDS ===
    const clouds: THREE.Group[] = [];
    const cloudData = [
      { x: -18, y: 13, z: -12, s: 2.0, sp: 0.008 },
      { x: 8, y: 15, z: -15, s: 2.5, sp: 0.005 },
      { x: -8, y: 14, z: -14, s: 1.5, sp: 0.007 },
      { x: 20, y: 12, z: -10, s: 2.2, sp: 0.006 },
      { x: -25, y: 13.5, z: -13, s: 1.8, sp: 0.009 },
      { x: 15, y: 16, z: -18, s: 2.8, sp: 0.004 },
    ];
    cloudData.forEach((cd) => {
      const g = new THREE.Group();
      const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 });
      [[0, 0, 0, 1], [1, 0.2, 0.2, 0.8], [-0.9, 0.1, -0.1, 0.75], [0.4, 0.4, 0, 0.6], [-0.4, 0.3, 0.2, 0.65]].forEach(([px, py, pz, s]) => {
        g.add(makeMesh(new THREE.SphereGeometry((s as number) * cd.s, 7, 6), mat, (px as number) * cd.s, (py as number) * cd.s, (pz as number) * cd.s));
      });
      g.position.set(cd.x, cd.y, cd.z); clouds.push(g); scene.add(g);
    });

    // === ANIMATION (orbiting camera) ===
    let time = 0;
    const clock = new THREE.Clock();

    function animate() {
      frameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      time += delta;

      // Orbit camera
      const angle = time * ORBIT_SPEED;
      camera.position.x = Math.cos(angle) * ORBIT_RADIUS;
      camera.position.z = Math.sin(angle) * ORBIT_RADIUS;
      camera.position.y = ORBIT_HEIGHT + Math.sin(time * 0.3) * 1.5;
      camera.lookAt(0, 1, 0);

      // Animate water
      waterTex.offset.x = time * 0.015;
      waterTex.offset.y = time * 0.01;

      // Clouds drift
      clouds.forEach((c, i) => {
        c.position.x += cloudData[i].sp;
        if (c.position.x > 30) c.position.x = -30;
      });

      // Birds fly + wing flap
      birds.forEach((b) => {
        b.position.x += b.userData.speed;
        b.position.y += Math.sin(time * 5 + b.userData.startX) * 0.005;
        if (b.position.x > 30) b.position.x = -30;
        if (b.position.x < -30) b.position.x = 30;
        b.children.forEach((child) => {
          if (child.userData?.isWing) {
            child.rotation.z = Math.sin(time * 12 + b.userData.startX) * 0.6 * child.userData.side;
          }
        });
      });

      // Plant sway
      plantGroup.rotation.z = Math.sin(time * 0.8) * 0.015;
      plantGroup.rotation.x = Math.sin(time * 0.6) * 0.008;
      flowerParts.forEach((p, i) => { const s = 1 + Math.sin(time * 2 + i * 0.5) * 0.04; p.scale.x = s; p.scale.z = s * 0.7; });
      sparkles.forEach((s, i) => { const ph = time * 3 + i * 1.2; (s.material as THREE.MeshBasicMaterial).opacity = Math.max(0, Math.sin(ph) * 0.8); s.position.y += Math.sin(ph) * 0.002; const sc = 0.8 + Math.sin(ph) * 0.5; s.scale.set(sc, sc, sc); });

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

  return <div ref={containerRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} />;
}

export { LandingScene3D };
