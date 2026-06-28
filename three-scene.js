const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let THREE;

const loadThree = async () => {
  if (!THREE) {
    THREE = await import("https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js");
  }
  return THREE;
};

const lazyScene = (canvas, setup) => {
  if (!canvas) return;

  const observer = new IntersectionObserver(
    async (entries) => {
      const entry = entries.find((item) => item.isIntersecting);
      if (!entry) return;
      observer.disconnect();
      try {
        await setup(canvas, await loadThree());
        canvas.dataset.ready = "true";
      } catch (error) {
        canvas.dataset.ready = "false";
        canvas.closest("section")?.classList.add("three-fallback");
      }
    },
    { rootMargin: "180px" }
  );

  observer.observe(canvas);
};

const createRenderer = (canvas, T) => {
  const renderer = new T.WebGLRenderer({ alpha: true, antialias: true, canvas });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  return renderer;
};

const resizeRenderer = (renderer, camera, canvas) => {
  const box = canvas.parentElement.getBoundingClientRect();
  const width = Math.max(1, Math.floor(box.width));
  const height = Math.max(1, Math.floor(box.height));
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
};

const setupGraphScene = async (canvas, T, mode) => {
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(mode === "hero" ? 58 : 52, 1, 0.1, 120);
  camera.position.set(0, mode === "hero" ? 0.25 : 0.6, mode === "hero" ? 9.4 : 8.2);

  const renderer = createRenderer(canvas, T);
  const graph = new T.Group();
  scene.add(graph);

  const hubMaterial = new T.MeshStandardMaterial({
    color: 0x5eead4,
    emissive: 0x2563eb,
    emissiveIntensity: 0.7,
    roughness: 0.28,
    metalness: 0.28
  });

  const satelliteMaterials = [0x5eead4, 0x3b82f6, 0xf59e0b, 0x93c5fd, 0x8dff7a].map(
    (color) => new T.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.3, roughness: 0.35 })
  );

  const hubGeometry = new T.SphereGeometry(mode === "hero" ? 0.19 : 0.16, 28, 28);
  const nodeGeometry = new T.SphereGeometry(0.065, 18, 18);
  const nodes = [];
  const hubs = mode === "hero" ? 5 : 6;
  const satellitesPerHub = mode === "hero" ? 9 : 6;

  for (let hubIndex = 0; hubIndex < hubs; hubIndex += 1) {
    const hub = new T.Mesh(hubGeometry, hubMaterial.clone());
    const hubAngle = (hubIndex / hubs) * Math.PI * 2;
    hub.userData = {
      hub: true,
      angle: hubAngle,
      radius: mode === "hero" ? 2.2 + (hubIndex % 2) * 1.15 : 1.8 + (hubIndex % 3) * 0.55,
      y: Math.sin(hubIndex * 1.7) * 0.9,
      speed: 0.06 + hubIndex * 0.008
    };
    nodes.push(hub);
    graph.add(hub);

    for (let satelliteIndex = 0; satelliteIndex < satellitesPerHub; satelliteIndex += 1) {
      const node = new T.Mesh(nodeGeometry, satelliteMaterials[(hubIndex + satelliteIndex) % satelliteMaterials.length]);
      node.userData = {
        parent: hub,
        localAngle: (satelliteIndex / satellitesPerHub) * Math.PI * 2,
        localRadius: 0.46 + (satelliteIndex % 3) * 0.18,
        bob: Math.random() * Math.PI * 2
      };
      nodes.push(node);
      graph.add(node);
    }
  }

  const lineGeometry = new T.BufferGeometry();
  const linePositions = new Float32Array(nodes.length * 2 * 3);
  lineGeometry.setAttribute("position", new T.BufferAttribute(linePositions, 3));
  const lines = new T.LineSegments(
    lineGeometry,
    new T.LineBasicMaterial({ color: 0x5eead4, transparent: true, opacity: mode === "hero" ? 0.17 : 0.22 })
  );
  graph.add(lines);

  const ringMaterial = new T.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.16, side: T.DoubleSide });
  const ringCount = mode === "pipeline" ? 5 : 3;
  const rings = [];
  for (let index = 0; index < ringCount; index += 1) {
    const ring = new T.Mesh(new T.TorusGeometry(1.25 + index * 0.75, 0.008, 10, 180), ringMaterial.clone());
    ring.rotation.x = Math.PI / (2.1 + index * 0.08);
    ring.rotation.y = index * 0.22;
    rings.push(ring);
    graph.add(ring);
  }

  const starGeometry = new T.BufferGeometry();
  const starPositions = [];
  const stars = mode === "hero" ? 280 : 150;
  for (let index = 0; index < stars; index += 1) {
    starPositions.push((Math.random() - 0.5) * 18, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
  }
  starGeometry.setAttribute("position", new T.Float32BufferAttribute(starPositions, 3));
  const starField = new T.Points(
    starGeometry,
    new T.PointsMaterial({ color: 0xd7f8ff, size: mode === "hero" ? 0.018 : 0.014, transparent: true, opacity: 0.45 })
  );
  scene.add(starField);

  scene.add(new T.AmbientLight(0xffffff, 0.58));
  const key = new T.PointLight(0x5eead4, 4.2, 14);
  key.position.set(3.6, 2.8, 5.2);
  scene.add(key);
  const fill = new T.PointLight(0x3b82f6, 3, 12);
  fill.position.set(-4, -2.5, 4);
  scene.add(fill);

  const mouse = { x: 0, y: 0 };
  if (mode === "hero" && !reduceMotion) {
    window.addEventListener("pointermove", (event) => {
      mouse.x = (event.clientX / window.innerWidth - 0.5) * 0.34;
      mouse.y = (event.clientY / window.innerHeight - 0.5) * 0.22;
    });
  }

  const resize = () => resizeRenderer(renderer, camera, canvas);
  resize();
  window.addEventListener("resize", resize);

  const animate = (time = 0) => {
    const seconds = time * 0.001;
    graph.rotation.y = reduceMotion ? 0.12 : seconds * (mode === "hero" ? 0.08 : 0.11) + mouse.x;
    graph.rotation.x = reduceMotion ? 0.04 : Math.sin(seconds * 0.22) * 0.08 + mouse.y;
    starField.rotation.y = reduceMotion ? 0 : -seconds * 0.018;

    nodes.forEach((node, index) => {
      if (node.userData.hub) {
        const angle = node.userData.angle + seconds * node.userData.speed;
        node.position.set(Math.cos(angle) * node.userData.radius, node.userData.y, Math.sin(angle) * node.userData.radius);
        const scale = 1 + Math.sin(seconds * 2.2 + index) * 0.14;
        node.scale.setScalar(scale);
      } else {
        const parent = node.userData.parent;
        const angle = node.userData.localAngle + seconds * 0.55;
        node.position.set(
          parent.position.x + Math.cos(angle) * node.userData.localRadius,
          parent.position.y + Math.sin(seconds + node.userData.bob) * 0.14,
          parent.position.z + Math.sin(angle) * node.userData.localRadius
        );
      }
    });

    const positions = lineGeometry.attributes.position.array;
    let offset = 0;
    nodes.forEach((node) => {
      if (node.userData.hub) {
        positions[offset] = 0;
        positions[offset + 1] = 0;
        positions[offset + 2] = 0;
      } else {
        positions[offset] = node.userData.parent.position.x;
        positions[offset + 1] = node.userData.parent.position.y;
        positions[offset + 2] = node.userData.parent.position.z;
      }
      positions[offset + 3] = node.position.x;
      positions[offset + 4] = node.position.y;
      positions[offset + 5] = node.position.z;
      offset += 6;
    });
    lineGeometry.attributes.position.needsUpdate = true;

    rings.forEach((ring, index) => {
      ring.rotation.z += reduceMotion ? 0 : 0.0012 + index * 0.0003;
    });

    renderer.render(scene, camera);
    if (!reduceMotion) requestAnimationFrame(animate);
  };

  animate();
};

lazyScene(document.querySelector("#heroCanvas"), (canvas, T) => setupGraphScene(canvas, T, "hero"));
lazyScene(document.querySelector("#pipelineCanvas"), (canvas, T) => setupGraphScene(canvas, T, "pipeline"));
lazyScene(document.querySelector("#contactCanvas"), (canvas, T) => setupGraphScene(canvas, T, "contact"));
