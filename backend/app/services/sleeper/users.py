from app.services.sleeper.client import sleeper_get
from urllib.parse import quote


def get_sleeper_user(username: str):
    return sleeper_get(f"/user/{quote(username)}")


def get_sleeper_user_leagues(
    sleeper_user_id: str,
    sport: str,
    season: int | str,
):
    return sleeper_get(
        f"/user/{quote(str(sleeper_user_id))}/leagues/{quote(sport)}/{season}"
    )


def get_league_users(league_id: str, use_cache: bool = True):
    return sleeper_get(f"/league/{league_id}/users", use_cache=use_cache)
