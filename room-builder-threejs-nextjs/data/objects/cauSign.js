import * as THREE from "three";

function makeDoorSignPanel() {
  const loader = new THREE.TextureLoader();
  const texture = loader.load("cau_logo.png");
  const materials = [
    new THREE.MeshLambertMaterial({ color: 0xcccccc }),
    new THREE.MeshLambertMaterial({ color: 0xcccccc }),
    new THREE.MeshLambertMaterial({ color: 0xcccccc }),
    new THREE.MeshLambertMaterial({ color: 0xcccccc }),
    new THREE.MeshLambertMaterial({ map: texture }),
    new THREE.MeshLambertMaterial({ color: 0xcccccc }),
  ];
  const geometry = new THREE.BoxGeometry(0.9, 0.3, 0.05);
  const sign = new THREE.Mesh(geometry, materials);
  sign.position.y = 0.5;
  return sign;
}

export default {
  name: "CAUSign",
  properties: {
    size: {
      label: "Size",
      type: "number",
      defaultValue: 1,
    },
  },
  render3D: function (element) {
    const newSize = element.properties?.size || 1;
    const signPanel = makeDoorSignPanel();
    const container = new THREE.Group();
    container.add(signPanel);
    const box = new THREE.Box3().setFromObject(signPanel);
    const center = new THREE.Vector3();
    box.getCenter(center);
    signPanel.position.sub(center);
    container.scale.set(newSize, newSize, newSize);
    return Promise.resolve(container);
  },
};
