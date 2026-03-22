"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

function ClinicalScene3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfff3e0);
    scene.fog = new THREE.Fog(0xfff3e0, 20, 45);

    // Fixed camera looking into cozy reception
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
    const FINAL_POS = new THREE.Vector3(0, 5, 12);
    const FINAL_LOOK = new THREE.Vector3(0, 2, 0);
    camera.position.copy(FINAL_POS);
    camera.lookAt(FINAL_LOOK);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // === LIGHTING (warm, cozy) ===
    scene.add(new THREE.AmbientLight(0xfff8e1, 0.6));

    const windowLight = new THREE.DirectionalLight(0xfff4e0, 1.6);
    windowLight.position.set(-8, 10, 5);
    windowLight.castShadow = true;
    windowLight.shadow.mapSize.set(512, 512);
    scene.add(windowLight);

    const fillLight = new THREE.DirectionalLight(0xffe0b2, 0.5);
    fillLight.position.set(8, 5, 3);
    scene.add(fillLight);

    scene.add(new THREE.HemisphereLight(0xfff8e1, 0xd4a96a, 0.3));

    // Pendant lamp lights
    const lampLight1 = new THREE.PointLight(0xffd580, 1.0, 12);
    lampLight1.position.set(-3, 6, -1);
    scene.add(lampLight1);

    const lampLight2 = new THREE.PointLight(0xffd580, 0.8, 10);
    lampLight2.position.set(3, 6, -1);
    scene.add(lampLight2);

    // === OUTLINE ===
    const outlineMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });
    function addOutline(mesh: THREE.Mesh, thickness = 0.03) {
      const outline = new THREE.Mesh(mesh.geometry, outlineMat);
      outline.scale.multiplyScalar(1 + thickness);
      mesh.add(outline);
    }

    // === TEXTURES ===
    function makeWoodFloorTexture() {
      const c = document.createElement("canvas"); c.width = 256; c.height = 256;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#c4a265"; ctx.fillRect(0, 0, 256, 256);
      const planks = ["#b8935a", "#d4b275", "#c9a662", "#bfa068", "#caad6e"];
      for (let y = 0; y < 256; y += 32) {
        ctx.fillStyle = planks[Math.floor(Math.random() * planks.length)];
        ctx.fillRect(0, y, 256, 30);
        ctx.strokeStyle = "rgba(80, 50, 20, 0.3)";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y); ctx.stroke();
        // Grain lines
        for (let g = 0; g < 8; g++) {
          ctx.strokeStyle = `rgba(100, 65, 25, ${0.05 + Math.random() * 0.08})`;
          ctx.lineWidth = 0.5;
          const gy = y + 2 + Math.random() * 26;
          ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(256, gy + (Math.random() - 0.5) * 2); ctx.stroke();
        }
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 4);
      return tex;
    }

    const woodFloorTex = makeWoodFloorTexture();

    // === FLOOR ===
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(18, 20),
      new THREE.MeshPhongMaterial({ map: woodFloorTex, color: 0xd4a96a, shininess: 25 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // === WALLS ===
    const wallMat = new THREE.MeshLambertMaterial({ color: 0xfdf6ec });

    // Back wall
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(18, 8), wallMat);
    backWall.position.set(0, 4, -8);
    scene.add(backWall);

    // Left wall
    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 8), wallMat);
    leftWall.position.set(-9, 4, -0);
    leftWall.rotation.y = Math.PI / 2;
    scene.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 8), wallMat);
    rightWall.position.set(9, 4, 0);
    rightWall.rotation.y = -Math.PI / 2;
    scene.add(rightWall);

    // Ceiling
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(18, 20),
      new THREE.MeshLambertMaterial({ color: 0xfff8f0 })
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 8;
    scene.add(ceiling);

    // === WINDOWS with light shafts ===
    const windowFrameMat = new THREE.MeshPhongMaterial({ color: 0x8B6914, shininess: 15 });
    const windowGlassMat = new THREE.MeshPhongMaterial({ color: 0xc8e8ff, transparent: true, opacity: 0.4, emissive: 0xfff9c4, emissiveIntensity: 0.3, shininess: 60 });
    const lightShafts: THREE.Mesh[] = [];

    function createWindow(px: number, py: number, pz: number, ry: number) {
      const wg = new THREE.Group();
      // Frame
      const frame = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.5, 0.15), windowFrameMat);
      addOutline(frame, 0.03);
      wg.add(frame);
      // Glass
      const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.1), windowGlassMat);
      glass.position.z = 0.05;
      wg.add(glass);
      // Cross bar
      const hBar = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.1), windowFrameMat);
      hBar.position.z = 0.06;
      wg.add(hBar);
      const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.3, 0.1), windowFrameMat);
      vBar.position.z = 0.06;
      wg.add(vBar);
      // Light shaft (volumetric cone)
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 2.5, 6, 8, 1, true),
        new THREE.MeshBasicMaterial({ color: 0xfff9c4, transparent: true, opacity: 0.04, side: THREE.DoubleSide })
      );
      shaft.position.set(0, -2.5, 1.5);
      shaft.rotation.x = 0.3;
      lightShafts.push(shaft);
      wg.add(shaft);
      wg.position.set(px, py, pz);
      wg.rotation.y = ry;
      scene.add(wg);
    }

    // Left wall windows
    createWindow(-8.95, 4.5, -3, Math.PI / 2);
    createWindow(-8.95, 4.5, 2, Math.PI / 2);
    // Back wall window
    createWindow(3, 4.5, -7.95, 0);

    // === RECEPTION DESK ===
    const deskGroup = new THREE.Group();
    const deskWoodMat = new THREE.MeshPhongMaterial({ color: 0x8B6914, shininess: 20 });
    const deskTopMat = new THREE.MeshPhongMaterial({ color: 0xc4a265, shininess: 30 });

    // Desk surface
    const deskTop = new THREE.Mesh(new THREE.BoxGeometry(4, 0.15, 1.5), deskTopMat);
    deskTop.position.y = 1.0;
    addOutline(deskTop, 0.03);
    deskGroup.add(deskTop);

    // Front panel
    const deskFront = new THREE.Mesh(new THREE.BoxGeometry(4, 1.0, 0.1), deskWoodMat);
    deskFront.position.set(0, 0.5, -0.7);
    addOutline(deskFront, 0.02);
    deskGroup.add(deskFront);

    // Side panel
    const deskSide = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.0, 1.5), deskWoodMat);
    deskSide.position.set(2.0, 0.5, 0);
    deskGroup.add(deskSide);

    // Monitor
    const monitor = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 0.7, 0.06),
      new THREE.MeshPhongMaterial({ color: 0x333333, shininess: 40 })
    );
    monitor.position.set(-0.5, 1.55, 0);
    addOutline(monitor, 0.04);
    deskGroup.add(monitor);
    // Screen
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.85, 0.55),
      new THREE.MeshPhongMaterial({ color: 0xd0e8ff, emissive: 0x88bbdd, emissiveIntensity: 0.3 })
    );
    screen.position.set(-0.5, 1.55, 0.035);
    deskGroup.add(screen);
    // Monitor stand
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.4, 6), new THREE.MeshLambertMaterial({ color: 0x333333 }));
    stand.position.set(-0.5, 1.2, 0);
    deskGroup.add(stand);

    // Notepad
    const notepad = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.02, 0.5), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    notepad.position.set(1.0, 1.09, 0.1);
    deskGroup.add(notepad);

    deskGroup.position.set(-1, 0, -3);
    scene.add(deskGroup);

    // === WAITING CHAIRS ===
    function createChair(cx: number, cz: number, ry: number, col: number) {
      const cg = new THREE.Group();
      const chairMat = new THREE.MeshLambertMaterial({ color: col });
      // Seat
      const cSeat = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 0.6), chairMat);
      cSeat.position.y = 0.5;
      addOutline(cSeat, 0.04);
      cg.add(cSeat);
      // Back
      const cBack = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 0.06), chairMat);
      cBack.position.set(0, 0.85, -0.27);
      cBack.rotation.x = -0.1;
      addOutline(cBack, 0.04);
      cg.add(cBack);
      // Legs
      const legMat = new THREE.MeshLambertMaterial({ color: 0x666666 });
      for (const lx of [-0.28, 0.28]) {
        for (const lz of [-0.22, 0.22]) {
          const cLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 5), legMat);
          cLeg.position.set(lx, 0.25, lz);
          cg.add(cLeg);
        }
      }
      cg.position.set(cx, 0, cz);
      cg.rotation.y = ry;
      return cg;
    }

    scene.add(createChair(3.5, -4, 0.3, 0x60a5fa));
    scene.add(createChair(5.0, -4, 0.1, 0x4ade80));
    scene.add(createChair(6.5, -3.5, -0.2, 0xfbbf24));
    scene.add(createChair(6.5, -2.0, -0.8, 0x60a5fa));

    // === PENDANT LAMPS ===
    function createLamp(lx: number, lz: number) {
      const lg = new THREE.Group();
      // Cord
      const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.5, 4), new THREE.MeshLambertMaterial({ color: 0x333333 }));
      cord.position.y = 7.25;
      lg.add(cord);
      // Shade
      const shade = new THREE.Mesh(
        new THREE.ConeGeometry(0.5, 0.35, 8, 1, true),
        new THREE.MeshPhongMaterial({ color: 0xffd580, emissive: 0xffd580, emissiveIntensity: 0.3, side: THREE.DoubleSide })
      );
      shade.position.y = 6.5;
      shade.rotation.x = Math.PI;
      addOutline(shade, 0.04);
      lg.add(shade);
      // Bulb
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 6, 5),
        new THREE.MeshBasicMaterial({ color: 0xfff4b0 })
      );
      bulb.position.y = 6.35;
      lg.add(bulb);
      lg.position.set(lx, 0, lz);
      return lg;
    }

    scene.add(createLamp(-3, -1));
    scene.add(createLamp(3, -1));

    // === POTTED PLANTS ===
    function createPottedPlant(ppx: number, ppz: number, sc: number) {
      const pg = new THREE.Group();
      // Pot
      const pot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2 * sc, 0.28 * sc, 0.4 * sc, 8),
        new THREE.MeshPhongMaterial({ color: 0xc0652a, shininess: 15 })
      );
      pot.position.y = 0.2 * sc;
      addOutline(pot, 0.04);
      pg.add(pot);
      // Soil
      const soil = new THREE.Mesh(new THREE.CircleGeometry(0.18 * sc, 8), new THREE.MeshLambertMaterial({ color: 0x5c3a1e }));
      soil.rotation.x = -Math.PI / 2;
      soil.position.y = 0.41 * sc;
      pg.add(soil);
      // Foliage
      const leafMat = new THREE.MeshLambertMaterial({ color: 0x228b22 });
      for (let i = 0; i < 5; i++) {
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.18 * sc + Math.random() * 0.1 * sc, 6, 5), leafMat);
        leaf.position.set(
          (Math.random() - 0.5) * 0.3 * sc,
          0.5 * sc + i * 0.15 * sc,
          (Math.random() - 0.5) * 0.3 * sc
        );
        leaf.scale.set(1.2, 0.6, 1.0);
        pg.add(leaf);
      }
      pg.position.set(ppx, 0, ppz);
      return pg;
    }

    const plants = [
      createPottedPlant(-7, -5, 2.5),
      createPottedPlant(7, -5, 2.0),
      createPottedPlant(1.5, -2.7, 1.2),
    ];
    plants.forEach((p) => scene.add(p));

    // === WALL ART ===
    function createFrame(fx: number, fy: number, fz: number, ry: number, artCol: number) {
      const fg = new THREE.Group();
      const frameMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.9, 0.06),
        new THREE.MeshPhongMaterial({ color: 0x8B6914, shininess: 15 })
      );
      addOutline(frameMesh, 0.04);
      fg.add(frameMesh);
      const art = new THREE.Mesh(
        new THREE.PlaneGeometry(1.0, 0.7),
        new THREE.MeshLambertMaterial({ color: artCol })
      );
      art.position.z = 0.04;
      fg.add(art);
      fg.position.set(fx, fy, fz);
      fg.rotation.y = ry;
      return fg;
    }

    scene.add(createFrame(-3, 5, -7.95, 0, 0xb8d4e3));
    scene.add(createFrame(-6, 5, -7.95, 0, 0xe8c8a0));

    // Red cross on back wall
    const crossMat = new THREE.MeshPhongMaterial({ color: 0xe11d48, shininess: 20 });
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.7, 0.06), crossMat);
    crossV.position.set(4, 6, -7.95);
    addOutline(crossV, 0.04);
    scene.add(crossV);
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.2, 0.06), crossMat);
    crossH.position.set(4, 6, -7.95);
    addOutline(crossH, 0.04);
    scene.add(crossH);

    // === BASEBOARD trim ===
    const baseboardMat = new THREE.MeshLambertMaterial({ color: 0xd4c4a8 });
    const bbBack = new THREE.Mesh(new THREE.BoxGeometry(18, 0.3, 0.08), baseboardMat);
    bbBack.position.set(0, 0.15, -7.96);
    scene.add(bbBack);
    const bbLeft = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 20), baseboardMat);
    bbLeft.position.set(-8.96, 0.15, 0);
    scene.add(bbLeft);
    const bbRight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 20), baseboardMat);
    bbRight.position.set(8.96, 0.15, 0);
    scene.add(bbRight);

    // === ANIMATION ===
    let time = 0;
    const clock = new THREE.Clock();

    // Arriving intro animation
    const introStartPos = new THREE.Vector3(0, 3.5, 15);
    const introStartLook = new THREE.Vector3(0, 1, -2);
    let introElapsed = 0;
    const introDuration = 1.5;
    let introActive = true;
    camera.position.copy(introStartPos);
    camera.lookAt(introStartLook);

    function animate() {
      frameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      time += delta;

      // Intro pan
      if (introActive) {
        introElapsed += delta;
        const t = Math.min(introElapsed / introDuration, 1);
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        camera.position.lerpVectors(introStartPos, FINAL_POS, ease);
        const look = new THREE.Vector3().lerpVectors(introStartLook, FINAL_LOOK, ease);
        camera.lookAt(look);
        if (t >= 1) introActive = false;
      }

      // Light shaft pulse
      lightShafts.forEach((shaft, i) => {
        (shaft.material as THREE.MeshBasicMaterial).opacity = 0.03 + Math.sin(time * 0.8 + i) * 0.015;
      });

      // Lamp micro-flicker
      lampLight1.intensity = 1.0 + Math.sin(time * 0.5) * 0.05;
      lampLight2.intensity = 0.8 + Math.sin(time * 0.7 + 1) * 0.04;

      // Plant sway
      plants.forEach((p, i) => {
        p.rotation.z = Math.sin(time * 0.4 + i * 2) * 0.01;
        p.rotation.x = Math.sin(time * 0.3 + i * 1.5) * 0.005;
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

export { ClinicalScene3D };
