from app.services.sleeper.client import sleeper_get


def get_sleeper_user(username: str):
    return sleeper_get(f"/user/{username}")


def get_sleeper_user_leagues(
    sleeper_user_id: str,
    sport: str,
    season: int | str,
):
    return sleeper_get(f"/user/{sleeper_user_id}/leagues/{sport}/{season}")


def get_league_users(league_id: str):
    return sleeper_get(f"/league/{league_id}/users")
