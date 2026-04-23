def analyze_satellite(temp, distance, orientation):

    # COLLISION RISK

    if distance < 15:

        return {

            "state": "CRITICAL",

            "risk": "HIGH",

            "decision": "Pericol coliziune detectat"

        }


    # ORBITAL INSTABILITY

    if orientation == "UNSTABLE":

        return {

            "state": "WARNING",

            "risk": "MEDIUM",

            "decision": "Protocol stabilizare activat"

        }


    # OVERHEATING

    if temp > 35:

        return {

            "state": "WARNING",

            "risk": "HIGH",

            "decision": "Protocol răcire activat"

        }


    return {

        "state": "STABLE",

        "risk": "LOW",

        "decision": "Toate sistemele funcționează normal"

    }

