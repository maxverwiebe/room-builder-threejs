import * as THREE from "three";

function makeTableTop() {
  const geometry = new THREE.BoxGeometry(2, 0.05, 0.8);
  const material = new THREE.MeshLambertMaterial({ color: 0x9b8c75 });
  const top = new THREE.Mesh(geometry, material);
  top.position.y = 1.0;
  return top;
}

function makeTableLeg() {
  const geometry = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 16);
  const material = new THREE.MeshLambertMaterial({ color: 0xd9d7d7 });
  const leg = new THREE.Mesh(geometry, material);
  leg.position.y = 1.0 - 0.4;
  return leg;
}

function makeTableModel() {
  const table = new THREE.Group();
  const top = makeTableTop();
  table.add(top);

  const leg1 = makeTableLeg();
  const leg2 = makeTableLeg();
  const leg3 = makeTableLeg();
  const leg4 = makeTableLeg();

  leg1.position.set(-0.9, leg1.position.y, -0.35);
  leg2.position.set(0.9, leg2.position.y, -0.35);
  leg3.position.set(-0.9, leg3.position.y, 0.35);
  leg4.position.set(0.9, leg4.position.y, 0.35);

  table.add(leg1, leg2, leg3, leg4);
  return table;
}

export default {
  name: "table2",
  properties: {
    size: {
      label: "Size",
      type: "number",
      defaultValue: 1,
    },
  },
  render3D: function (element) {
    const newSize = element.properties?.size || 1;
    const tableModel = makeTableModel();
    const container = new THREE.Group();
    container.add(tableModel);

    const box = new THREE.Box3().setFromObject(tableModel);
    const center = new THREE.Vector3();
    box.getCenter(center);
    tableModel.position.sub(center);

    container.scale.set(newSize, newSize, newSize);
    return Promise.resolve(container);
  },
};
