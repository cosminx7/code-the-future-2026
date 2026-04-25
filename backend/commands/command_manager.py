current_command = "NONE"


def set_command(command):

    global current_command

    current_command = command

    print(f"COMANDA SALVATA: {current_command}")


def get_command():

    global current_command

    print(f"COMANDA TRIMISA CATRE ESP: {current_command}")

    cmd = current_command

    current_command = "NONE"

    return cmd