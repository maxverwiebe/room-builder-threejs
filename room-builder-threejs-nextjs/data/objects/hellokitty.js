import * as THREE from "three";

const headMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
const earMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
const noseMaterial = new THREE.MeshLambertMaterial({ color: 0xffb6c1 });
const bowMaterial = new THREE.MeshLambertMaterial({ color: 0xff69b4 });
const whiskerMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });

function makeHelloKittyModel() {
  const kitty = new THREE.Group();

  const headGeom = new THREE.SphereGeometry(0.5, 32, 32);
  const head = new THREE.Mesh(headGeom, headMaterial);
  head.position.set(0, 0.5, 0);
  kitty.add(head);

  const eyeGeom = new THREE.SphereGeometry(0.05, 16);
  const leftEye = new THREE.Mesh(eyeGeom, eyeMaterial);
  const rightEye = leftEye.clone();
  leftEye.position.set(-0.15, 0.6, 0.46);
  rightEye.position.set(0.15, 0.6, 0.46);
  leftEye.rotation.x = -Math.PI / 2;
  rightEye.rotation.x = -Math.PI / 2;
  kitty.add(leftEye);
  kitty.add(rightEye);

  const noseGeom = new THREE.CircleGeometry(0.03, 16);
  const nose = new THREE.Mesh(noseGeom, noseMaterial);
  nose.position.set(0, 0.55, 0.45);
  nose.rotation.x = -Math.PI / 2;
  kitty.add(nose);

  const whiskerLeftGeom = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-0.1, 0.55, 0.44),
    new THREE.Vector3(-0.3, 0.55, 0.44),
  ]);
  const whiskerRightGeom = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0.1, 0.55, 0.44),
    new THREE.Vector3(0.3, 0.55, 0.44),
  ]);
  const whiskerLeft = new THREE.Line(whiskerLeftGeom, whiskerMaterial);
  const whiskerRight = new THREE.Line(whiskerRightGeom, whiskerMaterial);
  kitty.add(whiskerLeft);
  kitty.add(whiskerRight);

  const earGeom = new THREE.ConeGeometry(0.1, 0.2, 32);
  const leftEar = new THREE.Mesh(earGeom, earMaterial);
  leftEar.position.set(-0.35, 1.0, 0);
  leftEar.rotation.z = Math.PI / 10;
  kitty.add(leftEar);

  const rightEar = new THREE.Mesh(earGeom, earMaterial);
  rightEar.position.set(0.35, 1.0, 0);
  rightEar.rotation.z = -Math.PI / 10;
  kitty.add(rightEar);

  const bowGroup = new THREE.Group();
  const bowLeftGeom = new THREE.BoxGeometry(0.12, 0.06, 0.02);
  const bowLeft = new THREE.Mesh(bowLeftGeom, bowMaterial);
  const bowRight = bowLeft.clone();
  const bowCenterGeom = new THREE.SphereGeometry(0.04, 16, 16);
  const bowCenter = new THREE.Mesh(bowCenterGeom, bowMaterial);

  bowLeft.position.set(-0.55, 0.65, 0.2);
  bowRight.position.set(-0.35, 0.65, 0.2);
  bowCenter.position.set(-0.45, 0.65, 0.22);
  bowGroup.add(bowLeft);
  bowGroup.add(bowRight);
  bowGroup.add(bowCenter);
  kitty.add(bowGroup);

  return kitty;
}

export default {
  name: "helloKitty",
  properties: {
    size: {
      label: "Size",
      type: "number",
      defaultValue: 1,
    },
  },
  render3D: function (element) {
    const newSize = element.properties?.size || 1;
    const kittyModel = makeHelloKittyModel();

    const container = new THREE.Group();
    container.add(kittyModel);

    const box = new THREE.Box3().setFromObject(kittyModel);
    const center = new THREE.Vector3();
    box.getCenter(center);
    kittyModel.position.sub(center);

    container.scale.set(newSize, newSize, newSize);

    return Promise.resolve(container);
  },
};
