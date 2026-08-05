// scene3d.js — the game's 3D layer.
//
// WHAT IS 3D AND WHAT IS DELIBERATELY NOT
// The altitude meter, the ladder and the numbers stay flat, on purpose. That
// meter is a number line, and its whole power is that equal steps on screen are
// equal steps in number. Perspective foreshortens: the far tens would squash,
// 10→20 would look smaller than 0→10, and the intuition the game spent six
// ports building would quietly break. So 3D is used where the game is a reward
// — the landing, the airport, the cards — and never where it is arithmetic.
//
// NO ASSETS
// Every aircraft here is built at runtime out of boxes, cylinders and cones.
// That keeps the game one folder that works offline with nothing to download,
// and it means a new plane in curriculum.js needs no new file — just a body
// shape and a colour.
//
// ONE CONTEXT
// A single renderer and canvas serve both the airport behind the menus and the
// landing game. The canvas is moved between containers rather than recreated,
// because a WebGL context is expensive and browsers cap how many exist.
//
// If WebGL is missing or fails, everything here reports unsupported and the
// game falls back to the 2D screens it has always had.

const SCENE3D = {
  _supported: null,
  _renderer: null,
  _canvas: null,
  _raf: null,
  _clockLast: 0,

  // ===== CAPABILITY =====
  supported() {
    if (this._supported !== null) return this._supported;
    try {
      if (typeof THREE === 'undefined') return (this._supported = false);
      const c  = document.createElement('canvas');
      const gl = c.getContext('webgl2') || c.getContext('webgl');
      this._supported = !!gl;
      if (gl && gl.getExtension) gl.getExtension('WEBGL_lose_context')?.loseContext();
    } catch (e) {
      this._supported = false;
    }
    return this._supported;
  },

  reducedMotion() {
    return window.matchMedia &&
           window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // ===== RENDERER =====
  _renderer3d() {
    if (this._renderer) return this._renderer;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false,
                                               powerPreference: 'high-performance' });
    // Capped: past 1.5 the extra pixels cost real frames and buy almost nothing
    // on a scene made of flat-shaded boxes.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    this._canvas = renderer.domElement;
    this._canvas.id = 'scene3d-canvas';
    this._canvas.className = 'scene3d-canvas';
    this._renderer = renderer;
    window.addEventListener('resize', () => this._resize());
    document.addEventListener('visibilitychange', () => {
      // A hidden tab must not keep a GPU busy.
      if (document.hidden) this._pause(); else this._resume();
    });
    return renderer;
  },

  /** Move the shared canvas into a container and size it to that box. */
  _attach(container) {
    this._renderer3d();
    if (this._canvas.parentElement !== container) container.appendChild(this._canvas);
    this._resize();
  },

  _resize() {
    if (!this._renderer || !this._canvas.parentElement) return;
    const box = this._canvas.parentElement.getBoundingClientRect();
    const w = Math.max(1, Math.round(box.width));
    const h = Math.max(1, Math.round(box.height));
    this._renderer.setSize(w, h, false);
    const cam = this._active && this._active.camera;
    if (cam) { cam.aspect = w / h; cam.updateProjectionMatrix(); }
  },

  _pause()  { if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; } },
  _resume() {
    if (!this._raf && this._active && !document.hidden) {
      this._clockLast = performance.now();
      this._raf = requestAnimationFrame(t => this._tick(t));
    }
  },

  _tick(now) {
    this._raf = requestAnimationFrame(t => this._tick(t));
    const dt = Math.min((now - this._clockLast) / 1000, 0.05); // clamp after a stall
    this._clockLast = now;
    if (!this._active) return;
    this._active.update(dt);
    this._renderer.render(this._active.scene, this._active.camera);
  },

  _start(world, container) {
    this._pause();
    this._active = world;
    this._attach(container);
    this._resume();
  },

  // ===== MATERIAL / MESH HELPERS =====
  _mat(color, opts = {}) {
    return new THREE.MeshStandardMaterial({
      color, roughness: opts.roughness ?? 0.55, metalness: opts.metalness ?? 0.25,
      emissive: opts.emissive ?? 0x000000, emissiveIntensity: opts.emissiveIntensity ?? 1,
      flatShading: opts.flat ?? false,
    });
  },

  _box(w, h, d, mat, x = 0, y = 0, z = 0) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    return m;
  },

  _disposeGroup(root) {
    root.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
      }
    });
  },

  // ===== AIRCRAFT =====
  // Five body plans, chosen from the plane's emoji, so the card you just won is
  // recognisably the thing that comes down the approach.
  bodyPlan(plane) {
    const e = plane.emoji || '';
    if ('🚁⛑️🚑'.includes(e))            return 'heli';
    if ('🚀🌙☄️🌌🛰️🛖🔴'.includes(e))    return 'rocket';
    if ('🛸🪄🌈⏳💎'.includes(e))         return 'saucer';
    if ('⚡🦅👻💫🦖🦇🛡️🌩️'.includes(e)) return 'jet';
    return 'airliner';
  },

  palette(plane) {
    switch (plane.rarity) {
      case 'legendary': return { body: 0xd48bff, wing: 0x8a2be2, trim: 0xfff1a8, glow: 0xcc44ff };
      case 'gold':      return { body: 0xffd75e, wing: 0xd39a17, trim: 0xfff6d0, glow: 0xffc400 };
      case 'silver':    return { body: 0xdfe9f2, wing: 0x9fb3c4, trim: 0xffffff, glow: 0xcfe3ff };
      default:          return { body: 0xf2f7ff, wing: 0x2f7fd4, trim: 0xff9500, glow: 0x66ccff };
    }
  },

  /** A flyable aircraft, nose pointing along +Z. */
  buildAircraft(plane) {
    const P    = this.palette(plane);
    const plan = this.bodyPlan(plane);
    const g    = new THREE.Group();

    const body = this._mat(P.body, { roughness: 0.4, metalness: 0.35, flat: true });
    const wing = this._mat(P.wing, { roughness: 0.5, metalness: 0.3,  flat: true });
    const trim = this._mat(P.trim, { emissive: P.trim, emissiveIntensity: 0.35, flat: true });
    const glass = this._mat(0x0d2c4a, { roughness: 0.1, metalness: 0.8 });

    if (plan === 'saucer') {
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 4.2, 0.9, 18), body);
      const dome = new THREE.Mesh(new THREE.SphereGeometry(1.7, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), glass);
      dome.position.y = 0.4;
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.4, 0.28, 20), trim);
      ring.position.y = -0.35;
      g.add(disc, dome, ring);

    } else if (plan === 'rocket') {
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.25, 9, 14), body);
      tube.rotation.x = Math.PI / 2;
      const nose = new THREE.Mesh(new THREE.ConeGeometry(1.05, 2.6, 14), trim);
      nose.rotation.x = Math.PI / 2;
      nose.position.z = 5.8;
      for (const a of [0, Math.PI * 2 / 3, Math.PI * 4 / 3]) {
        const fin = this._box(0.24, 2.2, 2.4, wing, 0, 0, -3.6);
        fin.position.x = Math.cos(a) * 1.0;
        fin.position.y = Math.sin(a) * 1.0;
        fin.rotation.z = -a;
        g.add(fin);
      }
      g.add(tube, nose);

    } else if (plan === 'heli') {
      const cab = new THREE.Mesh(new THREE.CapsuleGeometry(1.5, 3.2, 6, 12), body);
      cab.rotation.x = Math.PI / 2;
      const tail = this._box(0.5, 0.5, 6.5, body, 0, 0.5, -4.8);
      const fin  = this._box(0.22, 1.8, 1.2, wing, 0, 1.4, -7.6);
      const skidL = this._box(0.2, 0.2, 5, wing, -1.5, -1.8, 0);
      const skidR = this._box(0.2, 0.2, 5, wing,  1.5, -1.8, 0);
      const mast  = this._box(0.3, 0.9, 0.3, wing, 0, 1.7, 0.4);
      const rotor = new THREE.Group();
      for (const a of [0, Math.PI / 2]) {
        const blade = this._box(0.22, 0.1, 13, trim, 0, 0, 0);
        blade.rotation.y = a;
        rotor.add(blade);
      }
      rotor.position.set(0, 2.2, 0.4);
      g.add(cab, tail, fin, skidL, skidR, mast, rotor);
      g.userData.rotor = rotor;

    } else {
      // airliner / jet — same skeleton, different proportions
      const jet = plan === 'jet';
      const len = jet ? 11 : 14;
      const rad = jet ? 0.85 : 1.35;

      const fus = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad * 0.75, len, 14), body);
      fus.rotation.x = Math.PI / 2;
      const nose = new THREE.Mesh(new THREE.ConeGeometry(rad, jet ? 3.4 : 2.6, 14), body);
      nose.rotation.x = Math.PI / 2;
      nose.position.z = len / 2 + (jet ? 1.6 : 1.2);

      const cockpit = new THREE.Mesh(new THREE.SphereGeometry(rad * 0.72, 12, 8), glass);
      cockpit.position.set(0, rad * 0.45, len / 2 - 1);

      // Wings: a swept box per side reads as a wing at this scale and costs 12
      // triangles. Jets get more sweep and less span.
      const span = jet ? 6.5 : 10;
      const mkWing = side => {
        const w = this._box(span, 0.28, jet ? 3.4 : 3.0, wing, side * (span / 2 + rad * 0.4), -0.15, jet ? -1.2 : -0.6);
        w.rotation.y = side * (jet ? 0.55 : 0.32);   // sweep
        w.rotation.z = side * -0.06;                  // dihedral
        return w;
      };

      const tailFin  = this._box(0.24, jet ? 2.6 : 3.4, 2.4, wing, 0, jet ? 1.4 : 1.9, -len / 2 + 0.8);
      const tailPlaneL = this._box(3.2, 0.2, 1.4, wing, -1.9, 0.35, -len / 2 + 0.9);
      const tailPlaneR = this._box(3.2, 0.2, 1.4, wing,  1.9, 0.35, -len / 2 + 0.9);

      g.add(fus, nose, cockpit, mkWing(-1), mkWing(1), tailFin, tailPlaneL, tailPlaneR);

      if (!jet) {
        for (const side of [-1, 1]) {
          const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 2.2, 12), wing);
          eng.rotation.x = Math.PI / 2;
          eng.position.set(side * 4.2, -0.85, 0.4);
          g.add(eng);
        }
      }
    }

    // Navigation lights — red left, green right, the real convention.
    const navL = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6),
      this._mat(0xff2d2d, { emissive: 0xff2d2d, emissiveIntensity: 2 }));
    const navR = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6),
      this._mat(0x2dff5e, { emissive: 0x2dff5e, emissiveIntensity: 2 }));
    const wingTip = plan === 'saucer' ? 4.3 : (plan === 'jet' ? 4.2 : 6);
    navL.position.set(-wingTip, 0, 0);
    navR.position.set( wingTip, 0, 0);
    g.add(navL, navR);
    g.userData.beacons = [navL, navR];

    return g;
  },

  // ===== SHARED SCENERY =====
  /** Runway markings, painted onto a canvas so the asphalt needs no image. */
  _runwayTexture() {
    const c = document.createElement('canvas');
    c.width = 128; c.height = 1024;
    const x = c.getContext('2d');

    x.fillStyle = '#23262b'; x.fillRect(0, 0, 128, 1024);
    x.fillStyle = '#2a2e34';
    for (let i = 0; i < 1024; i += 64) x.fillRect(0, i, 128, 2);

    // Edge lines
    x.fillStyle = '#e8ecf0';
    x.fillRect(6, 0, 5, 1024);
    x.fillRect(117, 0, 5, 1024);

    // Dashed centreline
    for (let y = 40; y < 1024; y += 96) x.fillRect(61, y, 6, 54);

    // Threshold bars at both ends
    for (let i = 0; i < 6; i++) {
      x.fillRect(20 + i * 15, 14, 8, 70);
      x.fillRect(20 + i * 15, 1024 - 84, 8, 70);
    }

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  },

  _starfield(count, radius) {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Upper hemisphere only — stars below the horizon just waste vertices.
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(Math.random() * 0.9 + 0.05);
      const r     = radius * (0.85 + Math.random() * 0.15);
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 20;
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    return new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0xdfefff, size: 1.5, sizeAttenuation: true,
      transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
  },

  /** Night lighting shared by both worlds. */
  _lightNight(scene) {
    scene.add(new THREE.HemisphereLight(0x24405e, 0x0a1220, 1.15));
    const moon = new THREE.DirectionalLight(0xbcd6ff, 1.05);
    moon.position.set(-40, 60, -30);
    scene.add(moon);
    const apron = new THREE.PointLight(0xffc27a, 60, 160, 2);
    apron.position.set(-18, 14, 30);
    scene.add(apron);
  },

  /** The tower, terminal and beacon, used by both worlds. */
  _buildAirport(scene) {
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400),
      this._mat(0x11202a, { roughness: 1, metalness: 0 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    scene.add(ground);

    const tex = this._runwayTexture();
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 6);
    const runway = new THREE.Mesh(new THREE.PlaneGeometry(34, 620),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, metalness: 0.05 }));
    runway.rotation.x = -Math.PI / 2;
    scene.add(runway);

    const taxi = new THREE.Mesh(new THREE.PlaneGeometry(14, 300),
      this._mat(0x1e2228, { roughness: 1 }));
    taxi.rotation.x = -Math.PI / 2;
    taxi.position.set(-34, 0.02, -40);
    scene.add(taxi);

    // Runway edge lights. One Points object rather than ~70 little spheres:
    // identical on screen, one draw call instead of seventy, and that headroom
    // is the difference between smooth and not on a weak GPU.
    const lightPos = [];
    for (let z = -300; z <= 300; z += 15) {
      lightPos.push(-18, 0.6, z, 18, 0.6, z);
    }
    const lightGeo = new THREE.BufferGeometry();
    lightGeo.setAttribute('position', new THREE.Float32BufferAttribute(lightPos, 3));
    scene.add(new THREE.Points(lightGeo, new THREE.PointsMaterial({
      color: 0xffe6a8, size: 3.4, sizeAttenuation: true,
      transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false,
    })));

    // Control tower
    const tower = new THREE.Group();
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 3, 26, 12),
      this._mat(0x53606e, { roughness: 0.8 }));
    shaft.position.y = 13;
    const cab = new THREE.Mesh(new THREE.CylinderGeometry(5, 4.2, 5, 12),
      this._mat(0x0d2c4a, { emissive: 0x1c5fa0, emissiveIntensity: 0.8, roughness: 0.2, metalness: 0.6 }));
    cab.position.y = 28;
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(5.6, 5.6, 0.8, 12),
      this._mat(0x39434f));
    roof.position.y = 31;
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.9, 8, 6),
      this._mat(0x00ff41, { emissive: 0x00ff41, emissiveIntensity: 3 }));
    beacon.position.y = 32.4;
    const beaconLight = new THREE.PointLight(0x00ff41, 40, 90, 2);
    beaconLight.position.y = 32.4;
    tower.add(shaft, cab, roof, beacon, beaconLight);
    tower.position.set(-52, 0, 40);
    scene.add(tower);

    // Terminal with lit windows
    const term = new THREE.Group();
    term.add(this._box(70, 12, 24, this._mat(0x2b3440, { roughness: 0.9 }), 0, 6, 0));
    const win = this._mat(0xffd79a, { emissive: 0xffc06a, emissiveIntensity: 1.6 });
    for (let i = -4; i <= 4; i++) term.add(this._box(5, 3.4, 0.4, win, i * 7, 7, 12.2));
    term.position.set(-96, 0, 40);
    scene.add(term);

    scene.add(this._starfield(600, 520));
    return { tower, beacon };
  },
};

