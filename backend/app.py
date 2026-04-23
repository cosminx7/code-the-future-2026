from flask import Flask

from flask import jsonify

from flask import send_from_directory


app = Flask(

    __name__,

    static_folder="../frontend"

)


satellite_data = {

    "temperature": 27,

    "humidity": 40,

    "distance": 100,

    "orientation": "STABLE",

    "state": "STABLE",

    "risk": "LOW",

    "decision": "Toate sistemele funcționează normal"

}


@app.route("/")

def home():

    return send_from_directory(

        app.static_folder,

        "index.html"

    )


@app.route("/telemetry")

def telemetry():

    return jsonify(satellite_data)


if __name__ == "__main__":

    app.run(

        host="0.0.0.0",

        port=5000

    )

