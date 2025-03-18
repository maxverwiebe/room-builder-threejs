"use client";

import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"; // camera movement etc.
import { DragControls } from "three/examples/jsm/controls/DragControls";
import * as customModels from "../data/objects";

const VERSION = "1.0.1";

// default export component
export default function Home() {
  const mountRef = useRef(null); // reference to the mount element
  const sceneRef = useRef(null); // reference to the scene
  const dragControlsRef = useRef(null); // reference to the drag controls
  const [mounted, setMounted] = useState(false); // when basic things are initialized
  const [editMode, setEditMode] = useState(false); // whether user can edit the scene / move objects
  const [showObjectBrowser, setShowObjectBrowser] = useState(false); // whether to show the object browser menu
  const [showSettings, setShowSettings] = useState(false); // whether to show the settings menu
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    object: null,
  }); // context menu for objects (deletion etc.)
  const [benchmarkMode, setBenchmarkMode] = useState(false);
  const [fps, setFps] = useState(0);
  const smoothedFpsRef = useRef(0); // because fps is raw and changes quickly between 59 and 60
  const lastFrameTimeRef = useRef(performance.now());

  // static objects, used for things like walls etc.
  const staticObjects = [
    {
      label: "Box",
      data: {
        type: "box",
        width: 1,
        height: 1,
        depth: 1,
        color: 16711680,
      },
    },
    {
      label: "Sphere",
      data: {
        type: "sphere",
        radius: 0.5,
        color: 65280,
      },
    },
  ];

  // dynamic objects, used for custom models like helloKitty etc.
  const dynamicObjects = Object.keys(customModels).map((key) => ({
    label: customModels[key].name || key,
    data: {
      type: key,
      rotation: 0,
      selected: false,
      properties: { size: 1 },
    },
  }));

  // merge static and dynamic objects for the object browser
  const availableObjects = [...dynamicObjects, ...staticObjects];

  // reference to the draggable objects
  const draggableObjectsRef = useRef([]);

  // clear all current objects in the scene
  const clearSceneObjects = () => {
    if (sceneRef.current) {
      draggableObjectsRef.current.forEach((obj) => {
        sceneRef.current.remove(obj);
      });
      draggableObjectsRef.current = [];
    }
  };

  // spawn an object in the scene & UPDATES the drag controls
  const spawnObject = (item) => {
    item.position = { x: 0, y: 0, z: 0 };
    importJSONroomData([item]); // creates the actual THREE.js object

    // refreshing the drag controls, so the new object can be dragged
    if (dragControlsRef.current) {
      // clear any existing drag controls
      dragControlsRef.current.dispose();
    }
    const dragControls = new DragControls( // create new one
      draggableObjectsRef.current,
      sceneRef.current.userData.camera,
      mountRef.current.children[0]
    );
    dragControls.transformGroup = true;
    dragControls.enabled = editMode;
    dragControls.addEventListener("dragstart", () => {
      sceneRef.current.userData.orbitControls.enabled = false;
    });
    dragControls.addEventListener("dragend", () => {
      sceneRef.current.userData.orbitControls.enabled = true;
    });
    dragControlsRef.current = dragControls;
  };

  // deletes the currently right clicked object
  const handleDelete = () => {
    if (contextMenu.object && sceneRef.current) {
      sceneRef.current.remove(contextMenu.object); // remove from scene
      draggableObjectsRef.current = draggableObjectsRef.current.filter(
        (obj) => obj !== contextMenu.object
      ); // remove from draggable objects
      setContextMenu({ visible: false, x: 0, y: 0, object: null });
    }
  };

  // creates a duplicate of the currently right clicked object
  const handleDuplicate = () => {
    if (contextMenu.object && sceneRef.current) {
      const clone = contextMenu.object.clone();
      clone.position.x += 0.5;
      clone.position.z += 0.5;
      sceneRef.current.add(clone);
      draggableObjectsRef.current.push(clone);

      // workaround to make the cloned object draggable
      // TODO: Find a better way to do this? maybe by using the spawn function idk
      if (dragControlsRef.current) {
        dragControlsRef.current.transformGroup = true;
        dragControlsRef.current.enabled = editMode;
        dragControlsRef.current.addEventListener("dragstart", () => {
          sceneRef.current.userData.orbitControls.enabled = false;
        });
        dragControlsRef.current.addEventListener("dragend", () => {
          sceneRef.current.userData.orbitControls.enabled = true;
        });
        dragControlsRef.current.objects.push(clone);
      }

      setContextMenu({ visible: false, x: 0, y: 0, object: null });
    }
  };

  // rotates the currently right clicked object around the y-axis
  const handleRotationYAxis = () => {
    if (contextMenu.object) {
      contextMenu.object.rotation.y += Math.PI / 2;
      setContextMenu({ visible: false, x: 0, y: 0, object: null });
    }
  };

  // rotates the currently right clicked object around the z-axis
  const handleRotationZAxis = () => {
    if (contextMenu.object) {
      contextMenu.object.rotation.z += Math.PI / 2;
      setContextMenu({ visible: false, x: 0, y: 0, object: null });
    }
  };

  // rotates the currently right clicked object around the x-axis
  const handleRotationXAxis = () => {
    if (contextMenu.object) {
      contextMenu.object.rotation.x += Math.PI / 2;
      setContextMenu({ visible: false, x: 0, y: 0, object: null });
    }
  };

  // resets the rotation of the currently right clicked object
  const handleResetRotation = () => {
    if (contextMenu.object) {
      contextMenu.object.rotation.set(0, 0, 0);
      setContextMenu({ visible: false, x: 0, y: 0, object: null });
    }
  };

  // imports the JSON room data into the scene
  // example in dpublic/data/room.json:
  const importJSONroomData = (data) => {
    if (!sceneRef.current) return;
    data.forEach((item) => {
      let object;
      if (item.type === "box") {
        const geometry = new THREE.BoxGeometry(
          item.width,
          item.height,
          item.depth
        );

        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(item.color).getHex() || 0x00ff00,
        });
        object = new THREE.Mesh(geometry, material);
        if (item.position) {
          object.position.set(
            item.position.x,
            item.position.y,
            item.position.z
          );
        }
        sceneRef.current.add(object);
        draggableObjectsRef.current.push(object);
        object.userData.originalData = { ...item };
      } else if (item.type === "sphere") {
        const geometry = new THREE.SphereGeometry(item.radius, 32, 32);
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(item.color).getHex() || 0x00ff00,
        });
        object = new THREE.Mesh(geometry, material);
        if (item.position) {
          object.position.set(
            item.position.x,
            item.position.y,
            item.position.z
          );
        }
        sceneRef.current.add(object);
        draggableObjectsRef.current.push(object);
        object.userData.originalData = { ...item };
      } else if (customModels[item.type]) {
        customModels[item.type]
          .render3D(item)
          .then((object3D) => {
            if (item.position) {
              object3D.position.set(
                item.position.x,
                item.position.y,
                item.position.z
              );
            }
            if (
              item.rotation !== undefined &&
              item.rotation.y !== undefined &&
              item.rotation.x !== undefined &&
              item.rotation.z !== undefined
            ) {
              object3D.rotation.y = item.rotation.y * (Math.PI / 180);
              object3D.rotation.x = item.rotation.x * (Math.PI / 180);
              object3D.rotation.z = item.rotation.z * (Math.PI / 180);
            }
            sceneRef.current.add(object3D);
            draggableObjectsRef.current.push(object3D);
            object3D.userData.originalData = { ...item };
          })
          .catch((error) =>
            console.error("Error while rendering the customModel:", error)
          );
      } else {
        console.warn("Unknown object type ", item.type);
      }
    });
  };

  // handles the file change event for the JSON import (when clicking the import button)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        clearSceneObjects();
        importJSONroomData(jsonData);
        // reinitialize drag controls
        if (dragControlsRef.current) {
          dragControlsRef.current.dispose();
        }
        const dragControls = new DragControls(
          draggableObjectsRef.current,
          sceneRef.current.userData.camera,
          mountRef.current.children[0]
        );
        dragControls.transformGroup = true;
        dragControls.enabled = editMode;
        dragControls.addEventListener("dragstart", () => {
          sceneRef.current.userData.orbitControls.enabled = false;
        });
        dragControls.addEventListener("dragend", () => {
          sceneRef.current.userData.orbitControls.enabled = true;
        });
        dragControlsRef.current = dragControls;
      } catch (err) {
        console.error("Fehler beim Parsen der JSON-Datei:", err);
      }
    };
    reader.readAsText(file);
  };

  // exports the current scene as JSON
  const exportAsJSON = () => {
    const exportedData = draggableObjectsRef.current.map((obj) => {
      const original = obj.userData.originalData || {}; // restore original data
      return {
        ...original,
        position: {
          x: obj.position.x,
          y: obj.position.y,
          z: obj.position.z,
        },
        rotation: {
          x: obj.rotation.x * (180 / Math.PI),
          y: obj.rotation.y * (180 / Math.PI),
          z: obj.rotation.z * (180 / Math.PI),
        },
      };
    });

    const jsonString = JSON.stringify(exportedData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "scene_export.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // initializes the actual render scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xaaaaaa);
    sceneRef.current = scene;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 2, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    // movement
    const orbitControls = new OrbitControls(camera, renderer.domElement);
    scene.userData.orbitControls = orbitControls;
    scene.userData.camera = camera;

    // basic minimum lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    fetch("/data/room.json")
      .then((response) => response.json())
      .then((data) => {
        importJSONroomData(data);
        const dragControls = new DragControls(
          draggableObjectsRef.current,
          camera,
          renderer.domElement
        );
        dragControls.transformGroup = true;
        dragControls.enabled = editMode;
        dragControls.addEventListener("dragstart", () => {
          orbitControls.enabled = false;
        });
        dragControls.addEventListener("dragend", () => {
          orbitControls.enabled = true;
        });
        dragControlsRef.current = dragControls;
      })
      .catch((error) =>
        console.error("Error while loading JSON room data:", error)
      );

    // updates the frames
    const animate = () => {
      requestAnimationFrame(animate);

      if (benchmarkMode) {
        const smoothingFactor = 0.1;
        const now = performance.now();
        const delta = now - lastFrameTimeRef.current;
        const currentFps = 1000 / delta;

        // new smoothed FPS = old value + (new measure value - old value) * smoothingFactor
        smoothedFpsRef.current =
          smoothedFpsRef.current * (1 - smoothingFactor) +
          currentFps * smoothingFactor;
        setFps(Math.round(smoothedFpsRef.current));
        lastFrameTimeRef.current = now;
      }

      orbitControls.update();
      renderer.render(scene, camera);
    };
    animate();

    // when resizing window
    const handleResize = () => {
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // when rightclicking a 3D object
    const handleContextMenu = (e) => {
      e.preventDefault();
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      ); // mouse coords
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(
        draggableObjectsRef.current,
        true
      );
      if (intersects.length > 0) {
        let selectedObj = intersects[0].object;
        while (selectedObj.parent && selectedObj.parent.type !== "Scene") {
          selectedObj = selectedObj.parent;
        }
        setContextMenu({
          visible: true,
          x: e.clientX,
          y: e.clientY,
          object: selectedObj,
        });
      } else {
        setContextMenu({ visible: false, x: 0, y: 0, object: null });
      }
    };
    renderer.domElement.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("contextmenu", handleContextMenu);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [mounted, benchmarkMode]);

  useEffect(() => {
    if (dragControlsRef.current) {
      dragControlsRef.current.enabled = editMode;
    }
  }, [editMode]);

  if (!mounted) return <div style={{ width: "100vw", height: "100vh" }} />;

  return (
    <>
      <div ref={mountRef} className="w-screen h-screen" />

      {benchmarkMode && (
        <div className="fixed top-0 right-0 m-4 p-2 bg-black text-white rounded">
          <div>FPS: {fps}</div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 w-full bg-black/70 text-white p-3 flex justify-between items-center z-50">
        <span>Bachelor Project @ CAU Kiel </span>
        <span>{editMode ? "Edit Mode: ON" : "Edit Mode: OFF"}</span>
        {editMode && (
          <button
            onClick={() => setShowObjectBrowser(true)}
            className="bg-transparent border-0 text-white cursor-pointer mr-3"
          >
            ➕ Spawn object
          </button>
        )}
        <div>
          <button
            onClick={() => setShowSettings(true)}
            className="bg-transparent border-0 text-white cursor-pointer mr-3"
          >
            ⚙️ Settings
          </button>
        </div>
      </div>
      <input
        id="jsonFileInput"
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />
      {showSettings && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black/50 flex items-center justify-center z-[2000]">
          <div className="bg-black p-5 rounded-lg min-w-[300px] relative  max-w-md">
            <h3 className="text-white text-xl font-bold mb-4">Settings</h3>
            <div className="mb-2.5">
              <label className="flex items-center">
                Edit Mode:
                <input
                  type="checkbox"
                  checked={editMode}
                  onChange={() => {
                    setEditMode(!editMode);
                    localStorage.setItem(
                      "3droombuilder.editModeEnabled",
                      !editMode
                    );
                  }}
                  className="ml-2.5"
                />
              </label>
              <label className="flex items-center">
                Benchmark (Show FPS):
                <input
                  type="checkbox"
                  checked={benchmarkMode}
                  onChange={() => {
                    setBenchmarkMode(!benchmarkMode);
                  }}
                  className="ml-2.5"
                />
              </label>
              <p className="text-xs">Warning: This reloads the scene!</p>
            </div>
            <div className="flex-col mt-6">
              <button
                onClick={() => document.getElementById("jsonFileInput").click()}
                className="w-full px-3 py-2 bg-neutral-600 rounded hover:bg-neutral-500 transition-colors cursor-pointer mb-4"
              >
                Import scene as JSON
              </button>
              <button
                onClick={exportAsJSON}
                className="w-full px-3 py-2 bg-neutral-600 rounded hover:bg-neutral-500 transition-colors cursor-pointer mb-4"
              >
                Export scene as JSON
              </button>
            </div>
            <button
              onClick={() => setShowSettings(false)}
              className="absolute top-2.5 right-2.5 bg-transparent border-0 text-xl cursor-pointer"
            >
              ✕
            </button>
            <div className="flex-col">
              <p>Created by Maximilian Verwiebe</p>
              <p className="text-xs">
                For the Bachelor Project "Wirtschaftsinformatik" at CAU (Kiel
                University)
              </p>
              <p>{VERSION}</p>
            </div>
          </div>
        </div>
      )}
      {showObjectBrowser && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black/50 flex items-center justify-center z-[2000]">
          <div className="bg-black p-5 rounded-lg min-w-[500px] relative">
            <h3 className="text-white text-xl font-bold mb-4">
              Object Browser
            </h3>
            <ul className="list-none p-0">
              {availableObjects.map((obj) => (
                <li key={obj.label} className="mb-2">
                  <button
                    onClick={() => {
                      spawnObject(obj.data);
                      setShowObjectBrowser(false);
                    }}
                    className="w-full px-3 py-2 bg-neutral-600 rounded hover:bg-neutral-500 transition-colors cursor-pointer"
                  >
                    {obj.label}
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowObjectBrowser(false)}
              className="absolute top-2.5 right-2.5 bg-transparent border-0 text-xl cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      {contextMenu.visible && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed bg-neutral-800 p-2 rounded shadow-lg z-50 flex flex-col space-y-2 max-w-[208px]"
        >
          <span className="text-white">
            {contextMenu.object.userData.originalData.type}
          </span>
          <button
            onClick={() =>
              setContextMenu({ ...contextMenu, submenu: "rotate" })
            }
            className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
          >
            Rotate
          </button>
          {contextMenu.submenu === "rotate" && (
            <div className="flex flex-col space-y-2">
              <button
                onClick={handleRotationYAxis}
                className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
              >
                Rotate 90° <span className="text-[10px]">y-Axis</span>
              </button>
              <button
                onClick={handleRotationZAxis}
                className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
              >
                Rotate 90° <span className="text-[10px]">z-Axis</span>
              </button>
              <button
                onClick={handleRotationXAxis}
                className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
              >
                Rotate 90° <span className="text-[10px]">x-Axis</span>
              </button>
              <button
                onClick={handleResetRotation}
                className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
              >
                Reset Rotation
              </button>
            </div>
          )}
          <button
            onClick={handleDuplicate}
            className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
          >
            Duplicate
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
          <button
            onClick={() =>
              setContextMenu({ visible: false, x: 0, y: 0, object: null })
            }
            className="bg-gray-500 text-white px-3 py-1 mt-2 rounded hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </>
  );
}
