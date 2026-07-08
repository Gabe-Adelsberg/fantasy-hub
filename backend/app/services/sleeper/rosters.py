from app.services.sleeper.client import sleeper_get


def get_league_rosters(league_id: str, use_cache: bool = True):
    return sleeper_get(f"/league/{league_id}/rosters", use_cache=use_cache)
