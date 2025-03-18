import * as THREE from "three";

function makeTableTop() {
  const geometry = new THREE.BoxGeometry(3, 0.05, 1.2);
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

  leg1.position.set(-1.45, leg1.position.y, -0.55);
  leg2.position.set(1.45, leg2.position.y, -0.55);
  leg3.position.set(-1.45, leg3.position.y, 0.55);
  leg4.position.set(1.45, leg4.position.y, 0.55);

  table.add(leg1, leg2, leg3, leg4);
  return table;
}

function makeBenchSeat() {
  const geometry = new THREE.BoxGeometry(3, 0.15, 0.4);
  const material = new THREE.MeshLambertMaterial({ color: 4209467 });
  const seat = new THREE.Mesh(geometry, material);
  seat.position.y = 0.5;
  return seat;
}

function makeBenchBackrest() {
  const geometry = new THREE.BoxGeometry(3, 0.3, 0.1);
  const material = new THREE.MeshLambertMaterial({ color: 4209467 });
  const backrest = new THREE.Mesh(geometry, material);

  backrest.position.y = 0.65;
  backrest.position.z = -0.15;
  return backrest;
}

function makeBenchLeg() {
  const geometry = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 16);
  const material = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });
  const leg = new THREE.Mesh(geometry, material);
  leg.position.y = 0.25;
  return leg;
}

function makeBenchModel() {
  const bench = new THREE.Group();
  const seat = makeBenchSeat();
  bench.add(seat);
  const backrest = makeBenchBackrest();
  bench.add(backrest);
  const leg1 = makeBenchLeg();
  const leg2 = makeBenchLeg();

  leg1.position.set(-1.45, leg1.position.y, 0.15);
  leg2.position.set(1.45, leg2.position.y, 0.15);
  bench.add(leg1, leg2);
  return bench;
}

function makeSeatbankModel() {
  const seatbank = new THREE.Group();

  const table = makeTableModel();
  seatbank.add(table);

  const benchLeft = makeBenchModel();
  benchLeft.position.z = -0.8;
  benchLeft.position.y = 0;
  seatbank.add(benchLeft);

  return seatbank;
}

export default {
  name: "seatbank",
  properties: {
    size: {
      label: "Size",
      type: "number",
      defaultValue: 1,
    },
  },
  render3D: function (element) {
    const newSize = element.properties?.size || 1;
    const seatbankModel = makeSeatbankModel();
    const container = new THREE.Group();
    container.add(seatbankModel);

    const box = new THREE.Box3().setFromObject(seatbankModel);
    const center = new THREE.Vector3();
    box.getCenter(center);
    seatbankModel.position.sub(center);

    container.scale.set(newSize, newSize, newSize);
    return Promise.resolve(container);
  },
};
