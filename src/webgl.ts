import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DecalGeometry } from "three/addons/geometries/DecalGeometry.js";
import cursorTexture from "./assets/textures/cursor_white.png";
import { Pane } from "tweakpane";

const initScene = (canvasEl: HTMLCanvasElement) => {
  const raycaster = new THREE.Raycaster();
  const pane = new Pane();
  const PARAMS = {
    color: "#ff0000",
    radius: 1,
    sculpt: 1,
    threshold: 0.15,
    intensity: 0.01,
    wireframe: true,
  };

  pane.addBinding(PARAMS, "sculpt", { step: 2, min: -1, max: 1 });
  pane.addBinding(PARAMS, "intensity", { step: 0.01, min: 0, max: 0.05 });

  const scene = new THREE.Scene();
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
  camera.position.z = 3;
  scene.add(camera);
  const mouseHelper = new THREE.Mesh(
    new THREE.BoxGeometry(0.01, 0.01, 1),
    new THREE.MeshNormalMaterial()
  );
  scene.add(mouseHelper);
  const renderer = new THREE.WebGLRenderer({
    canvas: canvasEl,
  });

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.update();

  renderer.setSize(sizes.width, sizes.height);
  const planetGeometry = new THREE.SphereGeometry(1, 100, 100);

  const planetMesh = new THREE.Mesh(
    planetGeometry,
    new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      wireframe: PARAMS.wireframe,
    })
  );

  pane.addBinding(PARAMS, "wireframe").on("change", (e) => {
    planetMesh.material.wireframe = e.value;
  });

  planetMesh.name = "planet";
  scene.add(planetMesh);
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 2, 3);
  light.lookAt(0, 0, 0);
  scene.add(light);
  const pointer = new THREE.Vector2();
  function onPointerMove(event: PointerEvent) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }
  let mousedown = false;
  document.addEventListener("mousedown", () => {
    mousedown = true;
  });
  document.addEventListener("mouseup", () => {
    controls.enabled = true;
    mousedown = false;
  });
  let decalText = new THREE.TextureLoader().load(cursorTexture);
  let decal = new THREE.Mesh();
  window.addEventListener("pointermove", onPointerMove);
  function animate() {
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    requestAnimationFrame(animate);
    intersects.forEach((intersect, i) => {
      if (intersect.object.name !== "planet") return;
      if (decal) {
        decal.geometry.dispose();
      }
      if (!intersects[i].face?.normal) return;
      mouseHelper.position.copy(intersects[i].point);
      mouseHelper.lookAt(new THREE.Vector3(0, 0, 0));
      const orientation = new THREE.Euler();
      orientation.copy(mouseHelper.rotation);
      const decalGeometry = new DecalGeometry(
        planetMesh,
        intersects[i].point,
        orientation,
        new THREE.Vector3(0.2, 0.2, 0.2)
      );
      decal.geometry = decalGeometry;
      decal.material = new THREE.MeshBasicMaterial({
        map: decalText,
        transparent: true,
        depthTest: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      });

      scene.add(decal);
      if (mousedown) {
        controls.enabled = false;
        const face = intersects[i].face;
        const vertexIndex = face?.a;
        const position = planetGeometry.attributes.position;
        const vertex = new THREE.Vector3().fromBufferAttribute(
          position,
          vertexIndex
        );
        for (
          let i = 0;
          i < planetGeometry.attributes.position.array.length;
          i += 3
        ) {
          const neighbourVertex = new THREE.Vector3(
            planetGeometry.attributes.position.array[i],
            planetGeometry.attributes.position.array[i + 1],
            planetGeometry.attributes.position.array[i + 2]
          );

          const distance = neighbourVertex.distanceTo(vertex);
          if (distance < PARAMS.threshold) {
            const savedVertex = new THREE.Vector3(
              planetGeometry.attributes.position.array[i],
              planetGeometry.attributes.position.array[i + 1],
              planetGeometry.attributes.position.array[i + 2]
            );
            const dist2Center = neighbourVertex.distanceTo(
              new THREE.Vector3(0, 0, 0)
            );
            const factor =
              (dist2Center + PARAMS.sculpt * PARAMS.intensity) / dist2Center;
            savedVertex.multiplyScalar(
              1 +
                PARAMS.sculpt *
                  Math.abs(1 - factor) *
                  (1 - distance / PARAMS.threshold)
            );
            planetGeometry.attributes.position.array[i] = savedVertex.x;
            planetGeometry.attributes.position.array[i + 1] = savedVertex.y;
            planetGeometry.attributes.position.array[i + 2] = savedVertex.z;
          }
        }
        position.needsUpdate = true;
      }
    });
    controls.update();
    // required if controls.enableDamping or controls.autoRotate are set to true
    renderer.render(scene, camera);
  }
  animate();
};

export { initScene };
