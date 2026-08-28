import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

/* ================== ZeusCode — topology field (global network) ================== */

const CITIES = [
  ["Москва", 55.75, 37.62], ["Санкт-Петербург", 59.94, 30.31],
  ["Алматы", 43.24, 76.89], ["Астана", 51.17, 71.43],
  ["Ташкент", 41.30, 69.24], ["Минск", 53.90, 27.57],
  ["Киев", 50.45, 30.52], ["Тбилиси", 41.72, 44.79],
  ["Ереван", 40.18, 44.51], ["Баку", 40.41, 49.87],
  ["Новосибирск", 55.03, 82.92], ["Екатеринбург", 56.84, 60.65],
  ["Владивосток", 43.12, 131.89], ["Стамбул", 41.01, 28.98],
  ["Лондон", 51.51, -0.13], ["Франкфурт", 50.11, 8.68],
  ["Амстердам", 52.37, 4.90], ["Париж", 48.86, 2.35],
  ["Мадрид", 40.42, -3.70], ["Стокгольм", 59.33, 18.07],
  ["Дубай", 25.20, 55.27], ["Тель-Авив", 32.08, 34.78],
  ["Нью-Йорк", 40.71, -74.01], ["Эшбёрн", 39.04, -77.49],
  ["Сан-Франциско", 37.77, -122.42], ["Сиэтл", 47.61, -122.33],
  ["Чикаго", 41.88, -87.63], ["Сан-Паулу", -23.55, -46.63],
  ["Токио", 35.68, 139.69], ["Сеул", 37.57, 126.98],
  ["Пекин", 39.90, 116.41], ["Гонконг", 22.32, 114.17],
  ["Сингапур", 1.35, 103.82], ["Мумбаи", 19.08, 72.88],
  ["Сидней", -33.87, 151.21], ["Йоханнесбург", -26.20, 28.05],
  ["Лагос", 6.52, 3.38], ["Найроби", -1.29, 36.82],
];

const R = 1;

function toVec3(lat, lon, r = R) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

function fibonacciSphere(count, r) {
  const pts = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const rad = Math.sqrt(Math.max(0, 1 - y * y));
    const th = golden * i;
    pts.push(new THREE.Vector3(Math.cos(th) * rad * r, y * r, Math.sin(th) * rad * r));
  }
  return pts;
}
/* ---------- links: near neighbours + long-haul (through oceans) ---------- */
function buildLinks(nodes) {
  const seen = new Set();
  const links = [];
  const push = (a, b) => {
    if (a === b) return;
    const k = a < b ? a + ":" + b : b + ":" + a;
    if (seen.has(k)) return;
    seen.add(k);
    links.push([a, b]);
  };

  for (let i = 0; i < nodes.length; i++) {
    const d = [];
    for (let j = 0; j < nodes.length; j++) {
      if (i !== j) d.push([j, nodes[i].distanceToSquared(nodes[j])]);
    }
    d.sort((x, y) => x[1] - y[1]);
    push(i, d[0][0]);
    push(i, d[1][0]);
  }

  let guard = 0;
  while (links.length < nodes.length + 22 && guard++ < 400) {
    const a = (Math.random() * nodes.length) | 0;
    const b = (Math.random() * nodes.length) | 0;
    if (nodes[a].distanceTo(nodes[b]) > 1.15) push(a, b);
  }
  return links;
}

