"use client";

import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import * as customModels from "../data/objects";

export default function Home() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const dragControlsRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showObjectBrowser, setShowObjectBrowser] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    object: null,
  });

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

  const dynamicObjects = Object.keys(customModels).map((key) => ({
    label: customModels[key].name || key,
    data: {
      type: key,
      rotation: 0,
      selected: false,
      properties: { size: 1 },
    },
  }));

  const availableObjects = [...dynamicObjects, ...staticObjects];

  const draggableObjectsRef = useRef([]);

  const clearSceneObjects = () => {
    if (sceneRef.current) {
      draggableObjectsRef.current.forEach((obj) => {
        sceneRef.current.remove(obj);
      });
      draggableObjectsRef.current = [];
    }
  };

  const spawnObject = (item) => {
    item.position = { x: 0, y: 0, z: 0 };
    addObjectsFromData([item]);
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
  };

  const handleDelete = () => {
    if (contextMenu.object && sceneRef.current) {
      sceneRef.current.remove(contextMenu.object);
      draggableObjectsRef.current = draggableObjectsRef.current.filter(
        (obj) => obj !== contextMenu.object
      );
      setContextMenu({ visible: false, x: 0, y: 0, object: null });
    }
  };

  const handleDuplicate = () => {
    if (contextMenu.object && sceneRef.current) {
      const clone = contextMenu.object.clone();
      clone.position.x += 0.5;
      clone.position.z += 0.5;
      sceneRef.current.add(clone);
      draggableObjectsRef.current.push(clone);

      // INFO: Workaround to make the cloned object draggable
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

  const addObjectsFromData = (data) => {
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
            if (item.rotation !== undefined) {
              object3D.rotation.y = item.rotation * (Math.PI / 180);
            }
            sceneRef.current.add(object3D);
            draggableObjectsRef.current.push(object3D);
            object3D.userData.originalData = { ...item };
          })
          .catch((error) =>
            console.error("Fehler beim Rendern des Custom-Objekts:", error)
          );
      } else {
        console.warn("Unbekannter Objekttyp:", item.type);
      }
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        clearSceneObjects();
        addObjectsFromData(jsonData);
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

  const exportAsJSON = () => {
    const exportedData = draggableObjectsRef.current.map((obj) => {
      const original = obj.userData.originalData || {};
      return {
        ...original,
        position: {
          x: obj.position.x,
          y: obj.position.y,
          z: obj.position.z,
        },
        rotation: obj.rotation ? obj.rotation.y * (180 / Math.PI) : 0,
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

    setEditMode(
      localStorage.getItem("3droombuilder.editModeEnabled") === "true"
    );

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

    const orbitControls = new OrbitControls(camera, renderer.domElement);
    scene.userData.orbitControls = orbitControls;
    scene.userData.camera = camera;

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    fetch("/data/room.json")
      .then((response) => response.json())
      .then((data) => {
        addObjectsFromData(data);
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
        console.error("Fehler beim Laden der JSON-Daten:", error)
      );

    const animate = () => {
      requestAnimationFrame(animate);
      orbitControls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    const handleContextMenu = (e) => {
      e.preventDefault();
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
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
  }, [mounted]);

  useEffect(() => {
    if (dragControlsRef.current) {
      dragControlsRef.current.enabled = editMode;
    }
  }, [editMode]);

  if (!mounted) return <div style={{ width: "100vw", height: "100vh" }} />;

  return (
    <>
      <div ref={mountRef} className="w-screen h-screen" />
      <div className="fixed bottom-0 left-0 w-full bg-black/70 text-white p-3 flex justify-between items-center z-50">
        <span>Bachelorproject @ CAU</span>
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
            </div>
            <div className="flex-col">
              <button
                onClick={() => document.getElementById("jsonFileInput").click()}
                className="w-full px-3 py-2 bg-neutral-600 rounded hover:bg-neutral-500 transition-colors cursor-pointer mb-4"
              >
                Import JSON
              </button>
              <button
                onClick={exportAsJSON}
                className="w-full px-3 py-2 bg-neutral-600 rounded hover:bg-neutral-500 transition-colors cursor-pointer mb-4"
              >
                Export JSON
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
            onClick={handleDelete}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
          <button
            onClick={() => handleDuplicate()}
            className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
          >
            Duplicate
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
