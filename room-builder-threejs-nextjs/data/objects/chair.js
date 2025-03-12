import * as THREE from "three";

const objectMaxLOD = makeObjectMaxLOD();
const objectMinLOD = makeObjectMinLOD();

function makeObjectMaxLOD() {
  const chair = new THREE.Group();

  const seatGeometry = new THREE.BoxGeometry(0.5, 0.05, 0.5);
  const seatMaterial = new THREE.MeshLambertMaterial({ color: 0x9b8c75 });
  const seat = new THREE.Mesh(seatGeometry, seatMaterial);
  seat.position.y = 0.25;
  chair.add(seat);

  const backGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.05);
  const back = new THREE.Mesh(backGeometry, seatMaterial);
  back.position.set(0, 0.5, -0.225);
  chair.add(back);

  const legGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.25, 8);
  const legMaterial = new THREE.MeshLambertMaterial({ color: 0xd9d7d7 });
  const legPositions = [
    [-0.2, 0.125, 0.2],
    [0.2, 0.125, 0.2],
    [-0.2, 0.125, -0.2],
    [0.2, 0.125, -0.2],
  ];
  legPositions.forEach((pos) => {
    const leg = new THREE.Mesh(legGeometry, legMaterial);
    leg.position.set(pos[0], pos[1], pos[2]);
    chair.add(leg);
  });

  return chair;
}

function makeObjectMinLOD() {
  return objectMaxLOD.clone();
}

export default {
  name: "chair",
  properties: {
    size: {
      label: "Size",
      type: "number",
      defaultValue: 1,
    },
  },

  render3D: function (element) {
    const newSize = element.properties?.size || 1;

    const chairMax = new THREE.Group();
    chairMax.add(objectMaxLOD.clone());

    const chairMin = new THREE.Group();
    chairMin.add(objectMinLOD.clone());

    const lod = new THREE.LOD();
    lod.addLevel(chairMax, 200);
    lod.addLevel(chairMin, 900);

    lod.scale.set(newSize, newSize, newSize);

    const container = new THREE.Group();
    container.add(lod);

    const box = new THREE.Box3().setFromObject(lod);
    const center = new THREE.Vector3();
    box.getCenter(center);
    lod.position.sub(center);

    return Promise.resolve(container);
  },
};
