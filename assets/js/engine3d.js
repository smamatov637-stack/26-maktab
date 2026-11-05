/* ==========================================================================
   MARG'ILON 26-SON MAKTAB — ULTRA 3D WEBGL2 & THREE.JS ENGINE (engine3d.js)
   Scenes:
     1. Full-Screen Cosmic Astrolabe & 120K GPU Particle Universe
     2. Interactive 3D Holographic Earth Globe (Marg'ilon 40.4765°N, 71.7380°E)
     3. Interactive 3D Virtual 26-Maktab Campus (Architecture + Flag + Stadium + Fireworks)
     4. Interactive 3D Holographic Statistics Prisms
     5. 3D Perspective Card Physics & Web Audio Synthesizer
   ========================================================================== */
(function () {
  'use strict';

  /* ========================================================================
     1. WEB AUDIO 3D SYNTHESIZER (Ovoz effektlari va Maktab qo'ng'irog'i)
     ======================================================================== */
  const SoundFX = {
    enabled: false,
    ctx: null,
    ensure() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this.ctx = new AC();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    },
    click(freq = 660) {
      if (!this.enabled) return;
      try {
        this.ensure();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.45, this.ctx.currentTime + 0.065);
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.07);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.075);
      } catch {}
    },
    playSchoolBell() {
      try {
        this.ensure();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        // Klassik maktab qo'ng'irog'i garmonikasi
        const harmonics = [880, 1318.5, 1760, 2489];
        for (let ring = 0; ring < 3; ring++) {
          const t0 = now + ring * 0.42;
          harmonics.forEach((f, idx) => {
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
            osc.frequency.setValueAtTime(f, t0);
            g.gain.setValueAtTime(0.11 / (idx + 1), t0);
            g.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.38);
            osc.connect(g);
            g.connect(this.ctx.destination);
            osc.start(t0);
            osc.stop(t0 + 0.4);
          });
        }
      } catch {}
    },
    playFireworkBoom() {
      if (!this.enabled) return;
      try {
        this.ensure();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const bufSize = this.ctx.sampleRate * 0.35;
        const buffer = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.09));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(520, now);
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.22, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
        noise.connect(filter);
        filter.connect(g);
        g.connect(this.ctx.destination);
        noise.start(now);
      } catch {}
    }
  };

  /* ========================================================================
     2. 3D PERSPECTIVE TILT CARD ENGINE
     ======================================================================== */
  function attach3DTiltCards() {
    const cards = document.querySelectorAll('.stat-card, .pillar-card, .news-card, .res-card, .analytics-card');
    cards.forEach(card => {
      if (card.dataset.tiltBound === '1') return;
      card.dataset.tiltBound = '1';
      card.classList.add('tilt-3d');

      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const px = (x / rect.width) - 0.5;
        const py = (y / rect.height) - 0.5;
        const rotY = px * 14;
        const rotX = -py * 14;
        card.style.transform = `perspective(950px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateZ(6px)`;
        card.style.setProperty('--mx', `${((x / rect.width) * 100).toFixed(1)}%`);
        card.style.setProperty('--my', `${((y / rect.height) * 100).toFixed(1)}%`);
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(950px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
      });
    });
  }

  /* ========================================================================
      YORDAMCHI: MATNLI 3D BILLBOARD / TEXTURE YARATUVCHI
     ======================================================================== */
  function createSignTexture(text, subText, bgColor = '#0f2454', accentColor = '#38bdf8') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 512, 160);

    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 8;
    ctx.strokeRect(6, 6, 500, 148);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, subText ? 64 : 80);

    if (subText) {
      ctx.fillStyle = accentColor;
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText(subText, 256, 114);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }

  function createUzbekFlagTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Moviy yo'l
    ctx.fillStyle = '#0099b5';
    ctx.fillRect(0, 0, 512, 82);
    // Qizil hoshiya 1
    ctx.fillStyle = '#ce1126';
    ctx.fillRect(0, 82, 512, 6);
    // Oq yo'l
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 88, 512, 80);
    // Qizil hoshiya 2
    ctx.fillStyle = '#ce1126';
    ctx.fillRect(0, 168, 512, 6);
    // Yashil yo'l
    ctx.fillStyle = '#1eb53a';
    ctx.fillRect(0, 174, 512, 82);

    // Yarim oy
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(70, 41, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0099b5';
    ctx.beginPath();
    ctx.arc(78, 41, 20, 0, Math.PI * 2);
    ctx.fill();

    // 12 yulduz
    ctx.fillStyle = '#ffffff';
    const rows = [
      [132, 148, 164],
      [116, 132, 148, 164],
      [100, 116, 132, 148, 164]
    ];
    rows.forEach((xs, rIdx) => {
      const y = 20 + rIdx * 20;
      xs.forEach(x => {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }

  /* ========================================================================
     AGAR THREE.JS YUKLANMASA — OFLAYN 3D CANVAS ZAXIRA REJIMI
     ======================================================================== */
  if (typeof window.THREE === 'undefined') {
    const bgCanvas = document.getElementById('bg-webgl-canvas');
    if (bgCanvas) {
      const ctx = bgCanvas.getContext('2d');
      const pts = Array.from({ length: 450 }, () => ({
        x: (Math.random() - 0.5) * 1600,
        y: (Math.random() - 0.5) * 1000,
        z: Math.random() * 1000 + 50
      }));
      const resize = () => {
        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight;
      };
      resize();
      window.addEventListener('resize', resize);
      (function loop() {
        ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
        const cx = bgCanvas.width / 2;
        const cy = bgCanvas.height / 2;
        pts.forEach(p => {
          p.z -= 3;
          if (p.z <= 10) p.z = 1000;
          const k = 320 / p.z;
          const sx = cx + p.x * k;
          const sy = cy + p.y * k;
          const r = Math.max(0.8, (1 - p.z / 1000) * 3.5);
          ctx.fillStyle = 'rgba(96, 165, 250, 0.75)';
          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.fill();
        });
        requestAnimationFrame(loop);
      })();
    }
    window.Maktab3D = {
      SoundFX,
      attach3DTiltCards,
      updateStatsHologram: () => {},
      setGpuPreset: () => {},
      launchCampusFirework: () => {}
    };
    return;
  }

  /* ========================================================================
     GPU STRESS CONTROLLER STATE & FPS TELEMETRY
     ======================================================================== */
  let currentGpuMode = localStorage.getItem('maktab26_gpu') || 'pro';
  const GPU_CONFIGS = {
    normal:  { particles: 14000, rings: 3,  dpr: 1.35, autoFireworks: false, label: '14K Zarracha' },
    pro:     { particles: 45000, rings: 8,  dpr: 1.85, autoFireworks: false, label: '45K Zarracha' },
    extreme: { particles: 125000, rings: 22, dpr: Math.min(2.5, window.devicePixelRatio || 2), autoFireworks: true, label: '125K MAX STRESS' }
  };

  let frameCounter = 0;
  let lastFpsCheck = performance.now();
  let currentFps = 60;

  function tickTelemetry() {
    frameCounter++;
    const now = performance.now();
    if (now - lastFpsCheck >= 600) {
      currentFps = Math.min(144, Math.round((frameCounter * 1000) / (now - lastFpsCheck)));
      frameCounter = 0;
      lastFpsCheck = now;
      const hud = document.getElementById('gpuTelemetryText');
      const cfg = GPU_CONFIGS[currentGpuMode] || GPU_CONFIGS.pro;
      if (hud) {
        hud.textContent = `⚡ ${currentFps} FPS · ${cfg.label}`;
      }
    }
  }

  /* ========================================================================
     SCENE 1: FULL-SCREEN COSMIC PARTICLE UNIVERSE & AL-FARG'ONIY ASTROLABE
     ======================================================================== */
  const bgCanvas = document.getElementById('bg-webgl-canvas');
  let bgRenderer = null;
  let bgScene = null;
  let bgCamera = null;
  let bgPoints = null;
  let bgAstrolabeGroup = null;
  let bgShaderUniforms = null;
  let mouseNormX = 0;
  let mouseNormY = 0;

  window.addEventListener('mousemove', e => {
    mouseNormX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseNormY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  function buildCosmicParticles() {
    if (!bgScene) return;
    if (bgPoints) {
      bgScene.remove(bgPoints);
      bgPoints.geometry.dispose();
      bgPoints.material.dispose();
    }
    if (bgAstrolabeGroup) {
      bgScene.remove(bgAstrolabeGroup);
    }

    const cfg = GPU_CONFIGS[currentGpuMode] || GPU_CONFIGS.pro;
    if (bgRenderer) bgRenderer.setPixelRatio(cfg.dpr);

    const count = cfg.particles;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const palette = [
      new THREE.Color('#3b82f6'),
      new THREE.Color('#2dd4bf'),
      new THREE.Color('#a855f7'),
      new THREE.Color('#fbbf24'),
      new THREE.Color('#60a5fa')
    ];

    for (let i = 0; i < count; i++) {
      // Spiral galaktika + sferik tarqalish
      const radius = Math.pow(Math.random(), 0.72) * 85;
      const spinAngle = radius * 0.22 + (i % 5) * ((Math.PI * 2) / 5);
      const branchJitterX = (Math.random() - 0.5) * 16;
      const branchJitterY = (Math.random() - 0.5) * 42;
      const branchJitterZ = (Math.random() - 0.5) * 16;

      positions[i * 3]     = Math.cos(spinAngle) * radius + branchJitterX;
      positions[i * 3 + 1] = branchJitterY;
      positions[i * 3 + 2] = Math.sin(spinAngle) * radius + branchJitterZ - 20;

      const c = palette[i % palette.length];
      colors[i * 3]     = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
      sizes[i] = Math.random() * 2.6 + 0.6;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    bgShaderUniforms = {
      uTime: { value: 0 },
      uPixelRatio: { value: cfg.dpr }
    };

    const mat = new THREE.ShaderMaterial({
      uniforms: bgShaderUniforms,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute float aSize;
        uniform float uTime;
        uniform float uPixelRatio;
        varying vec3 vColor;
        void main() {
          vColor = color;
          vec3 pos = position;
          pos.y += sin(uTime * 0.65 + pos.x * 0.08) * 1.4;
          pos.x += cos(uTime * 0.45 + pos.z * 0.08) * 1.1;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = aSize * uPixelRatio * (145.0 / max(8.0, -mvPosition.z));
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float strength = pow(1.0 - dist * 2.0, 2.0);
          gl_FragColor = vec4(vColor, strength * 0.85);
        }
      `
    });

    bgPoints = new THREE.Points(geo, mat);
    bgScene.add(bgPoints);

    // Al-Farg'oniy muqaddas geometrik usturlob halqalari
    bgAstrolabeGroup = new THREE.Group();
    const ringCount = cfg.rings;
    for (let r = 0; r < ringCount; r++) {
      const ringGeo = new THREE.TorusGeometry(12 + r * 3.1, 0.06, 12, 100);
      const ringMat = new THREE.MeshBasicMaterial({
        color: r % 2 === 0 ? 0x3b82f6 : 0x2dd4bf,
        transparent: true,
        opacity: 0.22
      });
      const mesh = new THREE.Mesh(ringGeo, ringMat);
      mesh.rotation.set(r * 0.45, r * 0.6, r * 0.3);
      bgAstrolabeGroup.add(mesh);
    }

    const coreGeo = new THREE.IcosahedronGeometry(8.5, currentGpuMode === 'extreme' ? 2 : 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      wireframe: true,
      transparent: true,
      opacity: 0.16
    });
    bgAstrolabeGroup.add(new THREE.Mesh(coreGeo, coreMat));

    if (currentGpuMode === 'extreme') {
      // Extreme rejimda qo'shimcha murakkab TorusKnot gologrammalar
      for (let k = 0; k < 6; k++) {
        const tkGeo = new THREE.TorusKnotGeometry(6 + k * 2.5, 0.18, 220, 28, 2 + (k % 3), 3 + (k % 2));
        const tkMat = new THREE.MeshBasicMaterial({
          color: k % 2 === 0 ? 0xa855f7 : 0x38bdf8,
          wireframe: true,
          transparent: true,
          opacity: 0.14
        });
        const tkMesh = new THREE.Mesh(tkGeo, tkMat);
        tkMesh.position.set((k - 2.5) * 14, (k % 2 === 0 ? 1 : -1) * 8, -28);
        bgAstrolabeGroup.add(tkMesh);
      }
    }

    bgAstrolabeGroup.position.set(0, 0, -26);
    bgScene.add(bgAstrolabeGroup);
  }

  function initBgScene() {
    if (!bgCanvas) return;
    try {
      bgRenderer = new THREE.WebGLRenderer({ canvas: bgCanvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
      bgRenderer.setSize(window.innerWidth, window.innerHeight);

      bgScene = new THREE.Scene();
      bgCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.5, 400);
      bgCamera.position.set(0, 4, 42);

      buildCosmicParticles();

      window.addEventListener('resize', () => {
        if (!bgRenderer || !bgCamera) return;
        bgCamera.aspect = window.innerWidth / window.innerHeight;
        bgCamera.updateProjectionMatrix();
        bgRenderer.setSize(window.innerWidth, window.innerHeight);
      });
    } catch (err) {
      console.warn('WebGL Background xatolik:', err);
    }
  }

  /* ========================================================================
     SCENE 2: INTERACTIVE 3D HOLOGRAPHIC EARTH GLOBE (Marg'ilon Beacon)
     ======================================================================== */
  const globeCanvas = document.getElementById('hero-globe-canvas');
  let globeRenderer = null;
  let globeScene = null;
  let globeCamera = null;
  let earthGroup = null;
  let beaconPulseMesh = null;
  let satellitesGroup = null;
  let globeRotY = -2.15;
  let globeRotX = 0.42;
  let globeDragging = false;
  let globeLastX = 0;
  let globeLastY = 0;

  function latLngToVec3(lat, lng, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }

  function initHeroGlobe() {
    if (!globeCanvas) return;
    try {
      const rect = globeCanvas.parentElement.getBoundingClientRect();
      const w = Math.max(300, rect.width);
      const h = Math.max(320, rect.height);

      globeRenderer = new THREE.WebGLRenderer({ canvas: globeCanvas, antialias: true, alpha: true });
      globeRenderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      globeRenderer.setSize(w, h, false);

      globeScene = new THREE.Scene();
      globeCamera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
      globeCamera.position.set(0, 0.3, 6.4);

      const amb = new THREE.AmbientLight(0x93c5fd, 0.8);
      globeScene.add(amb);
      const dir = new THREE.DirectionalLight(0x5eead4, 1.4);
      dir.position.set(5, 4, 6);
      globeScene.add(dir);

      earthGroup = new THREE.Group();
      globeScene.add(earthGroup);

      const R = 2.05;

      // Ichki okean yadrosi
      const coreSphere = new THREE.Mesh(
        new THREE.SphereGeometry(R * 0.985, 48, 48),
        new THREE.MeshPhongMaterial({
          color: 0x091938,
          emissive: 0x061229,
          shininess: 65,
          transparent: true,
          opacity: 0.94
        })
      );
      earthGroup.add(coreSphere);

      // Geografik meridian/parallel to'ri
      const wireSphere = new THREE.Mesh(
        new THREE.SphereGeometry(R, 36, 24),
        new THREE.MeshBasicMaterial({
          color: 0x3b82f6,
          wireframe: true,
          transparent: true,
          opacity: 0.24
        })
      );
      earthGroup.add(wireSphere);

      // Qit'a nuqtalari buluti (3500 nuqta)
      const dotCount = 3500;
      const dotPos = new Float32Array(dotCount * 3);
      for (let i = 0; i < dotCount; i++) {
        const u = Math.random();
        const v = Math.random();
        const lat = (Math.acos(2 * v - 1) * 180) / Math.PI - 90;
        const lng = u * 360 - 180;
        // Yevroosiyo va O'zbekiston atrofida zichroq nuqtalar
        const inEurasia = lat > 15 && lat < 70 && lng > -10 && lng < 140;
        if (!inEurasia && Math.random() > 0.38) continue;
        const vec = latLngToVec3(lat, lng, R * 1.008);
        dotPos[i * 3] = vec.x;
        dotPos[i * 3 + 1] = vec.y;
        dotPos[i * 3 + 2] = vec.z;
      }
      const dotGeo = new THREE.BufferGeometry();
      dotGeo.setAttribute('position', new THREE.BufferAttribute(dotPos, 3));
      const dotMat = new THREE.PointsMaterial({ color: 0x5eead4, size: 0.032, transparent: true, opacity: 0.85 });
      earthGroup.add(new THREE.Points(dotGeo, dotMat));

      // Atmosfera Fresnel nuri
      const atmoMesh = new THREE.Mesh(
        new THREE.SphereGeometry(R * 1.12, 48, 48),
        new THREE.ShaderMaterial({
          transparent: true,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
          vertexShader: `
            varying vec3 vNormal;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            varying vec3 vNormal;
            void main() {
              float intensity = pow(0.66 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.6);
              gl_FragColor = vec4(0.18, 0.62, 1.0, 1.0) * intensity;
            }
          `
        })
      );
      globeScene.add(atmoMesh);

      // MARG'ILON 26-MAKTAB NURI (40.4765° N, 71.7380° E)
      const margPos = latLngToVec3(40.4765, 71.7380, R);
      const margOuter = latLngToVec3(40.4765, 71.7380, R + 0.55);

      const pinSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.075, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
      );
      pinSphere.position.copy(margPos);
      earthGroup.add(pinSphere);

      beaconPulseMesh = new THREE.Mesh(
        new THREE.RingGeometry(0.09, 0.17, 32),
        new THREE.MeshBasicMaterial({ color: 0x34d399, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
      );
      beaconPulseMesh.position.copy(margPos.clone().multiplyScalar(1.01));
      beaconPulseMesh.lookAt(margOuter.clone().multiplyScalar(2));
      earthGroup.add(beaconPulseMesh);

      // Lazer nur ustuni
      const beamGeo = new THREE.BufferGeometry().setFromPoints([margPos, margOuter]);
      const beamLine = new THREE.Line(
        beamGeo,
        new THREE.LineBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.95 })
      );
      earthGroup.add(beamLine);

      // 3D Yozuv: "MARG'ILON · 26-MAKTAB"
      const labelSprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: createSignTexture("MARG'ILON · 26-MAKTAB", '40.4765°N, 71.7380°E', '#08142c', '#fbbf24'),
          transparent: true
        })
      );
      labelSprite.position.copy(latLngToVec3(40.4765, 71.7380, R + 0.72));
      labelSprite.scale.set(1.55, 0.48, 1);
      earthGroup.add(labelSprite);

      // Orbitadagi sun'iy yo'ldosh halqalari
      satellitesGroup = new THREE.Group();
      for (let s = 0; s < 2; s++) {
        const orbitRing = new THREE.Mesh(
          new THREE.TorusGeometry(R + 0.42 + s * 0.25, 0.008, 8, 96),
          new THREE.MeshBasicMaterial({ color: s === 0 ? 0x38bdf8 : 0xa855f7, transparent: true, opacity: 0.4 })
        );
        orbitRing.rotation.x = Math.PI / 2.8 + s * 0.5;
        orbitRing.rotation.y = s * 0.7;
        satellitesGroup.add(orbitRing);
      }
      globeScene.add(satellitesGroup);

      // Sichqoncha va sensor bilan aylantirish
      const startDrag = (x, y) => { globeDragging = true; globeLastX = x; globeLastY = y; };
      const moveDrag = (x, y) => {
        if (!globeDragging) return;
        globeRotY += (x - globeLastX) * 0.008;
        globeRotX = Math.max(-1.1, Math.min(1.1, globeRotX + (y - globeLastY) * 0.008));
        globeLastX = x;
        globeLastY = y;
      };
      globeCanvas.addEventListener('mousedown', e => startDrag(e.clientX, e.clientY));
      window.addEventListener('mousemove', e => moveDrag(e.clientX, e.clientY));
      window.addEventListener('mouseup', () => { globeDragging = false; });

      globeCanvas.addEventListener('touchstart', e => {
        if (e.touches.length === 1) startDrag(e.touches[0].clientX, e.touches[0].clientY);
      }, { passive: true });
      globeCanvas.addEventListener('touchmove', e => {
        if (e.touches.length === 1) moveDrag(e.touches[0].clientX, e.touches[0].clientY);
      }, { passive: true });
      globeCanvas.addEventListener('touchend', () => { globeDragging = false; });

      window.addEventListener('resize', () => {
        if (!globeRenderer || !globeCamera || !globeCanvas.parentElement) return;
        const r = globeCanvas.parentElement.getBoundingClientRect();
        if (r.width < 50) return;
        globeCamera.aspect = r.width / r.height;
        globeCamera.updateProjectionMatrix();
        globeRenderer.setSize(r.width, r.height, false);
      });
    } catch (err) {
      console.warn('3D Globe xatolik:', err);
    }
  }

  /* ========================================================================
     SCENE 3: INTERACTIVE 3D VIRTUAL 26-MAKTAB CAMPUS (#campus-3d-canvas)
     ======================================================================== */
  const campusCanvas = document.getElementById('campus-3d-canvas');
  let campusRenderer = null;
  let campusScene = null;
  let campusCamera = null;
  let sunLight = null;
  let hemiLight = null;
  let flagGeometry = null;
  let flagOrigPos = null;
  let schoolBusGroup = null;
  let fountainDrops = [];
  let windowMaterials = [];
  let nightSpotLights = [];
  let fireworks = [];
  let droneOrbit = true;

  // Spherical orbit camera state
  const camSpherical = {
    theta: 0.58,
    phi: 1.08,
    radius: 38,
    target: new THREE.Vector3(0, 3, 2),
    desiredTheta: 0.58,
    desiredPhi: 1.08,
    desiredRadius: 38,
    desiredTarget: new THREE.Vector3(0, 3, 2)
  };

  function launchCampusFirework() {
    if (!campusScene) return;
    SoundFX.playFireworkBoom();
    const origin = new THREE.Vector3(
      (Math.random() - 0.5) * 26,
      14 + Math.random() * 9,
      (Math.random() - 0.5) * 16 - 2
    );
    const particleCount = currentGpuMode === 'extreme' ? 260 : 140;
    const pos = new Float32Array(particleCount * 3);
    const vel = [];
    const palette = [0xfbbf24, 0x38bdf8, 0x34d399, 0xf43f5e, 0xa855f7];
    const color = palette[Math.floor(Math.random() * palette.length)];

    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = origin.x;
      pos[i * 3 + 1] = origin.y;
      pos[i * 3 + 2] = origin.z;
      const sp = 0.14 + Math.random() * 0.28;
      const a1 = Math.random() * Math.PI * 2;
      const a2 = Math.acos(2 * Math.random() - 1);
      vel.push(new THREE.Vector3(
        Math.sin(a2) * Math.cos(a1) * sp,
        Math.cos(a2) * sp,
        Math.sin(a2) * Math.sin(a1) * sp
      ));
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color,
      size: 0.48,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending
    });
    const pts = new THREE.Points(geo, mat);
    campusScene.add(pts);
    fireworks.push({ pts, vel, life: 1.0 });
  }

  function setCampusLighting(mode) {
    if (!campusScene || !sunLight || !hemiLight) return;
    const isNight = mode === 'night';
    const isSunset = mode === 'sunset';

    if (mode === 'day') {
      campusScene.background = new THREE.Color(0x7dd3fc);
      campusScene.fog = new THREE.FogExp2(0xbae6fd, 0.0085);
      hemiLight.color.setHex(0xe0f2fe);
      hemiLight.groundColor.setHex(0x334155);
      hemiLight.intensity = 0.85;
      sunLight.color.setHex(0xffffff);
      sunLight.intensity = 1.25;
      sunLight.position.set(28, 36, 24);
    } else if (isSunset) {
      campusScene.background = new THREE.Color(0x311b47);
      campusScene.fog = new THREE.FogExp2(0x7c2d12, 0.01);
      hemiLight.color.setHex(0xfdba74);
      hemiLight.groundColor.setHex(0x1e1b4b);
      hemiLight.intensity = 0.65;
      sunLight.color.setHex(0xf97316);
      sunLight.intensity = 1.35;
      sunLight.position.set(-34, 13, 18);
    } else {
      campusScene.background = new THREE.Color(0x050b1a);
      campusScene.fog = new THREE.FogExp2(0x050b1a, 0.011);
      hemiLight.color.setHex(0x1e3a8a);
      hemiLight.groundColor.setHex(0x090d16);
      hemiLight.intensity = 0.42;
      sunLight.color.setHex(0x60a5fa);
      sunLight.intensity = 0.35;
      sunLight.position.set(15, 30, -20);
    }

    windowMaterials.forEach(mat => {
      if (isNight) {
        mat.color.setHex(0xfef08a);
        mat.emissive.setHex(0xf59e0b);
        mat.emissiveIntensity = 0.95;
      } else if (isSunset) {
        mat.color.setHex(0xfde68a);
        mat.emissive.setHex(0xd97706);
        mat.emissiveIntensity = 0.45;
      } else {
        mat.color.setHex(0x38bdf8);
        mat.emissive.setHex(0x0284c7);
        mat.emissiveIntensity = 0.15;
      }
    });

    nightSpotLights.forEach(l => {
      l.intensity = isNight ? 1.6 : isSunset ? 0.7 : 0;
    });
  }

  function initCampus3D() {
    if (!campusCanvas) return;
    try {
      const w = Math.max(320, campusCanvas.clientWidth || 960);
      const h = Math.max(360, campusCanvas.clientHeight || 540);

      campusRenderer = new THREE.WebGLRenderer({ canvas: campusCanvas, antialias: true });
      campusRenderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      campusRenderer.setSize(w, h, false);
      campusRenderer.shadowMap.enabled = true;
      campusRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

      campusScene = new THREE.Scene();
      campusCamera = new THREE.PerspectiveCamera(48, w / h, 0.5, 240);

      hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x0f172a, 0.6);
      campusScene.add(hemiLight);

      sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
      sunLight.position.set(26, 36, 22);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 1024;
      sunLight.shadow.mapSize.height = 1024;
      sunLight.shadow.camera.near = 5;
      sunLight.shadow.camera.far = 110;
      const d = 38;
      sunLight.shadow.camera.left = -d;
      sunLight.shadow.camera.right = d;
      sunLight.shadow.camera.top = d;
      sunLight.shadow.camera.bottom = -d;
      campusScene.add(sunLight);

      // 1. ZAMIN VA YASHIL MAYDON
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(140, 140),
        new THREE.MeshStandardMaterial({ color: 0x132a22, roughness: 0.92 })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      campusScene.add(ground);

      // Markaziy plitka hovli
      const plaza = new THREE.Mesh(
        new THREE.BoxGeometry(36, 0.22, 24),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 })
      );
      plaza.position.set(0, 0.11, 4);
      plaza.receiveShadow = true;
      campusScene.add(plaza);

      // Avtomobil yo'li (old prospekt)
      const road = new THREE.Mesh(
        new THREE.BoxGeometry(110, 0.18, 6.2),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 })
      );
      road.position.set(0, 0.09, 19.5);
      road.receiveShadow = true;
      campusScene.add(road);

      for (let rx = -45; rx <= 45; rx += 6) {
        const dash = new THREE.Mesh(
          new THREE.BoxGeometry(2.8, 0.21, 0.25),
          new THREE.MeshBasicMaterial({ color: 0xfacc15 })
        );
        dash.position.set(rx, 0.11, 19.5);
        campusScene.add(dash);
      }

      // 2. U-SHAKLIDAGI 3 QAVATLI MAKTAB BINOSI
      const wallMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.55 });
      const accentWallMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.45 });
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x0f2942, roughness: 0.5, metalness: 0.25 });

      // Markaziy korpus
      const mainBlock = new THREE.Mesh(new THREE.BoxGeometry(22, 8.6, 6.6), wallMat);
      mainBlock.position.set(0, 4.3, -5.5);
      mainBlock.castShadow = true;
      mainBlock.receiveShadow = true;
      campusScene.add(mainBlock);

      const mainRoof = new THREE.Mesh(new THREE.BoxGeometry(22.8, 0.65, 7.3), roofMat);
      mainRoof.position.set(0, 8.9, -5.5);
      campusScene.add(mainRoof);

      // Chap qanot (IT & STEM)
      const leftWing = new THREE.Mesh(new THREE.BoxGeometry(6.2, 7.2, 12.5), wallMat);
      leftWing.position.set(-11, 3.6, -0.5);
      leftWing.castShadow = true;
      leftWing.receiveShadow = true;
      campusScene.add(leftWing);

      const leftRoof = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.55, 13.1), roofMat);
      leftRoof.position.set(-11, 7.45, -0.5);
      campusScene.add(leftRoof);

      // O'ng qanot (Kutubxona & Xorijiy tillar)
      const rightWing = new THREE.Mesh(new THREE.BoxGeometry(6.2, 7.2, 12.5), wallMat);
      rightWing.position.set(11, 3.6, -0.5);
      rightWing.castShadow = true;
      rightWing.receiveShadow = true;
      campusScene.add(rightWing);

      const rightRoof = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.55, 13.1), roofMat);
      rightRoof.position.set(11, 7.45, -0.5);
      campusScene.add(rightRoof);

      // Milliy arkali kirish peshtoqi va ustunlar
      const portico = new THREE.Mesh(new THREE.BoxGeometry(6.4, 7.4, 2.4), accentWallMat);
      portico.position.set(0, 3.7, -1.6);
      portico.castShadow = true;
      campusScene.add(portico);

      for (const cx of [-2.4, -0.9, 0.9, 2.4]) {
        const col = new THREE.Mesh(
          new THREE.CylinderGeometry(0.24, 0.28, 6.2, 16),
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
        );
        col.position.set(cx, 3.1, -0.3);
        col.castShadow = true;
        campusScene.add(col);
      }

      // Tomdagi "26-SON MAKTAB" 3D peshlavhasi
      const signBoard = new THREE.Mesh(
        new THREE.BoxGeometry(9.6, 2.2, 0.35),
        new THREE.MeshBasicMaterial({
          map: createSignTexture('26-SON MAKTAB', "MARG'ILON SHAHRI · 1990", '#0b1938', '#fbbf24')
        })
      );
      signBoard.position.set(0, 10.3, -2.3);
      campusScene.add(signBoard);

      // 70+ derazalar (Kechasi oltin rangda porlaydi)
      const makeWinMat = () => {
        const m = new THREE.MeshStandardMaterial({
          color: 0xfef08a,
          emissive: 0xf59e0b,
          emissiveIntensity: 0.9,
          roughness: 0.2,
          metalness: 0.5
        });
        windowMaterials.push(m);
        return m;
      };

      for (let floor = 0; floor < 3; floor++) {
        const wy = 1.8 + floor * 2.55;
        for (let wx = -8.5; wx <= 8.5; wx += 2.2) {
          if (Math.abs(wx) < 3.1 && floor < 2) continue;
          const wMesh = new THREE.Mesh(new THREE.BoxGeometry(1.25, 1.45, 0.15), makeWinMat());
          wMesh.position.set(wx, wy, -2.18);
          campusScene.add(wMesh);
        }
      }

      for (let floor = 0; floor < 2; floor++) {
        const wy = 2.0 + floor * 2.7;
        for (let wz = -4.5; wz <= 4.2; wz += 2.2) {
          const wL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.4, 1.25), makeWinMat());
          wL.position.set(-7.88, wy, wz);
          campusScene.add(wL);

          const wR = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.4, 1.25), makeWinMat());
          wR.position.set(7.88, wy, wz);
          campusScene.add(wR);
        }
      }

      // 3. O'ZBEKISTON DAVLAT BAYROG'I (Jonli hilpiraydigan 3D mato)
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.14, 11.5, 16),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.2 })
      );
      pole.position.set(-4.5, 5.75, 7.5);
      pole.castShadow = true;
      campusScene.add(pole);

      flagGeometry = new THREE.PlaneGeometry(3.4, 1.7, 24, 12);
      flagOrigPos = flagGeometry.attributes.position.array.slice();
      const flagMesh = new THREE.Mesh(
        flagGeometry,
        new THREE.MeshStandardMaterial({
          map: createUzbekFlagTexture(),
          side: THREE.DoubleSide,
          roughness: 0.45
        })
      );
      flagMesh.position.set(-2.78, 10.55, 7.5);
      flagMesh.castShadow = true;
      campusScene.add(flagMesh);

      // 4. MARKAZIY FAVVORA (3D suv zarralari bilan)
      const basin = new THREE.Mesh(
        new THREE.CylinderGeometry(2.5, 2.7, 0.65, 32),
        new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.25, metalness: 0.3 })
      );
      basin.position.set(3.5, 0.4, 7.5);
      campusScene.add(basin);

      for (let dIdx = 0; dIdx < 40; dIdx++) {
        const drop = new THREE.Mesh(
          new THREE.SphereGeometry(0.09, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0x7dd3fc })
        );
        const angle = (dIdx / 40) * Math.PI * 2;
        fountainDrops.push({ mesh: drop, angle, phase: Math.random() * Math.PI * 2 });
        campusScene.add(drop);
      }

      // 5. SPORT STADIONI VA MINI-FUTBOL MAYDONI
      const pitchGroup = new THREE.Group();
      pitchGroup.position.set(25, 0.15, 2);

      const track = new THREE.Mesh(
        new THREE.BoxGeometry(17.5, 0.14, 24.5),
        new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.8 })
      );
      pitchGroup.add(track);

      const turf = new THREE.Mesh(
        new THREE.BoxGeometry(13.5, 0.2, 20),
        new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.75 })
      );
      turf.receiveShadow = true;
      pitchGroup.add(turf);

      const centerRing = new THREE.Mesh(
        new THREE.RingGeometry(2.1, 2.28, 32),
        new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
      );
      centerRing.rotation.x = -Math.PI / 2;
      centerRing.position.y = 0.14;
      pitchGroup.add(centerRing);

      // Darvozalar va projektor ustunlari
      for (const gz of [-9.6, 9.6]) {
        const goal = new THREE.Mesh(
          new THREE.BoxGeometry(3.4, 1.7, 0.2),
          new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
        );
        goal.position.set(0, 0.95, gz);
        pitchGroup.add(goal);
      }

      for (const [lx, lz] of [[-8, -11], [8, -11], [-8, 11], [8, 11]]) {
        const tower = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.18, 9.5, 10),
          new THREE.MeshStandardMaterial({ color: 0x94a3b8 })
        );
        tower.position.set(lx, 4.75, lz);
        pitchGroup.add(tower);

        const lampHead = new THREE.Mesh(
          new THREE.BoxGeometry(1.1, 0.5, 0.5),
          new THREE.MeshBasicMaterial({ color: 0xfef9c3 })
        );
        lampHead.position.set(lx, 9.6, lz);
        pitchGroup.add(lampHead);
      }
      campusScene.add(pitchGroup);

      // Kechki yoritish nuqtalari
      const campusGlow1 = new THREE.PointLight(0xfbbf24, 1.6, 36);
      campusGlow1.position.set(0, 6, 4);
      campusScene.add(campusGlow1);
      nightSpotLights.push(campusGlow1);

      const stadiumGlow = new THREE.PointLight(0x38bdf8, 1.6, 38);
      stadiumGlow.position.set(25, 11, 2);
      campusScene.add(stadiumGlow);
      nightSpotLights.push(stadiumGlow);

      // 6. DARAXTLAR VA MAKTAB AVTOBUSI
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 });
      const treeCoords = [
        [-17, 12], [-17, 5], [-17, -2], [-17, -9],
        [-13, 14], [13, 14], [15, 13], [-22, 14], [22, 16], [-8, 14], [9, 14]
      ];
      treeCoords.forEach(([tx, tz]) => {
        const tGroup = new THREE.Group();
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 1.8, 8), trunkMat);
        trunk.position.y = 0.9;
        const crown1 = new THREE.Mesh(new THREE.ConeGeometry(1.45, 2.8, 9), leafMat);
        crown1.position.y = 2.7;
        crown1.castShadow = true;
        const crown2 = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.3, 9), leafMat);
        crown2.position.y = 4.1;
        tGroup.add(trunk, crown1, crown2);
        tGroup.position.set(tx, 0, tz);
        campusScene.add(tGroup);
      });

      // Sariq maktab avtobusi
      schoolBusGroup = new THREE.Group();
      const busBody = new THREE.Mesh(
        new THREE.BoxGeometry(5.2, 1.9, 2.1),
        new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 })
      );
      busBody.position.y = 1.25;
      busBody.castShadow = true;
      schoolBusGroup.add(busBody);

      const headlight = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      headlight.position.set(2.62, 1.0, 0.65);
      schoolBusGroup.add(headlight);
      schoolBusGroup.position.set(-30, 0.1, 19.5);
      campusScene.add(schoolBusGroup);

      // 7. 3D QALQIB TURUVCHI AXBOROT BELGILARI
      const makeHotspot = (title, sub, x, y, z) => {
        const sp = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: createSignTexture(title, sub, '#08142c', '#5eead4'),
            transparent: true
          })
        );
        sp.position.set(x, y, z);
        sp.scale.set(5.4, 1.7, 1);
        campusScene.add(sp);
      };
      makeHotspot('BOSH O‘QUV BINOSI', '32 o‘quv xonasi · 936 o‘quvchi', 0, 13.2, -5.5);
      makeHotspot('IT VA STEM QANOTI', 'AKT laboratoriyalari', -11, 10.2, 0);
      makeHotspot('KUTUBXONA MARKAZI', '14 500+ kitob fondi', 11, 10.2, 0);
      makeHotspot('SPORT MAJMUASI', 'Mini-futbol va yugurish yo‘lagi', 25, 12.2, 2);

      // Standart Kiber-Tun rejimida ishga tushiramiz (yoki mavzuga qarab)
      const isLightTheme = document.documentElement.getAttribute('data-theme') === 'light';
      setCampusLighting(isLightTheme ? 'day' : 'night');

      // Sichqoncha va touch orbit boshqaruvi
      let cDrag = false;
      let cLastX = 0;
      let cLastY = 0;
      campusCanvas.addEventListener('mousedown', e => {
        cDrag = true;
        droneOrbit = false;
        document.getElementById('camDroneBtn')?.classList.remove('active');
        cLastX = e.clientX;
        cLastY = e.clientY;
      });
      window.addEventListener('mousemove', e => {
        if (!cDrag) return;
        camSpherical.desiredTheta -= (e.clientX - cLastX) * 0.007;
        camSpherical.desiredPhi = Math.max(0.32, Math.min(1.42, camSpherical.desiredPhi - (e.clientY - cLastY) * 0.006));
        cLastX = e.clientX;
        cLastY = e.clientY;
      });
      window.addEventListener('mouseup', () => { cDrag = false; });

      campusCanvas.addEventListener('wheel', e => {
        e.preventDefault();
        camSpherical.desiredRadius = Math.max(14, Math.min(72, camSpherical.desiredRadius + e.deltaY * 0.03));
      }, { passive: false });

      campusCanvas.addEventListener('touchstart', e => {
        if (e.touches.length === 1) {
          cDrag = true;
          droneOrbit = false;
          cLastX = e.touches[0].clientX;
          cLastY = e.touches[0].clientY;
        }
      }, { passive: true });
      campusCanvas.addEventListener('touchmove', e => {
        if (!cDrag || e.touches.length !== 1) return;
        camSpherical.desiredTheta -= (e.touches[0].clientX - cLastX) * 0.008;
        camSpherical.desiredPhi = Math.max(0.35, Math.min(1.42, camSpherical.desiredPhi - (e.touches[0].clientY - cLastY) * 0.007));
        cLastX = e.touches[0].clientX;
        cLastY = e.touches[0].clientY;
      }, { passive: true });
      campusCanvas.addEventListener('touchend', () => { cDrag = false; });

      const resizeCampus = () => {
        if (!campusRenderer || !campusCamera || !campusCanvas) return;
        const cw = campusCanvas.clientWidth || campusCanvas.parentElement.clientWidth;
        const ch = campusCanvas.clientHeight || 540;
        if (cw < 50) return;
        campusCamera.aspect = cw / ch;
        campusCamera.updateProjectionMatrix();
        campusRenderer.setSize(cw, ch, false);
      };
      window.addEventListener('resize', resizeCampus);
      document.addEventListener('fullscreenchange', () => setTimeout(resizeCampus, 80));

      // Kamera preset tugmalari
      const PRESETS = {
        overview:     { theta: 0.55,  phi: 1.08, radius: 40, target: [2, 3, 2] },
        mainBuilding: { theta: 0.0,   phi: 1.18, radius: 22, target: [0, 4.5, -3] },
        flagPlaza:    { theta: -0.35, phi: 1.22, radius: 15, target: [-3.5, 6.5, 7.5] },
        stadium:      { theta: 0.78,  phi: 1.02, radius: 26, target: [25, 2, 2] },
        itWing:       { theta: -0.75, phi: 1.12, radius: 21, target: [-11, 4, 0] }
      };

      document.querySelectorAll('[data-cam-preset]').forEach(btn => {
        btn.addEventListener('click', () => {
          SoundFX.click(740);
          const p = PRESETS[btn.dataset.camPreset];
          if (!p) return;
          droneOrbit = false;
          document.getElementById('camDroneBtn')?.classList.remove('active');
          document.querySelectorAll('[data-cam-preset]').forEach(b => b.classList.toggle('active', b === btn));
          camSpherical.desiredTheta = p.theta;
          camSpherical.desiredPhi = p.phi;
          camSpherical.desiredRadius = p.radius;
          camSpherical.desiredTarget.set(p.target[0], p.target[1], p.target[2]);
        });
      });

      document.querySelectorAll('[data-sky-mode]').forEach(btn => {
        btn.addEventListener('click', () => {
          SoundFX.click(580);
          document.querySelectorAll('[data-sky-mode]').forEach(b => b.classList.toggle('active', b === btn));
          setCampusLighting(btn.dataset.skyMode);
        });
      });

      document.getElementById('camDroneBtn')?.addEventListener('click', function () {
        SoundFX.click(820);
        droneOrbit = !droneOrbit;
        this.classList.toggle('active', droneOrbit);
      });

      document.getElementById('camFireworkBtn')?.addEventListener('click', () => {
        for (let i = 0; i < 4; i++) {
          setTimeout(launchCampusFirework, i * 240);
        }
      });

      document.getElementById('camFullscreenBtn')?.addEventListener('click', () => {
        const wrap = document.getElementById('campus3dWrapper');
        if (!wrap) return;
        if (!document.fullscreenElement) {
          wrap.requestFullscreen?.().catch(() => {});
        } else {
          document.exitFullscreen?.().catch(() => {});
        }
      });
    } catch (err) {
      console.warn('3D Campus xatolik:', err);
    }
  }

  /* ========================================================================
     SCENE 4: 3D HOLOGRAPHIC STATISTICS PRISMS (#stats-3d-canvas)
     ======================================================================== */
  const statsCanvas = document.getElementById('stats-3d-canvas');
  let statsRenderer = null;
  let statsScene = null;
  let statsCamera = null;
  let prismMeshes = [];
  let statsGroup = null;

  function initStatsHologram() {
    if (!statsCanvas) return;
    try {
      const w = Math.max(260, statsCanvas.clientWidth || 480);
      const h = Math.max(180, statsCanvas.clientHeight || 220);

      statsRenderer = new THREE.WebGLRenderer({ canvas: statsCanvas, antialias: true, alpha: true });
      statsRenderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      statsRenderer.setSize(w, h, false);

      statsScene = new THREE.Scene();
      statsCamera = new THREE.PerspectiveCamera(42, w / h, 0.1, 60);
      statsCamera.position.set(0, 4.2, 9.8);
      statsCamera.lookAt(0, 1.5, 0);

      statsScene.add(new THREE.AmbientLight(0xffffff, 0.8));
      const dLight = new THREE.DirectionalLight(0x5eead4, 1.3);
      dLight.position.set(5, 8, 6);
      statsScene.add(dLight);

      statsGroup = new THREE.Group();
      statsScene.add(statsGroup);

      // Gologramma asosi
      const baseGrid = new THREE.PolarGridHelper(4.2, 12, 5, 48, 0x3b82f6, 0x1e3a8a);
      statsGroup.add(baseGrid);

      const barColors = [0x3b82f6, 0x14b8a6, 0xf59e0b, 0xa855f7];
      const labels = ['OLIY', 'I TOIFA', 'II TOIFA', 'MUTAXASSIS'];

      for (let i = 0; i < 4; i++) {
        const x = (i - 1.5) * 1.65;
        const geo = new THREE.CylinderGeometry(0.42, 0.48, 1, 6);
        const mat = new THREE.MeshPhongMaterial({
          color: barColors[i],
          emissive: barColors[i],
          emissiveIntensity: 0.35,
          shininess: 90,
          transparent: true,
          opacity: 0.9
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, 0.5, 0);
        statsGroup.add(mesh);

        const lbl = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: createSignTexture(labels[i], '', '#091533', '#93c5fd'),
            transparent: true
          })
        );
        lbl.scale.set(1.4, 0.45, 1);
        lbl.position.set(x, 3.6, 0);
        statsGroup.add(lbl);

        prismMeshes.push({ mesh, lbl, targetScaleY: 2.0 });
      }

      let sDrag = false;
      let sLastX = 0;
      statsCanvas.addEventListener('mousedown', e => { sDrag = true; sLastX = e.clientX; });
      window.addEventListener('mousemove', e => {
        if (!sDrag || !statsGroup) return;
        statsGroup.rotation.y += (e.clientX - sLastX) * 0.01;
        sLastX = e.clientX;
      });
      window.addEventListener('mouseup', () => { sDrag = false; });

      window.addEventListener('resize', () => {
        if (!statsRenderer || !statsCamera || !statsCanvas) return;
        const cw = statsCanvas.clientWidth;
        const ch = statsCanvas.clientHeight;
        if (cw < 40) return;
        statsCamera.aspect = cw / ch;
        statsCamera.updateProjectionMatrix();
        statsRenderer.setSize(cw, ch, false);
      });
    } catch (err) {
      console.warn('3D Stats xatolik:', err);
    }
  }

  function updateStatsHologram(portalData) {
    if (!prismMeshes.length || !portalData) return;
    const vals = [
      portalData.teacherTop || 18,
      portalData.teacherFirst || 24,
      portalData.teacherSecond || 15,
      portalData.teacherSpec || 9
    ];
    const maxV = Math.max(1, ...vals);
    vals.forEach((v, i) => {
      const h = Math.max(0.5, (v / maxV) * 3.4);
      prismMeshes[i].targetScaleY = h;
    });
  }

  /* ========================================================================
     UNIFIED MASTER ANIMATION LOOP (requestAnimationFrame)
     ======================================================================== */
  const clock = new THREE.Clock();
  let lastAutoFirework = 0;

  function animateMasterLoop() {
    requestAnimationFrame(animateMasterLoop);
    tickTelemetry();

    const elapsed = clock.getElapsedTime();

    // 1. Cosmic Background
    if (bgRenderer && bgScene && bgCamera) {
      if (bgShaderUniforms) bgShaderUniforms.uTime.value = elapsed;
      if (bgPoints) {
        bgPoints.rotation.y = elapsed * (currentGpuMode === 'extreme' ? 0.08 : 0.032);
      }
      if (bgAstrolabeGroup) {
        const scrollRatio = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
        bgAstrolabeGroup.rotation.y = elapsed * 0.14 + scrollRatio * Math.PI * 2;
        bgAstrolabeGroup.rotation.x = Math.sin(elapsed * 0.2) * 0.35 + scrollRatio * 1.4;
        bgCamera.position.x += (mouseNormX * 4.5 - bgCamera.position.x) * 0.04;
        bgCamera.position.y += (-mouseNormY * 3.2 + 4 - bgCamera.position.y) * 0.04;
        bgCamera.lookAt(0, 0, -22);
      }
      bgRenderer.render(bgScene, bgCamera);
    }

    // 2. Hero 3D Globe
    if (globeRenderer && globeScene && globeCamera && earthGroup) {
      if (!globeDragging) globeRotY += 0.0038;
      earthGroup.rotation.y += (globeRotY - earthGroup.rotation.y) * 0.1;
      earthGroup.rotation.x += (globeRotX - earthGroup.rotation.x) * 0.1;
      if (beaconPulseMesh) {
        const s = 1 + Math.sin(elapsed * 4.2) * 0.35;
        beaconPulseMesh.scale.set(s, s, 1);
      }
      if (satellitesGroup) {
        satellitesGroup.rotation.y = -elapsed * 0.35;
        satellitesGroup.rotation.z = Math.sin(elapsed * 0.4) * 0.15;
      }
      globeRenderer.render(globeScene, globeCamera);
    }

    // 3. 3D Virtual School Campus
    if (campusRenderer && campusScene && campusCamera) {
      if (droneOrbit) {
        camSpherical.desiredTheta += 0.0028;
      }
      camSpherical.theta += (camSpherical.desiredTheta - camSpherical.theta) * 0.07;
      camSpherical.phi += (camSpherical.desiredPhi - camSpherical.phi) * 0.07;
      camSpherical.radius += (camSpherical.desiredRadius - camSpherical.radius) * 0.08;
      camSpherical.target.lerp(camSpherical.desiredTarget, 0.08);

      campusCamera.position.set(
        camSpherical.target.x + camSpherical.radius * Math.sin(camSpherical.phi) * Math.sin(camSpherical.theta),
        camSpherical.target.y + camSpherical.radius * Math.cos(camSpherical.phi),
        camSpherical.target.z + camSpherical.radius * Math.sin(camSpherical.phi) * Math.cos(camSpherical.theta)
      );
      campusCamera.lookAt(camSpherical.target);

      // O'zbekiston bayrog'i shamolda hilpirashi
      if (flagGeometry && flagOrigPos) {
        const posArr = flagGeometry.attributes.position.array;
        for (let i = 0; i < posArr.length; i += 3) {
          const ox = flagOrigPos[i];
          const oy = flagOrigPos[i + 1];
          const pinFactor = (ox + 1.7) / 3.4; // ustunga yopishgan cheti qimirlamaydi
          posArr[i + 2] = Math.sin(ox * 2.4 - elapsed * 5.2 + oy * 0.8) * 0.24 * pinFactor;
        }
        flagGeometry.attributes.position.needsUpdate = true;
      }

      // Favvora tomchilari
      fountainDrops.forEach(d => {
        const t = (elapsed * 1.4 + d.phase) % 1;
        const r = t * 1.85;
        const y = 0.7 + Math.sin(t * Math.PI) * 2.4;
        d.mesh.position.set(3.5 + Math.cos(d.angle) * r, y, 7.5 + Math.sin(d.angle) * r);
      });

      // Maktab avtobusi harakati
      if (schoolBusGroup) {
        schoolBusGroup.position.x += 0.095;
        if (schoolBusGroup.position.x > 46) schoolBusGroup.position.x = -46;
      }

      // Extreme GPU rejimida avtomatik mushakbozlik
      if (GPU_CONFIGS[currentGpuMode]?.autoFireworks && elapsed - lastAutoFirework > 1.8) {
        lastAutoFirework = elapsed;
        launchCampusFirework();
      }

      // 3D Mushaklar fizikasi
      for (let f = fireworks.length - 1; f >= 0; f--) {
        const fw = fireworks[f];
        fw.life -= 0.016;
        if (fw.life <= 0) {
          campusScene.remove(fw.pts);
          fw.pts.geometry.dispose();
          fw.pts.material.dispose();
          fireworks.splice(f, 1);
          continue;
        }
        const arr = fw.pts.geometry.attributes.position.array;
        for (let p = 0; p < fw.vel.length; p++) {
          arr[p * 3]     += fw.vel[p].x;
          arr[p * 3 + 1] += fw.vel[p].y;
          arr[p * 3 + 2] += fw.vel[p].z;
          fw.vel[p].y -= 0.0045; // tortishish kuchi
        }
        fw.pts.geometry.attributes.position.needsUpdate = true;
        fw.pts.material.opacity = fw.life;
      }

      campusRenderer.render(campusScene, campusCamera);
    }

    // 4. 3D Stats Hologram
    if (statsRenderer && statsScene && statsCamera && statsGroup) {
      statsGroup.rotation.y += 0.0045;
      prismMeshes.forEach(item => {
        item.mesh.scale.y += (item.targetScaleY - item.mesh.scale.y) * 0.08;
        item.mesh.position.y = item.mesh.scale.y / 2;
        item.lbl.position.y = item.mesh.scale.y + 0.65;
      });
      statsRenderer.render(statsScene, statsCamera);
    }
  }

  /* ========================================================================
     GPU MODE SWITCHER API
     ======================================================================== */
  function setGpuPreset(mode) {
    if (!GPU_CONFIGS[mode]) return;
    currentGpuMode = mode;
    localStorage.setItem('maktab26_gpu', mode);
    document.querySelectorAll('.gpu-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.gpu === mode);
    });
    buildCosmicParticles();
    if (campusRenderer) {
      campusRenderer.setPixelRatio(GPU_CONFIGS[mode].dpr);
    }
    if (mode === 'extreme') {
      for (let i = 0; i < 3; i++) setTimeout(launchCampusFirework, i * 220);
    }
  }

  /* ========================================================================
     ISHGA TUSHIRISH
     ======================================================================== */
  window.addEventListener('DOMContentLoaded', () => {
    initBgScene();
    initHeroGlobe();
    initCampus3D();
    initStatsHologram();
    attach3DTiltCards();

    document.querySelectorAll('.gpu-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.gpu === currentGpuMode);
      btn.addEventListener('click', () => {
        SoundFX.click(920);
        setGpuPreset(btn.dataset.gpu);
      });
    });

    const soundBtn = document.getElementById('soundToggleBtn');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        SoundFX.enabled = !SoundFX.enabled;
        soundBtn.textContent = SoundFX.enabled ? '🔊' : '🔇';
        soundBtn.classList.toggle('active-sfx', SoundFX.enabled);
        if (SoundFX.enabled) SoundFX.click(880);
      });
    }

    document.getElementById('ringBellBtn')?.addEventListener('click', () => {
      SoundFX.playSchoolBell();
    });

    animateMasterLoop();
  });

  window.Maktab3D = {
    SoundFX,
    attach3DTiltCards,
    updateStatsHologram,
    setGpuPreset,
    setCampusLighting,
    launchCampusFirework
  };
})();
