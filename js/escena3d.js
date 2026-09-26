// Escena 3D de fondo: campo de estrellas "warp" + moneda dorada con el logotipo.
// Lee el estado compartido S (página actual, ratón, velocidad de scroll, impulso de viaje).
const THREE_URL = "https://unpkg.com/three@0.184.0/build/three.module.js";
const LOGO = "assets/img/logo.jpeg";
const easeOut = t => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

// Posición del emblema en cada capítulo (xf/yf = fracción de pantalla, z = profundidad, s = escala)
function pose(S, wide, aspect) {
  const BG = wide ? { xf: 0.6, yf: 0.34, z: -26, s: 1.7 } : { xf: 0, yf: 0.42, z: -26, s: 1.5 };
  const halfW = Math.tan(17 * Math.PI / 180) * 10 * aspect;
  const narrowS = Math.min(0.9, Math.max(0.5, halfW / 2.4));
  if (S.page === "inicio") {
    const H = wide ? { xf: 0.5, yf: 0.12, z: 0, s: 1 } : { xf: 0, yf: 0.42, z: 0, s: narrowS };
    const C = wide ? { xf: 0.3, yf: 0.05, z: -10, s: 1.7 } : { xf: 0, yf: 0.1, z: -12, s: 1.4 };
    const p = easeOut(Math.min(1, scrollY / (innerHeight * 0.9)));
    const o = {}; for (const k in H) o[k] = H[k] + (C[k] - H[k]) * p; return o;
  }
  if (S.page === "nosotros") return wide ? { xf: 0.52, yf: 0.02, z: 0, s: 1.15 } : { xf: 0, yf: 0.3, z: -10, s: 1.1 };
  if (S.page === "monumentos") return { ...BG, z: -40 };
  return BG;
}

