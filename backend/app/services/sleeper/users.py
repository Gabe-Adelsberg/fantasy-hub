from app.services.sleeper.client import sleeper_get


def get_league_users(league_id: str):
    return sleeper_get(f"/league/{league_id}/users")