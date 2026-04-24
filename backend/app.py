from flask import Flask
from flask import jsonify
from flask import request
from flask_cors import CORS

app = Flask(__name__)

CORS(app)

satellite_data = {

    "temperature": 0,

    "orientation": "STABLE",

    "gyro": {
        "x": 0,
        "y": 0,
        "z": 0
    },

    "state": "STABLE",

    "risk": "LOW",

    "decision": "Systems nominal",

    "humidity": 0,

    "distance": 100,

    "servo": {
        "pan": 90,
        "tilt": 45
    },

    "uptime": 0
}


def analyze_data(temp, orientation):

    if temp > 30 or orientation == "UNSTABLE":

        return {
            "state": "CRITIC",
            "risk": "HIGH",
            "decision": "Warning detected. Stabilization protocol activated."
        }

    return {
        "state": "STABLE",
        "risk": "LOW",
        "decision": "Toate sistemele functioneaza normal"
    }


@app.route("/")
def home():

    return jsonify({
        "message": "Satellite backend running"
    })


@app.route("/telemetry")
def telemetry():

    return jsonify(satellite_data)


@app.route("/update", methods=["POST"])
def update():

    global satellite_data

    data = request.json

    temp = data.get("temperature", 0)

    orientation = data.get(
        "orientation",
        "STABLE"
    )

    gx = data.get("gx", 0)
    gy = data.get("gy", 0)
    gz = data.get("gz", 0)

    result = analyze_data(
        temp,
        orientation
    )

    satellite_data = {

        "temperature": temp,

        "orientation": orientation,

        "gyro": {
            "x": gx,
            "y": gy,
            "z": gz
        },

        "state": result["state"],

        "risk": result["risk"],

        "decision": result["decision"],

        "humidity": data.get(
            "humidity",
            0
        ),

        "distance": data.get(
            "distance",
            100
        ),

        "servo": {
            "pan": data.get(
                "pan",
                90
            ),

            "tilt": data.get(
                "tilt",
                45
            )
        },

        "uptime": data.get(
            "uptime",
            0
        )
    }

    print("\n=== DATE PRIMITE ===")
    print(satellite_data)

    return jsonify({
        "status": "ok"
    })


@app.route("/command")
def command():

    return jsonify({
        "command": "NONE"
    })


if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000
    )