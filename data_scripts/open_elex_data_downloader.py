import os

def cloneState(state):
    gitURL = "https://github.com/openelections/openelections-data-" + state + ".git"

    command = "git clone " + gitURL

    os.system(command)