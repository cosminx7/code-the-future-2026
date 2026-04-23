import json
import threading

from flask import Flask
import paho.mqtt.client as mqtt


app = Flask(__name__)


# =========================
# SATELLITE STATE
# =========================

satellite_data = {
    "temperature": 0,
    "humidity": 0,
    "state": "STABLE",
    "risk": "LOW",
    "decision": "Systems nominal"
}


# =========================
# AI ANALYSIS
# =========================

def analyze_data(temp, humidity):

    if temp > 30:

        return {
            "state": "WARNING",
            "risk": "HIGH",
            "decision": "Cooling protocol activated"
        }

    return {
        "state": "STABLE",
        "risk": "LOW",
        "decision": "Systems nominal"
    }


# =========================
# MQTT CALLBACK
# =========================

def on_message(client, userdata, msg):

    global satellite_data

    data = json.loads(msg.payload.decode())

    temp = data["temperature"]
    hum = data["humidity"]

    result = analyze_data(temp, hum)

    satellite_data = {
        "temperature": temp,
        "humidity": hum,
        "state": result["state"],
        "risk": result["risk"],
        "decision": result["decision"]
    }

    print("\n========== TELEMETRY ==========")

    print(f"Temperature: {temp} C")
    print(f"Humidity: {hum} %")

    print("\n========== AI ANALYSIS ==========")

    print(f"Satellite State: {result['state']}")
    print(f"Risk Level: {result['risk']}")
    print(f"Decision: {result['decision']}")


# =========================
# MQTT THREAD
# =========================

def start_mqtt():

    client = mqtt.Client()

    client.on_message = on_message

    client.connect("localhost", 1883)

    client.subscribe("satellite/telemetry")

    client.loop_forever()


# =========================
# WEB UI
# =========================

@app.route("/")
def dashboard():

    color = "green"

    if satellite_data["state"] == "WARNING":
        color = "orange"

    return f"""
    <body style="background:black;color:white;font-family:Arial;padding:40px;">

        <h1 style="color:{color};">
            🛰️ SATELLITE MISSION CONTROL
        </h1>

        <h2>State: {satellite_data['state']}</h2>

        <h3>Temperature: {satellite_data['temperature']} C</h3>

        <h3>Humidity: {satellite_data['humidity']} %</h3>

        <h3>Risk Level: {satellite_data['risk']}</h3>

        <h3>AI Decision:</h3>

        <p>{satellite_data['decision']}</p>

    </body>
    """


# =========================
# START SYSTEM
# =========================

if __name__ == "__main__":

    mqtt_thread = threading.Thread(target=start_mqtt)

    mqtt_thread.start()

    app.run(host="0.0.0.0", port=5000)
