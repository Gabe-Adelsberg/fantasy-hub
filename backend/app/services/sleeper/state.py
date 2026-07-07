from app.services.sleeper.client import sleeper_get


def get_nfl_state():
    return sleeper_get("/state/nfl")