import * as THREE from "three";

function makeWhiteboardPanel() {
  const geometry = new THREE.BoxGeometry(5, 2, 0.1);
  const material = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const board = new THREE.Mesh(geometry, material);
  board.position.y = 2.5;
  return board;
}

export default {
  name: "whiteboard",
  properties: {
    size: {
      label: "Size",
      type: "number",
      defaultValue: 1,
    },
  },
  render3D: function (element) {
    const newSize = element.properties?.size || 1;
    const boardModel = makeWhiteboardPanel();
    const container = new THREE.Group();
    container.add(boardModel);
    const box = new THREE.Box3().setFromObject(boardModel);
    const center = new THREE.Vector3();
    box.getCenter(center);
    boardModel.position.sub(center);
    container.scale.set(newSize, newSize, newSize);
    return Promise.resolve(container);
  },
};
