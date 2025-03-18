import * as THREE from "three";

const RADIUS = 20;
const HEIGHT = 20;

const BASE_HEIGHT = 0.1;
const WALL_HEIGHT = 0.5;
const OUTER_RADIUS = 0.3;
const INNER_RADIUS = 0.25;

const objectMaxLOD = makeObjectMaxLOD();
const objectMinLOD = makeObjectMinLOD();

function makeObjectMaxLOD() {
  const trash = new THREE.Group();
  const material = new THREE.MeshLambertMaterial({ color: 0xdddddd });
  material.side = THREE.DoubleSide;

  const baseGeometry = new THREE.CylinderGeometry(
    INNER_RADIUS,
    INNER_RADIUS,
    BASE_HEIGHT,
    80
  );
  const base = new THREE.Mesh(baseGeometry, material);
  trash.add(base);

  const wallGeometry = new THREE.CylinderGeometry(
    OUTER_RADIUS,
    INNER_RADIUS,
    WALL_HEIGHT,
    80,
    1,
    true
  );
  const wall = new THREE.Mesh(wallGeometry, material);
  wall.position.y = (BASE_HEIGHT + WALL_HEIGHT) / 2;
  base.add(wall);

  return trash;
}

function makeObjectMinLOD() {
  return objectMaxLOD.clone();
}

export default {
  name: "trash bin",

  render3D: function (element) {
    const newSize = element.properties?.size || 1;

    const newAltitude =
      element.properties?.altitude?.length !== undefined
        ? element.properties.altitude.length
        : 0;

    const trashMax = new THREE.Group();
    trashMax.add(objectMaxLOD.clone());

    const trashMin = new THREE.Group();
    trashMin.add(objectMinLOD.clone());

    const lod = new THREE.LOD();
    lod.addLevel(trashMax, 200);
    lod.addLevel(trashMin, 900);
    lod.scale.set(newSize, newSize, newSize);

    const container = new THREE.Group();
    container.add(lod);

    const box = new THREE.Box3().setFromObject(lod);
    const center = new THREE.Vector3();
    box.getCenter(center);
    lod.position.sub(center);

    container.position.y += HEIGHT / 16 + newAltitude;

    return Promise.resolve(container);
  },
};
