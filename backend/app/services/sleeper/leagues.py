from app.services.sleeper.client import sleeper_get


def get_sleeper_league(league_id: str) -> dict:
    return sleeper_get(f"/league/{league_id}")