// ===== WORLD: THE AIRPORT BEHIND THE MENUS =====
// A slow night orbit over the field. Cheap on purpose: it runs while the child
// is reading the entry screen, not while he is answering.
SCENE3D.startAirport = function (container) {
  if (!this.supported()) return null;

  // Built once and kept. The child crosses the entry, report, album and map
  // screens constantly; rebuilding a runway each time would stutter every
  // single transition.
  if (this._airport) {
    this._start(this._airport, container);
    return this._airport;
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x060d1a);
  scene.fog = new THREE.Fog(0x060d1a, 420, 1500);

  const camera = new THREE.PerspectiveCamera(52, 1, 0.5, 1600);
  this._lightNight(scene);
  const { beacon } = this._buildAirport(scene);

  // Two aircraft living their own loops: one climbing out, one on final.
  const departing = this.buildAircraft({ emoji: '✈️' });
  const arriving  = this.buildAircraft({ emoji: '🛩️' });
  scene.add(departing, arriving);

  let td = Math.random() * 12;
  let ta = Math.random() * 16;
  let orbit = 0;
  const still = this.reducedMotion();

  const world = {
    scene, camera,
    update(dt) {
      if (still) dt = 0;
      orbit += dt * 0.05;

      // High and well back. Closer than this and the runway stops being an
      // airport and becomes grey slabs behind the menu text.
      const r = 360;
      camera.position.set(Math.sin(orbit) * r, 145 + Math.sin(orbit * 0.7) * 28,
                          Math.cos(orbit) * r);
      // Aimed above the field on purpose: it drops the airport into the lower
      // third of the frame, leaving the menu sitting in clear sky.
      camera.lookAt(-10, 95, 0);

      // Departure: rolls, rotates, climbs away, restarts.
      td += dt;
      const dcycle = 14;
      const dt0 = (td % dcycle) / dcycle;
      departing.position.z = -290 + dt0 * 620;
      departing.position.y = dt0 < 0.42 ? 2.4 : 2.4 + Math.pow((dt0 - 0.42) * 3.1, 2) * 46;
      departing.rotation.x = dt0 < 0.42 ? 0 : -Math.min((dt0 - 0.42) * 1.5, 0.22);
      departing.visible = true;

      // Arrival: descends the glide path onto the far end.
      ta += dt;
      const acycle = 19;
      const at0 = (ta % acycle) / acycle;
      arriving.position.set(2, 96 * Math.pow(1 - at0, 1.5) + 2.4, -420 + at0 * 470);
      arriving.rotation.x = 0.05;

      // Beacon pulse.
      beacon.material.emissiveIntensity = 2 + Math.sin(orbit * 22) * 1.4;
    },
    dispose() {
      SCENE3D._disposeGroup(scene);
      scene.clear();
    },
  };

  this._airport = world;
  this._start(world, container);
  return world;
};

