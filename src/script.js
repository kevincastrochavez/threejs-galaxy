import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'lil-gui';

/**
 * Base
 */
// Debug
const gui = new dat.GUI({ width: 360 });

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Galaxy
 */

const galaxyParameters = {};
galaxyParameters.count = 100000;
galaxyParameters.size = 0.01;
galaxyParameters.radius = 5;
galaxyParameters.branches = 3;
galaxyParameters.spin = 1;
galaxyParameters.randomness = 0.2;
galaxyParameters.randomnessPower = 3;
galaxyParameters.insideColor = '#ff6030';
galaxyParameters.outsideColor = '#1b3984';

let geometry = null;
let material = null;
let points = null;

const generateGalaxy = () => {
  // Clearing previous galaxy if there was one
  if (points !== null) {
    geometry.dispose();
    material.dispose();
    scene.remove(points);
  }

  geometry = new THREE.BufferGeometry();
  const positionsArray = new Float32Array(galaxyParameters.count * 3);
  const colorsArray = new Float32Array(galaxyParameters.count * 3);

  const colorInside = new THREE.Color(galaxyParameters.insideColor);
  const colorOutside = new THREE.Color(galaxyParameters.outsideColor);

  // Filling array
  for (let index = 0; index < galaxyParameters.count; index++) {
    const i3 = index * 3;

    // Position
    const radius = Math.random() * galaxyParameters.radius;
    const spinAngle = radius * galaxyParameters.spin;
    const branchAngle =
      ((index % galaxyParameters.branches) / galaxyParameters.branches) *
      Math.PI *
      2;

    const randomX =
      Math.pow(Math.random(), galaxyParameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);
    const randomY =
      Math.pow(Math.random(), galaxyParameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);
    const randomZ =
      Math.pow(Math.random(), galaxyParameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);

    positionsArray[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positionsArray[i3 + 1] = 0 + randomY;
    positionsArray[i3 + 2] =
      Math.sin(branchAngle + spinAngle) * radius + randomZ;

    // Colors
    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, radius / galaxyParameters.radius);

    colorsArray[i3] = mixedColor.r;
    colorsArray[i3 + 1] = mixedColor.g;
    colorsArray[i3 + 2] = mixedColor.b;
  }

  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positionsArray, 3)
  );

  geometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

  // Material
  material = new THREE.PointsMaterial({
    size: galaxyParameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  // Points
  points = new THREE.Points(geometry, material);
  scene.add(points);
};

generateGalaxy();

// Setting parameters for user to play with
gui
  .add(galaxyParameters, 'count')
  .min(100)
  .max(1000000)
  .step(100)
  .onFinishChange(generateGalaxy);
gui
  .add(galaxyParameters, 'size')
  .min(0.001)
  .max(0.1)
  .step(0.001)
  .onFinishChange(generateGalaxy);
gui
  .add(galaxyParameters, 'radius')
  .min(0.01)
  .max(20)
  .step(0.01)
  .onFinishChange(generateGalaxy);
gui
  .add(galaxyParameters, 'branches')
  .min(2)
  .max(20)
  .step(1)
  .onFinishChange(generateGalaxy);
gui
  .add(galaxyParameters, 'spin')
  .min(-5)
  .max(5)
  .step(0.001)
  .onFinishChange(generateGalaxy);
gui
  .add(galaxyParameters, 'randomness')
  .min(0)
  .max(2)
  .step(0.001)
  .onFinishChange(generateGalaxy);
gui
  .add(galaxyParameters, 'randomnessPower')
  .min(1)
  .max(10)
  .step(0.001)
  .onFinishChange(generateGalaxy);
gui.addColor(galaxyParameters, 'insideColor').onFinishChange(generateGalaxy);
gui.addColor(galaxyParameters, 'outsideColor').onFinishChange(generateGalaxy);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
