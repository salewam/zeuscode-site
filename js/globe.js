import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

/* ================== ZeusCode — energy orb (subtle background) ================== */

const R = 1;

const canvas = document.getElementById("bgGlobe");
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canvas && !reduce) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 6.4);

  const group = new THREE.Group();
  group.position.y = -0.2;
  scene.add(group);

  /* Core orb with layered FBM-like shader */
  const orbGeo = new THREE.SphereGeometry(R, 64, 64);
  const orbMat = new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      time: { value: 0 },
      opacity: { value: 0.2 }
    },
    vertexShader: `
      varying vec3 vPos;
      varying vec3 vNormal;
      void main() {
        vPos = position;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float opacity;
      varying vec3 vPos;
      varying vec3 vNormal;

      float noise(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float n = i.x + i.y * 57.0 + 113.0 * i.z;
        return mix(
          mix(mix(fract(sin(n) * 43758.5), fract(sin(n + 1.0) * 43758.5), f.x),
              mix(fract(sin(n + 57.0) * 43758.5), fract(sin(n + 58.0) * 43758.5), f.x), f.y),
          mix(mix(fract(sin(n + 113.0) * 43758.5), fract(sin(n + 114.0) * 43758.5), f.x),
              mix(fract(sin(n + 170.0) * 43758.5), fract(sin(n + 171.0) * 43758.5), f.x), f.y),
          f.z
        );
      }

      float fbm(vec3 p) {
        float v = 0.0, a = 0.5;
        for (int i = 0; i < 4; i++) {
          v += noise(p) * a;
          p *= 2.01;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec3 p = vPos * 1.8 + vec3(time * 0.08, time * 0.05, time * 0.06);
        float n = fbm(p);
        vec3 col = mix(vec3(0.08, 0.24, 0.42), vec3(0.35, 0.72, 0.95), n);
        col = mix(col, vec3(0.49, 0.83, 0.99), pow(n, 2.2) * 0.5);
        float alpha = (n * 0.6 + 0.2) * opacity;
        gl_FragColor = vec4(col, alpha);
      }
    `
  });
  const orb = new THREE.Mesh(orbGeo, orbMat);
  group.add(orb);

  /* Rim glow (fresnel) */
  const rimGeo = new THREE.SphereGeometry(R * 1.08, 48, 48);
  const rimMat = new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.BackSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { opacity: { value: 0.14 } },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform float opacity;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        float f = pow(1.0 - abs(dot(vNormal, vView)), 3.6);
        vec3 col = mix(vec3(0.18, 0.45, 0.68), vec3(0.49, 0.83, 0.99), f);
        gl_FragColor = vec4(col * f, f * opacity);
      }
    `
  });
  group.add(new THREE.Mesh(rimGeo, rimMat));

  /* Star dust (far, depth-aware, barely there) */
  const dustCount = 900;
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    const r = 3.5 + Math.random() * 6;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(Math.random() * 2 - 1);
    dustPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    dustPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
    dustPos[i * 3 + 2] = r * Math.cos(ph);
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  scene.add(new THREE.Points(dustGeo, new THREE.PointsMaterial({
    color: 0x7d8fa8, size: 0.02, transparent: true, opacity: 0.22,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
  })));

  /* Requests flying around the planet — random inclined orbits */
  const ORB_N = 90;
  const TRAIL = 7;
  const reqs = [];
  for (let i = 0; i < ORB_N; i++) {
    const r = R * (1.13 + Math.random() * 0.55);
    const inc = Math.random() * Math.PI;
    const node = Math.random() * Math.PI * 2;
    reqs.push({
      r, inc, node,
      a: Math.random() * Math.PI * 2,
      v: (0.16 + Math.random() * 0.3) * (Math.random() < 0.5 ? 1 : -1),
      hot: Math.random() < 0.4
    });
  }
  const reqPos = new Float32Array(ORB_N * TRAIL * 3);
  const reqCol = new Float32Array(ORB_N * TRAIL * 3);
  const reqGeo = new THREE.BufferGeometry();
  reqGeo.setAttribute("position", new THREE.BufferAttribute(reqPos, 3));
  reqGeo.setAttribute("color", new THREE.BufferAttribute(reqCol, 3));
  const cDim = new THREE.Color(0x4a7fa0);
  const cHot = new THREE.Color(0xa8e4ff);
  for (let i = 0; i < ORB_N; i++) {
    const c = reqs[i].hot ? cHot : cDim;
    for (let k = 0; k < TRAIL; k++) {
      const g = 1 - k / TRAIL;
      const o = (i * TRAIL + k) * 3;
      reqCol[o] = c.r * g;
      reqCol[o + 1] = c.g * g;
      reqCol[o + 2] = c.b * g;
    }
  }
  group.add(new THREE.Points(reqGeo, new THREE.PointsMaterial({
    size: 0.028, transparent: true, opacity: 0.72, vertexColors: true,
    depthWrite: false, blending: THREE.AdditiveBlending
  })));

  function reqPoint(q, a, out) {
    const x = Math.cos(a) * q.r;
    const z = Math.sin(a) * q.r;
    const y = z * Math.sin(q.inc);
    const z2 = z * Math.cos(q.inc);
    out.set(
      x * Math.cos(q.node) - z2 * Math.sin(q.node),
      y,
      x * Math.sin(q.node) + z2 * Math.cos(q.node)
    );
  }
  const tmp = new THREE.Vector3();

  /* Interaction / loop */
  let mx = 0, my = 0, tx = 0, ty = 0;
  window.addEventListener("pointermove", (e) => {
    tx = (e.clientX / window.innerWidth - 0.5) * 0.3;
    ty = (e.clientY / window.innerHeight - 0.5) * 0.2;
  }, { passive: true });

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w < 760 ? 8.2 : 6.4;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  let fade = 1;
  function onScroll() {
    const p = Math.min(window.scrollY / 900, 1);
    fade = 1 - p * 0.75;
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const clock = new THREE.Clock();
  let intro = 0;
  let shown = -1;

  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    orbMat.uniforms.time.value = t;

    group.rotation.y += dt * 0.04;
    mx += (tx - mx) * 0.04;
    my += (ty - my) * 0.04;
    group.rotation.x = my * 0.6;
    camera.position.x = mx * 0.4;
    camera.lookAt(0, 0, 0);

    /* Requests orbit the planet */
    for (let i = 0; i < ORB_N; i++) {
      const q = reqs[i];
      q.a += q.v * dt;
      for (let k = 0; k < TRAIL; k++) {
        reqPoint(q, q.a - k * 0.035 * Math.sign(q.v), tmp);
        const o = (i * TRAIL + k) * 3;
        reqPos[o] = tmp.x;
        reqPos[o + 1] = tmp.y;
        reqPos[o + 2] = tmp.z;
      }
    }
    reqGeo.attributes.position.needsUpdate = true;

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