/** Stop drawing without tearing anything down — used on the question screen,
 *  where the canvas is covered anyway and every frame is wasted battery. */
SCENE3D.idle = function () { this._pause(); };

/** Free the landing world (but never the cached airport). */
SCENE3D.endLanding = function () {
  if (this._active && this._active !== this._airport) {
    this._pause();
    if (this._active.dispose) this._active.dispose();
    this._active = null;
  }
};

// ===== WORLD: THE LANDING =====
// The reward at the end of a shift, and the one screen that earns real 3D: the
// runway grows, the approach lights line up, and the child calls the moment.
//
// The contract from the 2D version is kept exactly: the window is generous,
// a miss is a go-around and never a crash, and the third attempt lands itself.
SCENE3D.startLanding = function (plane, container, hooks) {
  if (!this.supported()) return null;
  hooks = hooks || {};

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x071224);
  scene.fog = new THREE.Fog(0x071224, 220, 1100);

  const camera = new THREE.PerspectiveCamera(58, 1, 0.5, 2000);
  this._lightNight(scene);
  this._buildAirport(scene);

  // The aim point: a bar across the threshold that lights up in the window.
  const zoneMat = new THREE.MeshBasicMaterial({ color: 0x1f8f45, transparent: true, opacity: 0.5 });
  const zone = new THREE.Mesh(new THREE.PlaneGeometry(34, 16), zoneMat);
  zone.rotation.x = -Math.PI / 2;
  zone.position.set(0, 0.06, -22);
  scene.add(zone);

  // Two bright bars either side of the aim point. They read as "here" from a
  // long way out without washing the aircraft when it arrives.
  const gateMat = this._mat(0x1f8f45, { emissive: 0x2dff6e, emissiveIntensity: 1 });
  for (const side of [-20, 20]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(1.6, 5.5, 1.6), gateMat);
    post.position.set(side, 2.7, -22);
    scene.add(post);
  }
  const gate = { material: gateMat };

  // Approach lights leading up to it.
  const appMat = this._mat(0xfff4cf, { emissive: 0xffe9a8, emissiveIntensity: 2.2 });
  const approach = new THREE.Group();
  for (let i = 1; i <= 9; i++) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(i % 3 === 0 ? 11 : 5, 0.5, 0.9), appMat);
    bar.position.set(0, 0.4, -46 - i * 22);
    approach.add(bar);
  }
  scene.add(approach);

  const craft = this.buildAircraft(plane);
  scene.add(craft);

  // A light that rides with the aircraft. Without it a dark-liveried plane
  // disappears into a night scene at exactly the moment it matters.
  const key = new THREE.PointLight(0xfff2dc, 130, 120, 2);
  scene.add(key);

  // A blob shadow: one dark disc under the aircraft. Real shadow maps would
  // cost frames on a night scene where almost nothing would read anyway.
  const blob = new THREE.Mesh(new THREE.CircleGeometry(4.5, 20),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22 }));
  blob.rotation.x = -Math.PI / 2;
  scene.add(blob);

  const WIN = { from: 0.58, to: 0.86 };   // the pressable window, ~28% of the approach
  const PASS_SECONDS = 7.2;

  const S = {
    phase: 'approach',        // approach | flare | rollout | goaround | done
    t: 0,
    attempts: 0,
    dust: null,
    shake: 0,
  };

  const glide = t => ({
    z: -330 + t * 320,
    y: 82 * Math.pow(1 - t, 1.4) + 2.4,
  });

  const world = {
    scene, camera,

    inWindow() { return S.phase === 'approach' && S.t >= WIN.from && S.t <= WIN.to; },

    /** The child pressed the button. */
    press() {
      if (S.phase !== 'approach') return 'ignored';
      const ok = this.inWindow();
      // Third time, the tower brings it in. Nobody sits here failing.
      if (ok || S.attempts >= 2) {
        if (!ok) S.t = (WIN.from + WIN.to) / 2;
        S.phase = 'flare';
        return 'landing';
      }
      S.attempts++;
      S.phase = 'goaround';
      S.goT = 0;
      return 'goaround';
    },

    update(dt) {
      const rotor = craft.userData.rotor;
      if (rotor) rotor.rotation.y += dt * 22;

      if (S.phase === 'approach') {
        S.t += dt / PASS_SECONDS;
        if (S.t >= 1) { S.t = 0; }              // flew through: come round again
        const p = glide(S.t);
        craft.position.set(0, p.y, p.z);
        craft.rotation.set(0.07, 0, Math.sin(S.t * 9) * 0.02);

        const lit = this.inWindow();
        zoneMat.opacity = lit ? 0.72 : 0.28;
        gate.material.emissiveIntensity = lit ? 2.6 + Math.sin(S.t * 70) * 1.2 : 0.7;
        if (lit !== S._lit) { S._lit = lit; if (hooks.onWindow) hooks.onWindow(lit); }

      } else if (S.phase === 'flare') {
        // Nose up, sink rate bleeds off, wheels touch just past the bar.
        S.t += dt / (PASS_SECONDS * 1.5);
        const p = glide(Math.min(S.t, 1));
        craft.position.z = p.z;
        craft.position.y = Math.max(2.4, p.y * 0.55);
        craft.rotation.x = Math.min(craft.rotation.x + dt * 0.35, 0.16);
        if (craft.position.y <= 2.45) {
          S.phase = 'rollout';
          S.shake = 0.5;
          this._puff(craft.position.z);
          if (hooks.onTouchdown) hooks.onTouchdown();
        }

      } else if (S.phase === 'rollout') {
        craft.position.z += dt * 52;
        craft.rotation.x = Math.max(craft.rotation.x - dt * 0.4, 0);
        if (craft.position.z > 150 && S.phase !== 'done') S.phase = 'done';

      } else if (S.phase === 'goaround') {
        // Climb away, bank, and slide back to the start of the approach.
        S.goT += dt;
        craft.position.y += dt * 26;
        craft.position.z += dt * 60;
        craft.rotation.x = -0.2;
        craft.rotation.z = Math.min(craft.rotation.z + dt * 0.8, 0.5);
        if (S.goT > 1.5) {
          S.phase = 'approach';
          S.t = 0;
          craft.rotation.set(0.07, 0, 0);
        }
      }

      key.position.set(craft.position.x - 10, craft.position.y + 14, craft.position.z - 12);

      blob.position.set(craft.position.x, 0.08, craft.position.z);
      const h = Math.max(craft.position.y, 2.4);
      const s = Math.max(0.4, 1.4 - h / 70);
      blob.scale.set(s, s, s);
      blob.material.opacity = Math.max(0.04, 0.24 - h / 320);

      if (S.dust) {
        S.dust.life += dt;
        S.dust.points.material.opacity = Math.max(0, 0.5 - S.dust.life);
        S.dust.points.scale.setScalar(1 + S.dust.life * 2.4);
        if (S.dust.life > 0.6) {
          scene.remove(S.dust.points);
          S.dust.points.geometry.dispose();
          S.dust.points.material.dispose();
          S.dust = null;
        }
      }

      // Chase camera, lagging a little so the approach feels flown.
      const want = {
        x: craft.position.x, y: craft.position.y + 8.5, z: craft.position.z - 31,
      };
      camera.position.x += (want.x - camera.position.x) * Math.min(1, dt * 3.4);
      camera.position.y += (want.y - camera.position.y) * Math.min(1, dt * 3.4);
      camera.position.z += (want.z - camera.position.z) * Math.min(1, dt * 3.4);
      if (S.shake > 0) {
        S.shake = Math.max(0, S.shake - dt * 1.6);
        camera.position.y += (Math.random() - 0.5) * S.shake;
      }
      camera.lookAt(craft.position.x, craft.position.y + 1, craft.position.z + 38);
    },

    /** Tyre smoke at touchdown. */
    _puff(z) {
      const n = 28, pos = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        pos[i * 3]     = (Math.random() - 0.5) * 7;
        pos[i * 3 + 1] = Math.random() * 2;
        pos[i * 3 + 2] = z + (Math.random() - 0.5) * 5;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      const pts = new THREE.Points(geo, new THREE.PointsMaterial({
        color: 0xdfe8f0, size: 2.4, transparent: true, opacity: 0.5, depthWrite: false,
      }));
      scene.add(pts);
      S.dust = { points: pts, life: 0 };
    },

    dispose() {
      SCENE3D._disposeGroup(scene);
      scene.clear();
    },
  };

  this._start(world, container);
  return world;
};

if (typeof module !== 'undefined' && module.exports) module.exports = SCENE3D;
