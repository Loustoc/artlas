import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DecalGeometry } from "three/addons/geometries/DecalGeometry.js";
import cursorTexture from "./assets/textures/cursor_white.png";
import { Pane } from "tweakpane";
import PlanetFragmentShader from "./assets/webgl/planet/fragment.frag?raw";
import PlanetVertexShader from "./assets/webgl/planet/vertex.vert?raw";
import WaterFragmentShader from "./assets/webgl/water/fragment.frag?raw";
import WaterVertexShader from "./assets/webgl/water/vertex.vert?raw";
import GrassFragmentShader from "./assets/webgl/grass/fragment.frag?raw";
import GrassVertexShader from "./assets/webgl/grass/vertex.vert?raw";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
const grassModel =
  "//cdn.wtlstudio.com/sample.wtlstudio.com/a776537a-3038-4cd0-a90a-dab044a3f7ec.glb";

const initScene = async (canvasEl: HTMLCanvasElement) => {
  const gltf = await new GLTFLoader().loadAsync(grassModel);
  const raycaster = new THREE.Raycaster();
  const pane = new Pane();
  const PARAMS = {
    color: "#ff0000",
    radius: 1,
    sculpt: 1,
    threshold: 0.15,
    intensity: 0.01,
    wireframe: false,
    grassSize: 0.05,
    waterHeight: 1,
  };

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

  const planetGeometry = new THREE.SphereGeometry(1, 150, 150);
  const planetMesh = new THREE.Mesh(
    planetGeometry,
    new THREE.ShaderMaterial({
      fragmentShader: PlanetFragmentShader,
      vertexShader: PlanetVertexShader,
      wireframe: PARAMS.wireframe,
    })
  );

  const waterGeometry = new THREE.SphereGeometry(0.7, 150, 150);
  const waterSphereMesh = new THREE.Mesh(
    waterGeometry,
    new THREE.ShaderMaterial({
      fragmentShader: WaterFragmentShader,
      vertexShader: WaterVertexShader,
      wireframe: PARAMS.wireframe,
    })
  );

  pane.addBinding(PARAMS, "wireframe").on("change", (e) => {
    planetMesh.material.wireframe = e.value;
  });
  const sculptArray = new Float32Array(
    planetGeometry.attributes.position.count
  );
  sculptArray.fill(1);
  planetGeometry.setAttribute(
    "sculptAttribute",
    new THREE.BufferAttribute(sculptArray, 1)
  );

  planetMesh.name = "planet";
  scene.add(planetMesh);
  scene.add(waterSphereMesh);
  let lawnMowerMode = false;
  let orbitMode = false;
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
    mousedown = false;
  });
  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "t":
        lawnMowerMode = true;
        break;
      case "g":
        orbitMode = true;
        controls.enabled = true;
        break;
    }
  });
  document.addEventListener("keyup", (e) => {
    switch (e.key) {
      case "t":
        lawnMowerMode = false;
        break;
      case "g":
        orbitMode = false;
        controls.enabled = false;
        break;
    }
  });
  let decalText = new THREE.TextureLoader().load(cursorTexture);
  let decal = new THREE.Mesh();
  window.addEventListener("pointermove", onPointerMove);

  const dummy = new THREE.Object3D();

  const grassUniforms = {
    time: {
      value: 0,
    },
    grassScale: { value: PARAMS.grassSize },
  };

  const leavesMaterial = new THREE.ShaderMaterial({
    vertexShader: GrassVertexShader,
    fragmentShader: GrassFragmentShader,
    uniforms: grassUniforms,
    side: THREE.DoubleSide,
  });

  (gltf.scene.children[0] as THREE.Mesh).geometry.scale(
    PARAMS.grassSize,
    PARAMS.grassSize,
    PARAMS.grassSize
  );

  const originalGeometry = (gltf.scene.children[0] as THREE.Mesh).geometry;
  const instancedBufferGeometry = new THREE.InstancedBufferGeometry();
  instancedBufferGeometry.index = originalGeometry.index;
  instancedBufferGeometry.attributes.position =
    originalGeometry.attributes.position;
  instancedBufferGeometry.attributes.normal =
    originalGeometry.attributes.normal;
  instancedBufferGeometry.attributes.uv = originalGeometry.attributes.uv;
  const instanceNumber = 22000;

  const instancedMesh = new THREE.InstancedMesh(
    instancedBufferGeometry,
    leavesMaterial,
    instanceNumber
  );

  instancedBufferGeometry.setAttribute(
    "sculptAttribute",
    new THREE.InstancedBufferAttribute(sculptArray, 1)
  );

  controls.enabled = false;

  pane.addBinding(PARAMS, "sculpt", { step: 2, min: -1, max: 1 });
  pane.addBinding(PARAMS, "intensity", { step: 0.01, min: 0, max: 0.05 });
  pane
    .addBinding(PARAMS, "grassSize", { step: 0.001, min: 0, max: 0.08 })
    .on("change", () => {
      leavesMaterial.uniforms.grassScale.value = PARAMS.grassSize;
    });
  pane.addBinding(PARAMS, "threshold", { step: 0.01, min: 0.1, max: 0.3 });
  pane
    .addBinding(PARAMS, "waterHeight", { step: 0.01, min: 0.8, max: 1.5 })
    .on("change", () => {
      waterSphereMesh.scale.set(
        PARAMS.waterHeight,
        PARAMS.waterHeight,
        PARAMS.waterHeight
      );
    });

  scene.add(instancedMesh);

  for (let i = 0; i < instanceNumber; i += 100) {
    let index = Math.round(
      Math.random() * planetGeometry.attributes.position.array.length
    );
    index -= index % 3;
    dummy.position.set(
      planetGeometry.attributes.position.array[index],
      planetGeometry.attributes.position.array[index + 1],
      planetGeometry.attributes.position.array[index + 2]
    );

    const referenceAxis = new THREE.Vector3(
      Math.random(),
      Math.random(),
      Math.random()
    );

    const normalVector = new THREE.Vector3(
      planetGeometry.attributes.normal.array[index],
      planetGeometry.attributes.normal.array[index + 1],
      planetGeometry.attributes.normal.array[index + 2]
    );
    const rotationAxis = new THREE.Vector3()
      .crossVectors(referenceAxis, normalVector)
      .normalize();

    const angle = Math.acos(referenceAxis.dot(normalVector));

    const quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle(
      rotationAxis,
      angle + (Math.random() * Math.PI) / 2
    );
    dummy.updateMatrix();
    dummy.setRotationFromQuaternion(quaternion);
    instancedMesh.setMatrixAt(index / 3, dummy.matrix);
  }
  instancedMesh.instanceMatrix.needsUpdate = true;

  function animate(timespan: number) {
    leavesMaterial.uniforms.time.value = timespan / 1000;
    leavesMaterial.uniformsNeedUpdate = true;
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    requestAnimationFrame(animate);
    intersects.forEach((intersect, i) => {
      if (intersect.object.name !== "planet") return;
      if (decal) decal.geometry.dispose();
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

      const normalMatrix = new THREE.Matrix3().getNormalMatrix(
        intersects[i].object.matrixWorld
      );
      const worldNormal = intersects[i].face.normal
        .clone()
        .applyMatrix3(normalMatrix)
        .normalize();

      const positions = decalGeometry.attributes.position.array;
      const offset = 0.01;

      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += worldNormal.x * offset;
        positions[i + 1] += worldNormal.y * offset;
        positions[i + 2] += worldNormal.z * offset;
      }
      decalGeometry.attributes.position.needsUpdate = true;

      scene.add(decal);

      if (mousedown && !orbitMode) {
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
            const dist2Center = neighbourVertex.distanceTo(
              new THREE.Vector3(0, 0, 0)
            );
            let factor =
              (dist2Center + PARAMS.sculpt * PARAMS.intensity) / dist2Center;
            factor =
              1 +
              PARAMS.sculpt *
                Math.abs(1 - factor) *
                (1 - distance / PARAMS.threshold);
            if (lawnMowerMode) {
              instancedMesh.setMatrixAt(i / 3, new THREE.Matrix4());
              instancedMesh.instanceMatrix.needsUpdate = true;
            } else {
              sculptArray[i / 3] = sculptArray[i / 3] * factor;
            }
          }
          planetGeometry.attributes.sculptAttribute.array.set(sculptArray);
          instancedBufferGeometry.attributes.sculptAttribute.array.set(
            sculptArray
          );
          planetGeometry.attributes.sculptAttribute.needsUpdate = true;
          instancedBufferGeometry.attributes.sculptAttribute.needsUpdate = true;
        }
        position.needsUpdate = true;
      }
    });
    controls.update();
    // required if controls.enableDamping or controls.autoRotate are set to true
    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);
};

export { initScene };
