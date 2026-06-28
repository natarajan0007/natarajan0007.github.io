const canvas = document.querySelector("#threeCanvas");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canvas && !reduceMotion) {
  try {
    const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      canvas
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    camera.position.set(0, 0.7, 8);

    const group = new THREE.Group();
    scene.add(group);

    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.1, 3),
      new THREE.MeshStandardMaterial({
        color: 0x38f2b3,
        emissive: 0x0f766e,
        emissiveIntensity: 0.75,
        roughness: 0.34,
        metalness: 0.42,
        transparent: true,
        opacity: 0.88
      })
    );
    group.add(core);

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x38d5ff,
      transparent: true,
      opacity: 0.32,
      side: THREE.DoubleSide
    });

    const rings = [
      new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.012, 12, 160), ringMaterial),
      new THREE.Mesh(new THREE.TorusGeometry(3.25, 0.01, 12, 180), ringMaterial.clone()),
      new THREE.Mesh(new THREE.TorusGeometry(4.35, 0.008, 12, 220), ringMaterial.clone())
    ];

    rings[0].rotation.x = Math.PI / 2.6;
    rings[1].rotation.x = Math.PI / 1.85;
    rings[1].rotation.y = Math.PI / 5;
    rings[2].rotation.x = Math.PI / 2.1;
    rings[2].rotation.z = Math.PI / 7;
    rings.forEach((ring) => group.add(ring));

    const nodeGeometry = new THREE.SphereGeometry(0.095, 18, 18);
    const nodeMaterials = [0x38d5ff, 0xffbe5c, 0xff6b8a, 0x9b8cff, 0x8dff7a].map(
      (color) =>
        new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.38,
          roughness: 0.22,
          metalness: 0.18
        })
    );

    const orbitNodes = [];
    for (let index = 0; index < 34; index += 1) {
      const angle = (index / 34) * Math.PI * 2;
      const radius = 2.1 + (index % 3) * 1.1;
      const node = new THREE.Mesh(nodeGeometry, nodeMaterials[index % nodeMaterials.length]);
      node.userData = {
        angle,
        radius,
        speed: 0.0018 + (index % 5) * 0.00028,
        y: Math.sin(index * 1.37) * 0.72
      };
      orbitNodes.push(node);
      group.add(node);
    }

    const starGeometry = new THREE.BufferGeometry();
    const starPositions = [];
    for (let index = 0; index < 520; index += 1) {
      starPositions.push(
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 9,
        (Math.random() - 0.5) * 9
      );
    }
    starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({
        color: 0xd7f8ff,
        size: 0.018,
        transparent: true,
        opacity: 0.72
      })
    );
    scene.add(stars);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x38d5ff,
      transparent: true,
      opacity: 0.13
    });
    const connectorGeometry = new THREE.BufferGeometry();
    const connectorPositions = new Float32Array(orbitNodes.length * 2 * 3);
    connectorGeometry.setAttribute("position", new THREE.BufferAttribute(connectorPositions, 3));
    const connectors = new THREE.LineSegments(connectorGeometry, lineMaterial);
    group.add(connectors);

    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const keyLight = new THREE.PointLight(0x38d5ff, 4.5, 14);
    keyLight.position.set(3.6, 3.2, 4.8);
    scene.add(keyLight);
    const fillLight = new THREE.PointLight(0xffbe5c, 2.2, 12);
    fillLight.position.set(-4, -2, 3.4);
    scene.add(fillLight);

    const resize = () => {
      const section = canvas.closest(".three-showcase");
      const width = section.clientWidth;
      const height = section.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const animate = (time) => {
      const seconds = time * 0.001;
      group.rotation.y = seconds * 0.14;
      group.rotation.x = Math.sin(seconds * 0.35) * 0.09;
      core.rotation.x += 0.004;
      core.rotation.y += 0.006;
      rings[0].rotation.z += 0.0028;
      rings[1].rotation.z -= 0.0022;
      rings[2].rotation.y += 0.0018;
      stars.rotation.y -= 0.0008;

      const positions = connectorGeometry.attributes.position.array;
      orbitNodes.forEach((node, index) => {
        const a = node.userData.angle + seconds * node.userData.speed * 90;
        node.position.set(
          Math.cos(a) * node.userData.radius,
          node.userData.y + Math.sin(a * 1.7) * 0.28,
          Math.sin(a) * node.userData.radius
        );
        node.scale.setScalar(1 + Math.sin(seconds * 2.2 + index) * 0.18);

        const offset = index * 6;
        positions[offset] = 0;
        positions[offset + 1] = 0;
        positions[offset + 2] = 0;
        positions[offset + 3] = node.position.x;
        positions[offset + 4] = node.position.y;
        positions[offset + 5] = node.position.z;
      });
      connectorGeometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    requestAnimationFrame(animate);
    canvas.dataset.ready = "true";
  } catch (error) {
    canvas.dataset.ready = "false";
    canvas.closest(".three-showcase")?.classList.add("three-fallback");
  }
}
