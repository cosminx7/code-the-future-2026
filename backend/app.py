from flask import Flask
from flask import jsonify
from flask import request
from flask_cors import CORS

from commands.command_manager import (
    set_command,
    get_command
)

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
        "pan": 0,
        "tilt": 0
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

    temp = data.get(
        "temperature",
        0
    )

    distance = data.get(
        "distance",
        100
    )

    gx = data.get(
        "gx",
        0
    )

    gy = data.get(
        "gy",
        0
    )

    gz = data.get(
        "gz",
        0
    )

    orientation = "STABLE"

    if (
        abs(gx) > 10000
        or abs(gy) > 10000
    ):
        orientation = "UNSTABLE"

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

        "distance": distance,

        "servo": {

            "pan": data.get(
                "servo_angle",
                0
            ),

            "tilt": 0
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


@app.route("/command", methods=["GET", "POST"])
def command():

    if request.method == "POST":

        data = request.json

        cmd = data.get(
            "command",
            "NONE"
        )

        set_command(cmd)

        print(
            "\n=== COMANDA PRIMITA ==="
        )

        print(cmd)

        return jsonify({

            "status": "ok"

        })

    return jsonify({

        "command": get_command()

    })


if __name__ == "__main__":

    app.run(

        host="0.0.0.0",

        port=5000

    )