export async function iniciarEscena(canvas, S, alListo) {
  let THREE, renderer;
  try { THREE = await import(THREE_URL); } catch (e) { alListo(); return; }
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: !S.coarse, alpha: true, powerPreference: "high-performance" }); }
  catch (e) { alListo(); return; }

  const small = () => innerWidth < 700 || S.coarse;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small() ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 220);
  camera.position.set(0, 0, 40);

  // Iluminación de estudio (entorno procedural)
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = new THREE.Scene(); env.background = new THREE.Color(0x06080c);
  const panel = (w, h, col, k, p) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(...p); m.lookAt(0, 0, 0); env.add(m); };
  panel(6, 3, 0xffdfae, 7, [-5, 5, 5]); panel(2, 8, 0xfff4e0, 4, [6, 1, 3]);
  panel(8, 1.2, 0xc5a059, 2.5, [0, -4, -5]); panel(3, 3, 0x7f93c9, 1.8, [-4, -1, -6]); panel(10, 0.4, 0xffffff, 3, [0, 6, -2]); panel(5, 4, 0xffe6bf, 2.2, [1.5, 1, 8]);
  scene.environment = pmrem.fromScene(env, 0.035).texture;

  // Moneda con el logotipo en ambas caras
  const gold = new THREE.MeshPhysicalMaterial({ name: "oro", color: 0xC5A059, metalness: 1, roughness: 0.26, clearcoat: 0.6, clearcoatRoughness: 0.2 });
  const bronze = new THREE.MeshPhysicalMaterial({ name: "bronce", color: 0x8B6B3D, metalness: 1, roughness: 0.4 });
  const tex = new THREE.TextureLoader().load(LOGO);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const k = 0.9; tex.repeat.set(k, k); tex.offset.set((1 - k) / 2 + 0.001, (1 - k) / 2 - 0.004);
  const face = new THREE.MeshPhysicalMaterial({ name: "logotipo", map: tex, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: 0.22, metalness: 0.35, roughness: 0.34, clearcoat: 1, clearcoatRoughness: 0.08 });

  const emblem = new THREE.Group(); scene.add(emblem);
  const medal = new THREE.Group(); emblem.add(medal);
  const add = (geo, mat, parent, p, r) => { const m = new THREE.Mesh(geo, mat); if (p) m.position.set(...p); if (r) m.rotation.set(...r); parent.add(m); return m; };
  const R = 1.6, T = 0.18;
  add(new THREE.CylinderGeometry(R, R, T, 128), gold, medal, [0, 0, 0], [Math.PI / 2, 0, 0]);
  add(new THREE.TorusGeometry(R, 0.045, 16, 160), gold, medal, [0, 0, T / 2]);
  add(new THREE.TorusGeometry(R, 0.045, 16, 160), gold, medal, [0, 0, -T / 2]);
  add(new THREE.CircleGeometry(R - 0.01, 128), face, medal, [0, 0, T / 2 + 0.002]);
  add(new THREE.CircleGeometry(R - 0.01, 128), face, medal, [0, 0, -T / 2 - 0.002], [0, Math.PI, 0]);
  const orbits = [[2.2, 0.01, gold, [1.3, 0.3, 0]], [2.6, 0.006, bronze, [0.35, 1.2, 0.2]], [3.0, 0.005, gold, [1.9, -0.6, 0.5]]]
    .map(([r, t, mat, rot]) => add(new THREE.TorusGeometry(r, t, 10, 220), mat, emblem, [0, 0, 0], rot));
  const halo = new THREE.Mesh(new THREE.RingGeometry(1.75, 3.5, 96), new THREE.MeshBasicMaterial({ color: 0xc5a059, transparent: true, opacity: 0.03, depthWrite: false, blending: THREE.AdditiveBlending }));
  halo.position.z = -0.5; emblem.add(halo);
  const key = new THREE.DirectionalLight(0xffe8c8, 1.6); key.position.set(-4, 5, 7); scene.add(key);
  const rim = new THREE.PointLight(0xc5a059, 40, 14); rim.position.set(3, -1.5, -2.5); scene.add(rim);

  // Estrellas
  const N = small() ? 700 : 1600, ZF = -160, ZN = 12;
  const pos = new Float32Array(N * 6), col = new Float32Array(N * 6), st = new Float32Array(N * 3);
  const seed = (i, z) => { let x, y; do { x = (Math.random() - 0.5) * 80; y = (Math.random() - 0.5) * 50; } while (x * x + y * y < 4); st[i * 3] = x; st[i * 3 + 1] = y; st[i * 3 + 2] = z; };
  for (let i = 0; i < N; i++) {
    seed(i, ZF + Math.random() * (ZN - ZF));
    const g = Math.random() < 0.22, b = 0.55 + Math.random() * 0.45;
    col.set(g ? [0.77 * b, 0.63 * b, 0.35 * b] : [0.95 * b, 0.93 * b, 0.9 * b], i * 6); col.set([0, 0, 0], i * 6 + 3);
  }
  const sGeo = new THREE.BufferGeometry();
  sGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); sGeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const stars = new THREE.LineSegments(sGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
  stars.frustumCulled = false; scene.add(stars);
  const dGeo = new THREE.BufferGeometry(); dGeo.setAttribute("position", new THREE.BufferAttribute(st, 3));
  const dots = new THREE.Points(dGeo, new THREE.PointsMaterial({ color: 0xf3efe7, size: small() ? 0.09 : 0.07, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
  dots.frustumCulled = false; scene.add(dots);

  const resize = () => { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); };
  resize(); addEventListener("resize", resize);

  const cur = { x: 0, y: 0, z: 0, s: 1 }, tanH = Math.tan(17 * Math.PI / 180);
  let last = performance.now() / 1000, spin = 0, first = true, speed = 60, init = true;
  const tick = () => {
    requestAnimationFrame(tick);
    if (document.hidden) return;
    const now = performance.now() / 1000, dt = Math.min(0.05, now - last); last = now;
    const m = S.mouse, calm = S.reduce ? 0.15 : 1;
    m.x += (m.tx - m.x) * 0.05; m.y += (m.ty - m.y) * 0.05;
    const e = easeOut(S.introT0 == null ? 0 : (now - S.introT0) / 2.6);
    S.scrollVel *= 0.9;
    const boost = now < S.boostT ? Math.sin(Math.min(1, (S.boostT - now) / 1.6) * Math.PI) : 0;
    const warp = S.introT0 == null ? 38 : 150 * (1 - easeOut((now - S.introT0) / 2.6 * 1.1));
    const target = (7 + Math.min(60, Math.abs(S.scrollVel) * 0.9) + warp + boost * 190) * calm;
    speed += (target - speed) * 0.08;
    const tail = Math.max(0.06, speed * 0.045);
    for (let i = 0; i < N; i++) {
      let z = st[i * 3 + 2] + speed * dt;
      if (z > ZN) { seed(i, ZF); z = ZF; }
      st[i * 3 + 2] = z;
      const x = st[i * 3], y = st[i * 3 + 1], o = i * 6;
      pos[o] = x; pos[o + 1] = y; pos[o + 2] = z; pos[o + 3] = x; pos[o + 4] = y; pos[o + 5] = z - tail;
    }
    sGeo.attributes.position.needsUpdate = true; dGeo.attributes.position.needsUpdate = true;
    camera.position.z = 40 - 30 * e;
    camera.position.x += (m.x * 0.6 - camera.position.x) * 0.04;
    camera.position.y += (-m.y * 0.4 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
    const wide = innerWidth >= 900 && camera.aspect > 1.1;
    const P = pose(S, wide, camera.aspect), d = 10 - P.z;
    const tx = P.xf * tanH * d * camera.aspect, ty = P.yf * tanH * d;
    const a = init ? 1 : 0.05; init = false;
    cur.x += (tx - cur.x) * a; cur.y += (ty - cur.y) * a; cur.z += (P.z - cur.z) * a; cur.s += (P.s - cur.s) * a;
    spin += dt * (0.25 + (1 - e) * 5 + boost * 4) * calm;
    medal.rotation.y = Math.sin(spin * 0.6) * 0.45 + m.x * 0.55 + (1 - e) * 6 + boost * 1.2;
    medal.rotation.x = m.y * 0.35 + Math.sin(now * 0.5) * 0.06;
    orbits.forEach((o, i) => { o.rotation.x += dt * (0.12 + i * 0.05) * calm; o.rotation.y += dt * (i % 2 ? -0.08 : 0.07) * calm; });
    emblem.scale.setScalar(cur.s * (0.25 + 0.75 * e));
    emblem.position.set(cur.x + m.x * 0.12, cur.y + Math.sin(now * 0.8) * 0.08, cur.z);
    renderer.render(scene, camera);
    if (first) { first = false; alListo(); }
  };
  tick();
}