function arcCurve(a, b) {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const lift = R + 0.12 + a.distanceTo(b) * 0.34;
  mid.normalize().multiplyScalar(lift);
  return new THREE.QuadraticBezierCurve3(a, mid, b);
}
/* ---------- boot ---------- */
const canvas = document.getElementById("bgGlobe");
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canvas && !reduce) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 3.15);

  const group = new THREE.Group();
  group.rotation.z = -0.28;
  scene.add(group);

  /* occluder: hides arcs on the far hemisphere */
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(R * 0.992, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0x07070d })
  );
  group.add(core);

  /* land-agnostic dot shell */
  const shellPts = fibonacciSphere(2600, R * 1.001);
  const shellGeo = new THREE.BufferGeometry().setFromPoints(shellPts);
  group.add(new THREE.Points(shellGeo, new THREE.PointsMaterial({
    color: 0x5b6bff, size: 0.0075, transparent: true, opacity: 0.34,
    depthWrite: false, blending: THREE.AdditiveBlending
  })));

  /* atmosphere (fresnel rim) */
  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.16, 48, 48),
    new THREE.ShaderMaterial({
      transparent: true, side: THREE.BackSide, depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: "varying vec3 vN; varying vec3 vP;\nvoid main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vP=mv.xyz; gl_Position=projectionMatrix*mv; }",
      fragmentShader: "varying vec3 vN; varying vec3 vP;\nvoid main(){ float f=pow(1.0-abs(dot(normalize(vN),normalize(-vP))),2.6); gl_FragColor=vec4(mix(vec3(0.31,0.55,1.0),vec3(0.13,0.83,0.93),f)*f,f*0.55); }"
    })
  );
  group.add(atmo);
  /* city nodes */
  const nodes = CITIES.map((c) => toVec3(c[1], c[2], R * 1.004));
  const nodeGeo = new THREE.BufferGeometry().setFromPoints(nodes);
  const nodePhase = new Float32Array(nodes.length);
  for (let i = 0; i < nodes.length; i++) nodePhase[i] = Math.random() * Math.PI * 2;
  const nodeMat = new THREE.PointsMaterial({
    color: 0xbfd0ff, size: 0.032, transparent: true, opacity: 0.95,
    depthWrite: false, blending: THREE.AdditiveBlending
  });
  group.add(new THREE.Points(nodeGeo, nodeMat));

  /* arcs */
  const links = buildLinks(nodes);
  const SEG = 40;
  const curves = links.map((l) => arcCurve(nodes[l[0]], nodes[l[1]]));
  const aPos = [];
  const aCol = [];
  const cA = new THREE.Color(0x7c5cff);
  const cB = new THREE.Color(0x22d3ee);
  curves.forEach((cv, li) => {
    const pts = cv.getPoints(SEG);
    const base = li % 2 ? cB : cA;
    for (let i = 0; i < SEG; i++) {
      const p0 = pts[i], p1 = pts[i + 1];
      const t0 = i / SEG, t1 = (i + 1) / SEG;
      const f = (t) => Math.sin(Math.PI * t) * 0.85 + 0.06;
      aPos.push(p0.x, p0.y, p0.z, p1.x, p1.y, p1.z);
      const g0 = f(t0), g1 = f(t1);
      aCol.push(base.r * g0, base.g * g0, base.b * g0, base.r * g1, base.g * g1, base.b * g1);
    }
  });
  const arcGeo = new THREE.BufferGeometry();
  arcGeo.setAttribute("position", new THREE.Float32BufferAttribute(aPos, 3));
  arcGeo.setAttribute("color", new THREE.Float32BufferAttribute(aCol, 3));
  group.add(new THREE.LineSegments(arcGeo, new THREE.LineBasicMaterial({
    vertexColors: true, transparent: true, opacity: 0.5,
    depthWrite: false, blending: THREE.AdditiveBlending
  })));
  /* travelling packets */
  const samples = curves.map((cv) => cv.getPoints(120));
  const PKT = Math.min(curves.length, 90);
  const pkt = [];
  for (let i = 0; i < PKT; i++) {
    pkt.push({
      c: (Math.random() * curves.length) | 0,
      t: Math.random(),
      v: 0.12 + Math.random() * 0.22,
      dir: Math.random() < 0.5 ? 1 : -1
    });
  }
  const pktPos = new Float32Array(PKT * 3);
  const pktGeo = new THREE.BufferGeometry();
  pktGeo.setAttribute("position", new THREE.BufferAttribute(pktPos, 3));
  group.add(new THREE.Points(pktGeo, new THREE.PointsMaterial({
    color: 0x9fe8ff, size: 0.026, transparent: true, opacity: 0.95,
    depthWrite: false, blending: THREE.AdditiveBlending
  })));

  /* ---------- interaction / loop ---------- */
  let mx = 0, my = 0, tx = 0, ty = 0;
  window.addEventListener("pointermove", (e) => {
    tx = (e.clientX / window.innerWidth - 0.5) * 0.5;
    ty = (e.clientY / window.innerHeight - 0.5) * 0.35;
  }, { passive: true });

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w < 760 ? 4.1 : 3.15;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  let fade = 1;
  function onScroll() {
    const p = Math.min(window.scrollY / 900, 1);
    fade = 1 - p * 0.72;
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  const clock = new THREE.Clock();
  let intro = 0;
  let shown = -1;

  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    group.rotation.y += dt * 0.055;
    mx += (tx - mx) * 0.05;
    my += (ty - my) * 0.05;
    group.rotation.x = my;
    camera.position.x = mx * 0.6;
    camera.lookAt(0, 0, 0);

    nodeMat.size = 0.03 + Math.sin(t * 1.6) * 0.004;

    for (let i = 0; i < PKT; i++) {
      const p = pkt[i];
      p.t += p.v * dt * p.dir;
      if (p.t > 1 || p.t < 0) {
        p.dir *= -1;
        p.t = Math.max(0, Math.min(1, p.t));
        if (Math.random() < 0.3) p.c = (Math.random() * curves.length) | 0;
      }
      const s = samples[p.c];
      const v = s[Math.min(s.length - 1, (p.t * (s.length - 1)) | 0)];
      pktPos[i * 3] = v.x;
      pktPos[i * 3 + 1] = v.y;
      pktPos[i * 3 + 2] = v.z;
    }
    pktGeo.attributes.position.needsUpdate = true;

    intro = Math.min(1, intro + dt * 0.85);
    const op = fade * intro;
    if (Math.abs(op - shown) > 0.004) {
      shown = op;
      canvas.style.opacity = op.toFixed(3);
    }
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  frame();
}
