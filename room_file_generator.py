"""
Generates a JSON file with a large number of objects in a room.
"""

import json
import random
import copy

num_additional_objects = 1000

# always in the scene
base_objects = [
    {
        "type": "box",
        "width": 30,
        "height": 0.2,
        "depth": 20,
        "color": 13421772,
        "position": {"x": 0, "y": 0, "z": 0},
        "rotation": 0
    },
    {
        "type": "box",
        "width": 30,
        "height": 3,
        "depth": 0.2,
        "color": 4473924,
        "position": {"x": 0, "y": 1.5, "z": -10},
        "rotation": 0
    },
    {
        "type": "box",
        "width": 30,
        "height": 3,
        "depth": 0.2,
        "color": 4473924,
        "position": {"x": 0, "y": 1.5, "z": 10},
        "rotation": 0
    },
    {
        "type": "box",
        "width": 0.2,
        "height": 3,
        "depth": 20,
        "color": 4473924,
        "position": {"x": -15, "y": 1.5, "z": 0},
        "rotation": 0
    },
    {
        "type": "box",
        "width": 0.2,
        "height": 3,
        "depth": 20,
        "color": 4473924,
        "position": {"x": 15, "y": 1.5, "z": 0},
        "rotation": 0
    },
    {
        "type": "whiteboard",
        "rotation": 0,
        "selected": False,
        "properties": {"size": 1},
        "position": {
            "x": -0.06710898809089949,
            "y": 1.6846811489857818,
            "z": 9.86241474523793
        }
    }
]

# templates
furniture_samples = [
    {
        "type": "table",
        "rotation": 0,
        "selected": False,
        "properties": {"size": 1},
        "position": {"x": -5, "y": 0.5, "z": -3}
    },
    {
        "type": "chair",
        "rotation": 0,
        "selected": False,
        "properties": {"size": 1},
        "position": {"x": -5, "y": 0.5, "z": -3.8}
    },
    {
        "type": "table",
        "rotation": 0,
        "selected": False,
        "properties": {"size": 1},
        "position": {"x": -2.5, "y": 0.5, "z": -3}
    },
    {
        "type": "chair",
        "rotation": 0,
        "selected": False,
        "properties": {"size": 1},
        "position": {"x": -2.5, "y": 0.5, "z": -3.8}
    },
    {
        "type": "table",
        "rotation": 0,
        "selected": False,
        "properties": {"size": 1},
        "position": {"x": 0, "y": 0.5, "z": -3}
    },
    {
        "type": "chair",
        "rotation": 0,
        "selected": False,
        "properties": {"size": 1},
        "position": {"x": 0, "y": 0.5, "z": -3.8}
    },
    {
        "type": "table",
        "rotation": 0,
        "selected": False,
        "properties": {"size": 1},
        "position": {"x": 2.5, "y": 0.5, "z": -3}
    },
    {
        "type": "chair",
        "rotation": 0,
        "selected": False,
        "properties": {"size": 1},
        "position": {"x": 2.5, "y": 0.5, "z": -3.8}
    },
    {
        "type": "table",
        "rotation": 0,
        "selected": False,
        "properties": {"size": 1},
        "position": {"x": 5, "y": 0.5, "z": -3}
    },
    {
        "type": "chair",
        "rotation": 0,
        "selected": False,
        "properties": {"size": 1},
        "position": {"x": 5, "y": 0.5, "z": -3.8}
    }
]

room_objects = []
room_objects.extend(base_objects)

for i in range(num_additional_objects):
    sample = random.choice(furniture_samples)
    obj = copy.deepcopy(sample)
    obj["position"]["x"] += random.uniform(-10, 10)
    obj["position"]["z"] += random.uniform(-10, 10)
    room_objects.append(obj)

with open("huge_room_data.json", "w") as f:
    json.dump(room_objects, f, indent=2)

print(f"Generated huge_room_data.json with {len(room_objects)} objects :)")
