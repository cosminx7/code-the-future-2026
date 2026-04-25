from flask import Flask, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

BACKEND_URL = "http://172.20.10.13:5000/telemetry"

@app.route("/api/simulation")
def simulation():

    try:
        res = requests.get(BACKEND_URL)
        data = res.json()

        temperature = data.get("temperature", 0)
        distance = data.get("distance", 100)

        return jsonify({

            "temperature": temperature,
            "humidity": 0,

            "distance_cm": distance,

            "servo_angle":
                data.get("servo_angle", 0),

            "gyro_x":
                data.get("gx", 0) / 1000,

            "gyro_y":
                data.get("gy", 0) / 1000,

            "gyro_z":
                data.get("gz", 0) / 1000,

            "overheat":
                temperature > 30,

            "meteor_incoming":
                distance < 15,

            "temp_limit": 30,

            "proximity_limit": 15,

            "timestamp": 1

        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        })


if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5001
    )