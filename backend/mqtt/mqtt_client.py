import json

import paho.mqtt.client as mqtt

from data.satellite_state import satellite_data

from ai.decision_engine import analyze_satellite


def on_message(client, userdata, msg):

    global satellite_data


    data = json.loads(msg.payload.decode())


    temp = data["temperature"]

    hum = data["humidity"]

    distance = data["distance"]

    orientation = data["orientation"]


    result = analyze_satellite(

        temp,

        distance,

        orientation

    )


    satellite_data["temperature"] = temp

    satellite_data["humidity"] = hum

    satellite_data["distance"] = distance

    satellite_data["orientation"] = orientation

    satellite_data["state"] = result["state"]

    satellite_data["risk"] = result["risk"]

    satellite_data["decision"] = result["decision"]


    print("\n========== SATELLITE TELEMETRY ==========")

    print(satellite_data)



def start_mqtt():

    client = mqtt.Client()


    client.on_message = on_message


    client.connect("localhost", 1883)


    client.subscribe("satellite/telemetry")


    client.loop_forever()
