"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type FlyTarget = "garden" | "nest" | "clinical";
type FlyToFn = (target: FlyTarget) => Promise<void>;

type LandingScene3DProps = {
  flyToRef?: React.MutableRefObject<FlyToFn | null>;
  initialFlyFrom?: FlyTarget;
};

function LandingScene3D({ flyToRef, initialFlyFrom }: LandingScene3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.FogExp2(0x87ceeb, 0.004);

    // Camera: aerial view, will orbit. Wider FOV on portrait/mobile to show all islands
    const isPortrait = container.clientHeight > container.clientWidth;
    const baseFov = isPortrait ? 72 : 45;
    const camera = new THREE.PerspectiveCamera(baseFov, container.clientWidth / container.clientHeight, 0.1, 300);
    const ORBIT_RADIUS = isPortrait ? 45 : 35;
    const ORBIT_HEIGHT = 40;
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

    // === NEST ISLAND (second island, offset from main) ===
    const NEST_ISLAND_X = -28;
    const NEST_ISLAND_Z = -18;
    const NEST_ISLAND_RADIUS = 9;
    const nestIslandGroup = new THREE.Group();
    nestIslandGroup.position.set(NEST_ISLAND_X, 0, NEST_ISLAND_Z);

    // Island base
    const nestIslandGeo = new THREE.CylinderGeometry(NEST_ISLAND_RADIUS, NEST_ISLAND_RADIUS - 0.8, 1.8, 24, 4);
    const niPos = nestIslandGeo.attributes.position;
    for (let i = 0; i < niPos.count; i++) {
      const y = niPos.getY(i);
      if (y < -0.3) {
        const x = niPos.getX(i);
        const z = niPos.getZ(i);
        const dist = Math.sqrt(x * x + z * z);
        if (dist > NEST_ISLAND_RADIUS * 0.5) {
          niPos.setY(i, y - (dist / NEST_ISLAND_RADIUS) * 0.6);
        }
      }
    }
    nestIslandGeo.computeVertexNormals();
    const nestIsland = new THREE.Mesh(nestIslandGeo, new THREE.MeshLambertMaterial({ map: grassTex, color: 0x3da55c }));
    nestIsland.position.y = -0.2;
    nestIsland.receiveShadow = true;
    nestIslandGroup.add(nestIsland);

    // Beach ring
    const nestBeach = new THREE.Mesh(
      new THREE.TorusGeometry(NEST_ISLAND_RADIUS - 0.2, 0.7, 8, 24),
      new THREE.MeshLambertMaterial({ color: 0xe8d5a3 })
    );
    nestBeach.rotation.x = -Math.PI / 2;
    nestBeach.position.y = -0.5;
    nestIslandGroup.add(nestBeach);

    // === BIG NEST on the island ===
    const bigNestGroup = new THREE.Group();
    const nestRadius = 3.5;

    // Nest bowl (woven twigs ring)
    const bigNestBowl = new THREE.Mesh(
      new THREE.TorusGeometry(nestRadius, 0.9, 10, 20),
      new THREE.MeshLambertMaterial({ color: 0x8B6914 })
    );
    bigNestBowl.rotation.x = -Math.PI / 2;
    addOutline(bigNestBowl, 0.03);
    bigNestGroup.add(bigNestBowl);

    // Nest inner (soft bedding)
    const nestInner = new THREE.Mesh(
      new THREE.CircleGeometry(nestRadius - 0.5, 20),
      new THREE.MeshLambertMaterial({ color: 0x6B4E2A })
    );
    nestInner.rotation.x = -Math.PI / 2;
    nestInner.position.y = -0.15;
    bigNestGroup.add(nestInner);

    // Second layer of straw inside
    const strawMat = new THREE.MeshLambertMaterial({ color: 0xC4A050 });
    const nestInner2 = new THREE.Mesh(
      new THREE.CircleGeometry(nestRadius - 1.0, 16),
      strawMat
    );
    nestInner2.rotation.x = -Math.PI / 2;
    nestInner2.position.y = -0.08;
    bigNestGroup.add(nestInner2);

    // Twigs layered around the nest for texture
    for (let i = 0; i < 35; i++) {
      const angle = (i / 35) * Math.PI * 2;
      const twigLen = 1.8 + Math.random() * 1.2;
      const twig = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.08, twigLen, 4),
        new THREE.MeshLambertMaterial({ color: 0x7A5C2E + Math.floor(Math.random() * 0x202020) })
      );
      twig.position.set(
        Math.cos(angle) * (nestRadius - 0.3),
        0.3 + Math.random() * 0.3,
        Math.sin(angle) * (nestRadius - 0.3)
      );
      twig.rotation.z = (Math.random() - 0.5) * 0.6;
      twig.rotation.y = angle + Math.random();
      bigNestGroup.add(twig);
    }

    // Eggs in nest
    const nestEggMat = new THREE.MeshPhongMaterial({ color: 0xF5F0E8, shininess: 30 });
    for (let i = 0; i < 4; i++) {
      const egg = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 6), nestEggMat);
      egg.scale.set(0.8, 1.0, 0.8);
      egg.position.set(
        Math.cos(i * 1.6 + 0.3) * 1.0,
        0.2,
        Math.sin(i * 1.6 + 0.3) * 1.0
      );
      addOutline(egg, 0.04);
      bigNestGroup.add(egg);
    }

    // Speckles on eggs
    const speckleMat = new THREE.MeshLambertMaterial({ color: 0xC4A882 });
    for (let i = 0; i < 15; i++) {
      const speck = new THREE.Mesh(new THREE.SphereGeometry(0.08, 4, 3), speckleMat);
      speck.position.set(
        Math.cos(i * 0.42) * 1.1 + (Math.random() - 0.5) * 0.5,
        0.45,
        Math.sin(i * 0.42) * 1.1 + (Math.random() - 0.5) * 0.5
      );
      bigNestGroup.add(speck);
    }

    bigNestGroup.position.set(1, 1.5, 0.5);
    nestIslandGroup.add(bigNestGroup);

    // === LIGHTHOUSE on the island ===
    const lighthouseGroup = new THREE.Group();

    // Tower body (white with red stripes)
    const towerHeight = 7;
    const towerBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.9, towerHeight, 8),
      new THREE.MeshPhongMaterial({ color: 0xf5f0e0, shininess: 20 })
    );
    towerBase.position.y = towerHeight / 2;
    towerBase.castShadow = true;
    addOutline(towerBase, 0.02);
    lighthouseGroup.add(towerBase);

    // Red stripes
    const stripeMat = new THREE.MeshPhongMaterial({ color: 0xcc3333, shininess: 15 });
    for (let s = 0; s < 3; s++) {
      const stripeY = 1.5 + s * 2.0;
      const stripeR = 0.9 - (stripeY / towerHeight) * 0.3;
      const stripe = new THREE.Mesh(
        new THREE.CylinderGeometry(stripeR - 0.01, stripeR + 0.02, 0.6, 8),
        stripeMat
      );
      stripe.position.y = stripeY;
      lighthouseGroup.add(stripe);
    }

    // Observation deck (railing platform)
    const deckMat = new THREE.MeshPhongMaterial({ color: 0x333333, shininess: 30 });
    const deck = new THREE.Mesh(
      new THREE.CylinderGeometry(1.0, 1.0, 0.15, 12),
      deckMat
    );
    deck.position.y = towerHeight + 0.08;
    lighthouseGroup.add(deck);

    // Railing posts
    for (let r = 0; r < 12; r++) {
      const ra = (r / 12) * Math.PI * 2;
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.5, 4),
        deckMat
      );
      post.position.set(Math.cos(ra) * 0.95, towerHeight + 0.35, Math.sin(ra) * 0.95);
      lighthouseGroup.add(post);
    }

    // Railing ring
    const railRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.95, 0.03, 4, 12),
      deckMat
    );
    railRing.rotation.x = -Math.PI / 2;
    railRing.position.y = towerHeight + 0.55;
    lighthouseGroup.add(railRing);

    // Lamp room (glass dome)
    const lampRoom = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.55, 0.8, 8),
      new THREE.MeshPhongMaterial({ color: 0xfff9c4, transparent: true, opacity: 0.7, shininess: 60, emissive: 0xfff176, emissiveIntensity: 0.3 })
    );
    lampRoom.position.y = towerHeight + 0.55;
    lighthouseGroup.add(lampRoom);

    // Roof cap
    const roofCap = new THREE.Mesh(
      new THREE.ConeGeometry(0.5, 0.5, 8),
      new THREE.MeshPhongMaterial({ color: 0xcc3333, shininess: 20 })
    );
    roofCap.position.y = towerHeight + 1.2;
    addOutline(roofCap, 0.03);
    lighthouseGroup.add(roofCap);

    // Light point
    const lighthouseLight = new THREE.PointLight(0xfff9c4, 1.5, 20);
    lighthouseLight.position.y = towerHeight + 0.55;
    lighthouseGroup.add(lighthouseLight);

    lighthouseGroup.position.set(-4.5, 0, -3);
    nestIslandGroup.add(lighthouseGroup);

    // === NATURE on nest island ===
    // Trees around the edges
    const nestTreeColors = [0x1a6b1a, 0x228b22, 0x2e8b57];
    const nestTreePositions = [
      { x: 5, z: -2, s: 0.8 }, { x: -6, z: 2, s: 0.7 }, { x: 3, z: 5, s: 0.65 },
      { x: -3, z: 5, s: 0.75 }, { x: 6, z: 3, s: 0.6 }, { x: -5, z: -4, s: 0.7 },
      { x: 0, z: -6, s: 0.8 }, { x: 4, z: -5, s: 0.65 },
    ];
    nestTreePositions.forEach((tp) => {
      if (Math.sqrt(tp.x * tp.x + tp.z * tp.z) < NEST_ISLAND_RADIUS - 1.5) {
        nestIslandGroup.add(tree(tp.x, tp.z, tp.s, nestTreeColors[Math.floor(Math.random() * 3)]));
      }
    });

    // Shrubs near the nest
    const nestShrubColors = [0x2d7a2d, 0x357a35, 0x268026, 0x3a8a3a];
    const nestShrubPositions = [
      { x: 4, z: 1 }, { x: -1, z: 4 }, { x: 3, z: -3 },
      { x: -2, z: -4 }, { x: 5, z: -1 }, { x: -4, z: 3 },
    ];
    nestShrubPositions.forEach((sp) => {
      if (Math.sqrt(sp.x * sp.x + sp.z * sp.z) < NEST_ISLAND_RADIUS - 2) {
        nestIslandGroup.add(shrub(sp.x, sp.z, 0.6 + Math.random() * 0.4, nestShrubColors[Math.floor(Math.random() * 4)]));
      }
    });

    // Rocks scattered
    const rockMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
    for (let i = 0; i < 8; i++) {
      const rx = (Math.random() - 0.5) * NEST_ISLAND_RADIUS * 1.4;
      const rz = (Math.random() - 0.5) * NEST_ISLAND_RADIUS * 1.4;
      if (Math.sqrt(rx * rx + rz * rz) > NEST_ISLAND_RADIUS - 2) continue;
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.2 + Math.random() * 0.3, 0),
        rockMat
      );
      rock.position.set(rx, 0.1, rz);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      addOutline(rock, 0.04);
      nestIslandGroup.add(rock);
    }

    // Wildflowers on the nest island (simple inline flowers)
    const nestFlowerColors = [0xf472b6, 0xfbbf24, 0xc084fc, 0xfb923c, 0xe11d48, 0x9b59b6, 0xffffff];
    for (let i = 0; i < 30; i++) {
      const fx = (Math.random() - 0.5) * NEST_ISLAND_RADIUS * 1.4;
      const fz = (Math.random() - 0.5) * NEST_ISLAND_RADIUS * 1.4;
      if (Math.sqrt(fx * fx + fz * fz) > NEST_ISLAND_RADIUS - 2) continue;
      // Skip nest area
      const dxNest = fx - 1, dzNest = fz - 0.5;
      if (Math.sqrt(dxNest * dxNest + dzNest * dzNest) < 4.5) continue;
      const fg = new THREE.Group();
      fg.add(new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.02, 0.3, 4),
        new THREE.MeshLambertMaterial({ color: 0x2d7a2d })
      ));
      fg.children[0].position.y = 0.15;
      const col = nestFlowerColors[Math.floor(Math.random() * nestFlowerColors.length)];
      for (let p = 0; p < 5; p++) {
        const pa = (p / 5) * Math.PI * 2;
        const petal = new THREE.Mesh(
          new THREE.SphereGeometry(0.04, 5, 4),
          new THREE.MeshPhongMaterial({ color: col, shininess: 20 })
        );
        petal.position.set(Math.cos(pa) * 0.04, 0.32, Math.sin(pa) * 0.04);
        petal.scale.set(1.3, 0.3, 0.6);
        fg.add(petal);
      }
      fg.position.set(fx, 0, fz);
      nestIslandGroup.add(fg);
    }

    scene.add(nestIslandGroup);

    // === CLINICAL ISLAND (third island, hospital) ===
    const CLINICAL_ISLAND_X = 28;
    const CLINICAL_ISLAND_Z = 22;
    const CLINICAL_ISLAND_RADIUS = 10;
    const clinicalIslandGroup = new THREE.Group();
    clinicalIslandGroup.position.set(CLINICAL_ISLAND_X, 0, CLINICAL_ISLAND_Z);

    // Island base
    const clinicalIslandGeo = new THREE.CylinderGeometry(CLINICAL_ISLAND_RADIUS, CLINICAL_ISLAND_RADIUS - 0.8, 1.8, 28, 4);
    const ciPos = clinicalIslandGeo.attributes.position;
    for (let i = 0; i < ciPos.count; i++) {
      const y = ciPos.getY(i);
      if (y < -0.3) {
        const x = ciPos.getX(i);
        const z = ciPos.getZ(i);
        const dist = Math.sqrt(x * x + z * z);
        if (dist > CLINICAL_ISLAND_RADIUS * 0.5) {
          ciPos.setY(i, y - (dist / CLINICAL_ISLAND_RADIUS) * 0.6);
        }
      }
    }
    clinicalIslandGeo.computeVertexNormals();
    const clinicalIsland = new THREE.Mesh(clinicalIslandGeo, new THREE.MeshLambertMaterial({ map: grassTex, color: 0x4aba6e }));
    clinicalIsland.position.y = -0.2;
    clinicalIsland.receiveShadow = true;
    clinicalIslandGroup.add(clinicalIsland);

    // Beach ring
    const clinicalBeach = new THREE.Mesh(
      new THREE.TorusGeometry(CLINICAL_ISLAND_RADIUS - 0.2, 0.7, 8, 28),
      new THREE.MeshLambertMaterial({ color: 0xe8d5a3 })
    );
    clinicalBeach.rotation.x = -Math.PI / 2;
    clinicalBeach.position.y = -0.5;
    clinicalIslandGroup.add(clinicalBeach);

    // === HOSPITAL BUILDING ===
    const hospitalGroup = new THREE.Group();
    const creamMat = new THREE.MeshPhongMaterial({ color: 0xfdf0d5, shininess: 15 });

    // Main block
    const mainBlock = new THREE.Mesh(new THREE.BoxGeometry(5, 3.5, 4), creamMat);
    mainBlock.position.y = 1.75;
    mainBlock.castShadow = true;
    addOutline(mainBlock, 0.02);
    hospitalGroup.add(mainBlock);

    // Side wing
    const sideWing = new THREE.Mesh(new THREE.BoxGeometry(3, 2.5, 3), creamMat);
    sideWing.position.set(3.5, 1.25, 0.5);
    sideWing.castShadow = true;
    addOutline(sideWing, 0.02);
    hospitalGroup.add(sideWing);

    // Main roof
    const roofMat = new THREE.MeshPhongMaterial({ color: 0xd4603a, shininess: 20 });
    const mainRoof = new THREE.Mesh(new THREE.ConeGeometry(3.8, 1.8, 4), roofMat);
    mainRoof.position.y = 4.4;
    mainRoof.rotation.y = Math.PI / 4;
    addOutline(mainRoof, 0.03);
    hospitalGroup.add(mainRoof);

    // Side wing roof
    const sideRoof = new THREE.Mesh(new THREE.ConeGeometry(2.5, 1.4, 4), roofMat);
    sideRoof.position.set(3.5, 3.2, 0.5);
    sideRoof.rotation.y = Math.PI / 4;
    addOutline(sideRoof, 0.03);
    hospitalGroup.add(sideRoof);

    // Windows (glowing)
    const windowFrameMat = new THREE.MeshPhongMaterial({ color: 0x8B6914, shininess: 15 });
    const windowGlassMat = new THREE.MeshPhongMaterial({ color: 0xfff9c4, transparent: true, opacity: 0.6, emissive: 0xfff176, emissiveIntensity: 0.4, shininess: 60 });
    const windowBoxMat = new THREE.MeshLambertMaterial({ color: 0xc0652a });
    const windowFlowerCols = [0xf472b6, 0xe11d48, 0xfbbf24, 0xfb923c];

    function addWindow(px: number, py: number, pz: number, ry = 0) {
      const wg = new THREE.Group();
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.85, 0.08), windowFrameMat);
      addOutline(frame, 0.04);
      wg.add(frame);
      const glass = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.7, 0.06), windowGlassMat);
      glass.position.z = 0.02;
      wg.add(glass);
      // Flower box
      const fb = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.15, 0.25), windowBoxMat);
      fb.position.set(0, -0.5, 0.1);
      wg.add(fb);
      for (let f = 0; f < 3; f++) {
        const fl = new THREE.Mesh(new THREE.SphereGeometry(0.06, 5, 4), new THREE.MeshPhongMaterial({ color: windowFlowerCols[Math.floor(Math.random() * 4)], shininess: 20 }));
        fl.position.set((f - 1) * 0.25, -0.35, 0.15);
        wg.add(fl);
      }
      wg.position.set(px, py, pz);
      wg.rotation.y = ry;
      hospitalGroup.add(wg);
      // Warm light behind window
      const wl = new THREE.PointLight(0xfff9c4, 0.6, 6);
      wl.position.set(px, py, pz);
      hospitalGroup.add(wl);
    }

    // Front windows
    addWindow(-1.2, 2.2, -2.02);
    addWindow(1.2, 2.2, -2.02);
    // Side wing window
    addWindow(3.5, 1.8, -1.52);
    // Back windows
    addWindow(-1.2, 2.2, 2.02, Math.PI);
    addWindow(1.2, 2.2, 2.02, Math.PI);

    // Entrance door
    const doorMat = new THREE.MeshPhongMaterial({ color: 0x4a7a4a, shininess: 30 });
    const doorL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.2, 0.06), doorMat);
    doorL.position.set(-0.27, 0.6, -2.03);
    addOutline(doorL, 0.04);
    hospitalGroup.add(doorL);
    const doorR = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.2, 0.06), doorMat);
    doorR.position.set(0.27, 0.6, -2.03);
    addOutline(doorR, 0.04);
    hospitalGroup.add(doorR);
    // Door arch
    const doorArch = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.08, 6, 12, Math.PI), windowFrameMat);
    doorArch.position.set(0, 1.2, -2.04);
    doorArch.rotation.z = Math.PI;
    hospitalGroup.add(doorArch);
    // Door handle
    const handle = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 4), new THREE.MeshPhongMaterial({ color: 0xc4a000, shininess: 80 }));
    handle.position.set(0.15, 0.6, -2.08);
    hospitalGroup.add(handle);
    // Doorstep
    const doorstep = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.12, 0.5), new THREE.MeshLambertMaterial({ color: 0xe8d5a3 }));
    doorstep.position.set(0, 0.06, -2.3);
    hospitalGroup.add(doorstep);

    // Red cross on front wall
    const crossMat = new THREE.MeshPhongMaterial({ color: 0xe11d48, shininess: 20 });
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.0, 0.08), crossMat);
    crossV.position.set(0, 3.2, -2.02);
    addOutline(crossV, 0.04);
    hospitalGroup.add(crossV);
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.3, 0.08), crossMat);
    crossH.position.set(0, 3.2, -2.02);
    addOutline(crossH, 0.04);
    hospitalGroup.add(crossH);

    // Chimney
    const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 1.2, 6), new THREE.MeshPhongMaterial({ color: 0xc08040, shininess: 10 }));
    chimney.position.set(-1.0, 4.8, -0.5);
    addOutline(chimney, 0.04);
    hospitalGroup.add(chimney);

    // Smoke puffs
    const smokePuffs: THREE.Mesh[] = [];
    const smokeMat = new THREE.MeshLambertMaterial({ color: 0xddd8d0, transparent: true, opacity: 0.5 });
    for (let i = 0; i < 3; i++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.15 + i * 0.08, 6, 5), smokeMat.clone());
      puff.position.set(-1.0 + (Math.random() - 0.5) * 0.2, 5.5 + i * 0.6, -0.5);
      hospitalGroup.add(puff);
      smokePuffs.push(puff);
    }

    // Welcome sign
    const signPost = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 5), new THREE.MeshLambertMaterial({ color: 0x6b3e1e }));
    signPost.position.set(2.8, 0.6, -2.8);
    hospitalGroup.add(signPost);
    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 0.06), new THREE.MeshPhongMaterial({ color: 0xfdf0d5, shininess: 10 }));
    signBoard.position.set(2.8, 1.3, -2.8);
    addOutline(signBoard, 0.04);
    hospitalGroup.add(signBoard);

    hospitalGroup.position.set(0, 0, 0);
    clinicalIslandGroup.add(hospitalGroup);

    // === PARK BENCHES ===
    function createBench(bx: number, bz: number, ry: number) {
      const bg = new THREE.Group();
      const woodMat = new THREE.MeshLambertMaterial({ color: 0x8B6914 });
      // Seat
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.1, 0.5), woodMat);
      seat.position.y = 0.45;
      addOutline(seat, 0.04);
      bg.add(seat);
      // Legs
      for (const lx of [-0.55, 0.55]) {
        for (const lz of [-0.15, 0.15]) {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.08), woodMat);
          leg.position.set(lx, 0.225, lz);
          bg.add(leg);
        }
      }
      // Back
      const back = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 0.08), woodMat);
      back.position.set(0, 0.75, -0.22);
      back.rotation.x = -0.15;
      addOutline(back, 0.04);
      bg.add(back);
      bg.position.set(bx, 0, bz);
      bg.rotation.y = ry;
      return bg;
    }
    clinicalIslandGroup.add(createBench(-2.5, -3.5, 0.3));
    clinicalIslandGroup.add(createBench(2.5, -4, -0.2));

    // === PEOPLE FIGURES ===
    function createPerson(px: number, pz: number, facing: number, clothesCol: number, skinCol: number) {
      const pg = new THREE.Group();
      // Body
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 7, 6), new THREE.MeshLambertMaterial({ color: clothesCol }));
      body.position.y = 0.55;
      body.scale.set(0.6, 1.0, 0.5);
      addOutline(body, 0.04);
      pg.add(body);
      // Head
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), new THREE.MeshLambertMaterial({ color: skinCol }));
      head.position.y = 0.9;
      addOutline(head, 0.04);
      pg.add(head);
      // Arms
      const armMat = new THREE.MeshLambertMaterial({ color: clothesCol });
      for (const side of [-1, 1]) {
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.35, 5), armMat);
        arm.position.set(side * 0.18, 0.5, 0);
        arm.rotation.z = side * 0.3;
        pg.add(arm);
      }
      // Legs
      const legMat = new THREE.MeshLambertMaterial({ color: 0x4a5568 });
      for (const side of [-1, 1]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.4, 5), legMat);
        leg.position.set(side * 0.08, 0.2, 0);
        pg.add(leg);
      }
      pg.position.set(px, 0.05, pz);
      pg.rotation.y = facing;
      return pg;
    }
    clinicalIslandGroup.add(createPerson(-1.5, -3.0, 0.5, 0x60a5fa, 0xf5d0a9));
    clinicalIslandGroup.add(createPerson(0.5, -2.8, -0.3, 0xfbbf24, 0xc68642));
    clinicalIslandGroup.add(createPerson(3.0, -3.5, 0.8, 0xf472b6, 0xf5d0a9));

    // === FOUNTAIN ===
    const fountainGroup = new THREE.Group();
    const fountainBase = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 0.3, 16), new THREE.MeshPhongMaterial({ color: 0xe8d5a3, shininess: 10 }));
    fountainBase.position.y = 0.15;
    addOutline(fountainBase, 0.03);
    fountainGroup.add(fountainBase);
    const fountainWater = new THREE.Mesh(new THREE.CircleGeometry(1.0, 16), new THREE.MeshPhongMaterial({ color: 0x4a90d9, shininess: 80, transparent: true, opacity: 0.7 }));
    fountainWater.rotation.x = -Math.PI / 2;
    fountainWater.position.y = 0.31;
    fountainGroup.add(fountainWater);
    const fountainPost = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.8, 6), new THREE.MeshPhongMaterial({ color: 0xe8d5a3, shininess: 10 }));
    fountainPost.position.y = 0.7;
    fountainGroup.add(fountainPost);
    const fountainSpray: THREE.Mesh[] = [];
    for (let i = 0; i < 5; i++) {
      const drop = new THREE.Mesh(new THREE.SphereGeometry(0.06, 5, 4), new THREE.MeshBasicMaterial({ color: 0xc8e8ff, transparent: true, opacity: 0.7 }));
      drop.position.set((Math.random() - 0.5) * 0.4, 1.1 + i * 0.15, (Math.random() - 0.5) * 0.4);
      fountainGroup.add(drop);
      fountainSpray.push(drop);
    }
    fountainGroup.position.set(5, 0, 4);
    clinicalIslandGroup.add(fountainGroup);

    // === CLINICAL ISLAND NATURE ===
    const clinicalTreeColors = [0x2e8b57, 0x3cb371, 0x4aba6e];
    const clinicalTreePositions = [
      { x: 6, z: -3, s: 0.75 }, { x: -7, z: 2, s: 0.8 }, { x: 4, z: 6, s: 0.7 },
      { x: -5, z: 5, s: 0.65 }, { x: 7, z: 3, s: 0.7 }, { x: -4, z: -5, s: 0.75 },
      { x: -6, z: -3, s: 0.7 }, { x: 3, z: -7, s: 0.65 },
    ];
    clinicalTreePositions.forEach((tp) => {
      if (Math.sqrt(tp.x * tp.x + tp.z * tp.z) < CLINICAL_ISLAND_RADIUS - 1.5) {
        clinicalIslandGroup.add(tree(tp.x, tp.z, tp.s, clinicalTreeColors[Math.floor(Math.random() * 3)]));
      }
    });

    const clinicalShrubColors = [0x2d7a2d, 0x357a35, 0x3cb371];
    const clinicalShrubPositions = [
      { x: -3, z: -5 }, { x: 4, z: -5 }, { x: -6, z: 0 }, { x: 6, z: 0 },
    ];
    clinicalShrubPositions.forEach((sp) => {
      if (Math.sqrt(sp.x * sp.x + sp.z * sp.z) < CLINICAL_ISLAND_RADIUS - 2) {
        clinicalIslandGroup.add(shrub(sp.x, sp.z, 0.6 + Math.random() * 0.4, clinicalShrubColors[Math.floor(Math.random() * 3)]));
      }
    });

    // Flowers around building
    const clinicalFlowerColors = [0xf472b6, 0xfbbf24, 0xc084fc, 0xfb923c, 0xe11d48, 0xffffff];
    for (let i = 0; i < 20; i++) {
      const fx = (Math.random() - 0.5) * CLINICAL_ISLAND_RADIUS * 1.4;
      const fz = (Math.random() - 0.5) * CLINICAL_ISLAND_RADIUS * 1.4;
      if (Math.sqrt(fx * fx + fz * fz) > CLINICAL_ISLAND_RADIUS - 2) continue;
      // Skip building area
      if (Math.abs(fx) < 6 && Math.abs(fz) < 4) continue;
      const ffg = new THREE.Group();
      ffg.add(new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.3, 4), new THREE.MeshLambertMaterial({ color: 0x2d7a2d })));
      ffg.children[0].position.y = 0.15;
      const fcol = clinicalFlowerColors[Math.floor(Math.random() * clinicalFlowerColors.length)];
      for (let p = 0; p < 5; p++) {
        const pa = (p / 5) * Math.PI * 2;
        const petal = new THREE.Mesh(new THREE.SphereGeometry(0.04, 5, 4), new THREE.MeshPhongMaterial({ color: fcol, shininess: 20 }));
        petal.position.set(Math.cos(pa) * 0.04, 0.32, Math.sin(pa) * 0.04);
        petal.scale.set(1.3, 0.3, 0.6);
        ffg.add(petal);
      }
      ffg.position.set(fx, 0, fz);
      clinicalIslandGroup.add(ffg);
    }

    // Bunting (colorful triangles)
    const buntingColors = [0xf472b6, 0xfbbf24, 0x60a5fa, 0x4ade80, 0xfb923c];
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      const bx = -2.5 + t * 8;
      const bz = -2.5 - Math.sin(t * Math.PI) * 1.5;
      const by = 3.0 + Math.sin(t * Math.PI) * 0.8;
      const flag = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.25, 3), new THREE.MeshLambertMaterial({ color: buntingColors[i % 5] }));
      flag.position.set(bx, by, bz);
      flag.rotation.z = Math.PI;
      clinicalIslandGroup.add(flag);
    }

    scene.add(clinicalIslandGroup);

    // === SUN ===
    const sunPos = new THREE.Vector3(30, 12, -25);
    const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(4, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffee88 }));
    sunMesh.position.copy(sunPos);
    addOutline(sunMesh, 0.02);
    scene.add(sunMesh);
    const glow1 = new THREE.Mesh(new THREE.SphereGeometry(6.0, 16, 16), new THREE.MeshBasicMaterial({ color: 0xfff4b0, transparent: true, opacity: 0.25 }));
    glow1.position.copy(sunPos);
    scene.add(glow1);
    const glow2 = new THREE.Mesh(new THREE.SphereGeometry(9, 16, 16), new THREE.MeshBasicMaterial({ color: 0xfffde7, transparent: true, opacity: 0.12 }));
    glow2.position.copy(sunPos);
    scene.add(glow2);
    // Sun rays (grouped with sun so they orbit together)
    const sunRaysGroup = new THREE.Group();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const rayGeo = new THREE.CylinderGeometry(0.1, 0.03, 5, 4);
      const rayMat = new THREE.MeshBasicMaterial({ color: 0xfff9c4, transparent: true, opacity: 0.12 });
      const ray = new THREE.Mesh(rayGeo, rayMat);
      ray.position.set(Math.cos(angle) * 4.5, Math.sin(angle) * 4.5, 0);
      ray.rotation.z = angle + Math.PI / 2;
      sunRaysGroup.add(ray);
    }
    sunRaysGroup.position.copy(sunPos);
    scene.add(sunRaysGroup);

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
    const path = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 14), new THREE.MeshLambertMaterial({ map: dirtTex, color: 0xd4b07a }));
    path.rotation.x = -Math.PI / 2; path.position.set(0, 0.05, 1); path.receiveShadow = true;
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
      [-3, -7, 0.75], [4, -6, 0.9], [9, 1, 0.95],
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

    // Big tall tree behind the arch
    scene.add(tree(0, -6.5, 1.8, 0x1a6b1a));

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

    // === CLOUDS (orbiting around the islands) ===
    const clouds: THREE.Group[] = [];
    const cloudOrbitData = [
      { radius: 22, y: 14, speed: 0.08, phase: 0, s: 2.0 },
      { radius: 28, y: 15, speed: -0.06, phase: 1.2, s: 2.5 },
      { radius: 18, y: 13, speed: 0.1, phase: 2.5, s: 1.5 },
      { radius: 32, y: 12, speed: 0.05, phase: 3.8, s: 2.2 },
      { radius: 25, y: 13.5, speed: -0.07, phase: 5.0, s: 1.8 },
      { radius: 35, y: 16, speed: 0.04, phase: 0.8, s: 2.8 },
      { radius: 20, y: 14.5, speed: -0.09, phase: 4.2, s: 1.6 },
      { radius: 30, y: 15.5, speed: 0.055, phase: 2.0, s: 2.0 },
    ];
    cloudOrbitData.forEach((cd) => {
      const g = new THREE.Group();
      const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 });
      [[0, 0, 0, 1], [1, 0.2, 0.2, 0.8], [-0.9, 0.1, -0.1, 0.75], [0.4, 0.4, 0, 0.6], [-0.4, 0.3, 0.2, 0.65]].forEach(([px, py, pz, s]) => {
        g.add(makeMesh(new THREE.SphereGeometry((s as number) * cd.s, 7, 6), mat, (px as number) * cd.s, (py as number) * cd.s, (pz as number) * cd.s));
      });
      const angle = cd.phase;
      g.position.set(Math.cos(angle) * cd.radius, cd.y, Math.sin(angle) * cd.radius);
      clouds.push(g); scene.add(g);
    });

    // === CENTRAL CANOPY TREE (the "Canopy" tree - tallest, center of island) ===
    const canopyTreeGroup = new THREE.Group();
    const canopyTrunkMat = new THREE.MeshLambertMaterial({ map: barkTex, color: 0x5C3A1E });
    const canopyTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 8, 8), canopyTrunkMat);
    canopyTrunk.position.y = 4;
    canopyTrunk.castShadow = true;
    addOutline(canopyTrunk, 0.03);
    canopyTreeGroup.add(canopyTrunk);
    const canopyFoliageMat = new THREE.MeshLambertMaterial({ color: 0x1a7a1a });
    const canopyPositions = [
      { r: 2.5, y: 8.5 }, { r: 3.0, y: 9.5 }, { r: 2.8, y: 10.5 }, { r: 2.0, y: 11.5 },
      { r: 2.2, y: 9.0 }, { r: 2.6, y: 10.0 }, { r: 1.8, y: 11.0 }, { r: 1.2, y: 12.0 },
    ];
    canopyPositions.forEach((cp) => {
      const f = new THREE.Mesh(new THREE.SphereGeometry(cp.r, 8, 6), canopyFoliageMat);
      f.position.set((Math.random() - 0.5) * 2, cp.y, (Math.random() - 0.5) * 2);
      f.castShadow = true;
      addOutline(f, 0.03);
      canopyTreeGroup.add(f);
    });
    canopyTreeGroup.position.set(0, 0, -2);
    // scene.add(canopyTreeGroup); // Removed tallest tree

    // === POND (off-center on the island) ===
    const pondGeo = new THREE.CircleGeometry(2.5, 16);
    const pondMat = new THREE.MeshPhongMaterial({ color: 0x4a90d9, shininess: 100, transparent: true, opacity: 0.75 });
    const pond = new THREE.Mesh(pondGeo, pondMat);
    pond.rotation.x = -Math.PI / 2;
    pond.position.set(5, 0.06, 5);
    scene.add(pond);
    // Lily pads
    const lilyMat = new THREE.MeshLambertMaterial({ color: 0x22c55e });
    for (let i = 0; i < 4; i++) {
      const lily = new THREE.Mesh(new THREE.CircleGeometry(0.35 + Math.random() * 0.2, 8), lilyMat);
      lily.rotation.x = -Math.PI / 2;
      lily.position.set(5 + (Math.random() - 0.5) * 3, 0.08, 5 + (Math.random() - 0.5) * 3);
      scene.add(lily);
    }

    // === 3D BUTTERFLIES ===
    const butterflies: THREE.Group[] = [];
    const bfColors = [0x60a5fa, 0x4ade80, 0xfb923c, 0xc084fc, 0xf472b6, 0xfbbf24, 0xe11d48, 0x9b59b6];
    const bfData = [
      { col: 0, x: -4, y: 3, z: 3, sp: 0.5, r: 4 },
      { col: 1, x: 5, y: 2.5, z: -3, sp: 0.6, r: 3 },
      { col: 2, x: -2, y: 4, z: -5, sp: 0.45, r: 5 },
      { col: 3, x: 3, y: 3.5, z: 6, sp: 0.55, r: 3.5 },
      { col: 4, x: -6, y: 2, z: 1, sp: 0.7, r: 2.5 },
      { col: 5, x: 7, y: 3, z: -1, sp: 0.4, r: 4.5 },
      { col: 6, x: 0, y: 4, z: -6, sp: 0.65, r: 3 },
      { col: 7, x: -3, y: 2.5, z: 7, sp: 0.5, r: 2 },
    ];
    bfData.forEach((bd) => {
      const g = new THREE.Group();
      const col = bfColors[bd.col];
      const wingMat = new THREE.MeshPhongMaterial({ color: col, shininess: 30, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
      const bodyMat = new THREE.MeshLambertMaterial({ color: new THREE.Color(col).multiplyScalar(0.6).getHex() });
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4), bodyMat);
      body.scale.set(0.5, 0.5, 1.5);
      g.add(body);
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
      g.position.set(bd.x, bd.y, bd.z);
      g.userData = { speed: bd.sp, radius: bd.r, startX: bd.x, startZ: bd.z, phase: Math.random() * Math.PI * 2 };
      butterflies.push(g);
      scene.add(g);
    });

    // === FLY-TO TARGETS ===
    const flyTargets: Record<FlyTarget, { pos: THREE.Vector3; lookAt: THREE.Vector3 }> = {
      garden: { pos: new THREE.Vector3(0, 6, 8), lookAt: new THREE.Vector3(0, 1.5, 0) },
      nest: { pos: new THREE.Vector3(NEST_ISLAND_X + 2, 8, NEST_ISLAND_Z - 8), lookAt: new THREE.Vector3(NEST_ISLAND_X, 2, NEST_ISLAND_Z) },
      clinical: { pos: new THREE.Vector3(CLINICAL_ISLAND_X + 2, 8, CLINICAL_ISLAND_Z - 10), lookAt: new THREE.Vector3(CLINICAL_ISLAND_X, 2, CLINICAL_ISLAND_Z) },
    };

    // === FLY-TO STATE ===
    const flyState = {
      active: false,
      startPos: new THREE.Vector3(),
      targetPos: new THREE.Vector3(),
      startLookAt: new THREE.Vector3(0, 1, 0),
      targetLookAt: new THREE.Vector3(),
      duration: 1.8,
      elapsed: 0,
      onComplete: null as (() => void) | null,
    };

    function flyTo(target: FlyTarget): Promise<void> {
      return new Promise((resolve) => {
        const t = flyTargets[target];
        flyState.targetPos.copy(t.pos);
        flyState.targetLookAt.copy(t.lookAt);
        flyState.active = true;
        flyState.elapsed = 0;
        flyState.startPos.copy(camera.position);
        flyState.startLookAt.set(0, 1, 0);
        flyState.onComplete = resolve;
      });
    }

    if (flyToRef) {
      flyToRef.current = flyTo;
    }

    // === REVERSE FLY (coming back from a page) ===
    if (initialFlyFrom) {
      const from = flyTargets[initialFlyFrom];
      camera.position.copy(from.pos);
      camera.lookAt(from.lookAt);
      // Animate back to orbit
      flyState.active = true;
      flyState.elapsed = 0;
      flyState.duration = 1.5;
      flyState.startPos.copy(from.pos);
      flyState.startLookAt.copy(from.lookAt);
      // Target: a point on the orbit
      const orbitAngle = Math.atan2(from.pos.z, from.pos.x);
      flyState.targetPos.set(Math.cos(orbitAngle) * ORBIT_RADIUS, ORBIT_HEIGHT, Math.sin(orbitAngle) * ORBIT_RADIUS);
      flyState.targetLookAt.set(0, 1, 0);
      flyState.onComplete = () => { flyState.duration = 1.8; };
    }

    // === ANIMATION (orbiting camera) ===
    let time = 0;
    const clock = new THREE.Clock();
    const currentLookAt = new THREE.Vector3();

    function animate() {
      frameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      time += delta;

      if (flyState.active) {
        flyState.elapsed += delta;
        const t = Math.min(flyState.elapsed / flyState.duration, 1);
        // Cubic ease-in-out
        const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        camera.position.lerpVectors(flyState.startPos, flyState.targetPos, ease);
        currentLookAt.lerpVectors(flyState.startLookAt, flyState.targetLookAt, ease);
        camera.lookAt(currentLookAt);

        if (t >= 1 && flyState.onComplete) {
          flyState.active = false;
          flyState.onComplete();
          flyState.onComplete = null;
        }
      } else {
        // Orbit camera
        const angle = time * ORBIT_SPEED;
        camera.position.x = Math.cos(angle) * ORBIT_RADIUS;
        camera.position.z = Math.sin(angle) * ORBIT_RADIUS;
        camera.position.y = ORBIT_HEIGHT + Math.sin(time * 0.3) * 1.5;
        camera.lookAt(0, 1, 0);
      }

      // Sun orbits at horizon level, visible from the elevated camera
      const sunAngle = time * ORBIT_SPEED * 0.3;
      const sunOrbitR = 50;
      const sunY = 12;
      sunMesh.position.set(Math.cos(sunAngle) * sunOrbitR, sunY, Math.sin(sunAngle) * sunOrbitR);
      glow1.position.copy(sunMesh.position);
      glow2.position.copy(sunMesh.position);
      sunRaysGroup.position.copy(sunMesh.position);

      // Animate water
      waterTex.offset.x = time * 0.015;
      waterTex.offset.y = time * 0.01;

      // Clouds orbit around islands
      clouds.forEach((c, i) => {
        const cd = cloudOrbitData[i];
        const a = cd.phase + time * cd.speed;
        c.position.x = Math.cos(a) * cd.radius;
        c.position.z = Math.sin(a) * cd.radius;
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

      // Lighthouse light pulse
      lighthouseLight.intensity = 1.0 + Math.sin(time * 2) * 0.5;

      // Clinical island: smoke puffs
      smokePuffs.forEach((puff, i) => {
        puff.position.y += 0.008;
        (puff.material as THREE.MeshLambertMaterial).opacity = Math.max(0, 0.5 - (puff.position.y - 5.5) * 0.15);
        if (puff.position.y > 8) {
          puff.position.y = 5.5 + i * 0.3;
          puff.position.x = -1.0 + (Math.random() - 0.5) * 0.3;
          (puff.material as THREE.MeshLambertMaterial).opacity = 0.5;
        }
      });

      // Clinical island: fountain spray
      fountainSpray.forEach((drop, i) => {
        drop.position.y = 1.1 + Math.sin(time * 3 + i * 1.2) * 0.2;
        drop.position.x = Math.sin(time * 2 + i * 0.8) * 0.15;
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
      const portrait = container.clientHeight > container.clientWidth;
      camera.fov = portrait ? 72 : 45;
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

  return <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />;
}

export { LandingScene3D };
