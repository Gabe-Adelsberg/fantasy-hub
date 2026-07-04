from app.services.sleeper.client import sleeper_get


def get_matchups(
    league_id: str,
    week: int,
):
    return sleeper_get(
        f"/league/{league_id}/matchups/{week}"
    )