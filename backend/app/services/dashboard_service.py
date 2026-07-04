from app.services.sleeper.leagues import get_sleeper_league
from app.services.sleeper.users import get_league_users
from app.services.sleeper.rosters import get_league_rosters
from app.services.sleeper.matchups import get_matchups


def build_dashboard(league):
    sleeper_id = league.sleeper_league_id

    league_info = get_sleeper_league(sleeper_id)
    members = get_league_users(sleeper_id)
    rosters = get_league_rosters(sleeper_id)

    # Hardcoded for now
    current_week = 1

    matchups = get_matchups(
        sleeper_id,
        current_week,
    )

    return {
        "league": league_info,
        "members": members,
        "rosters": rosters,
        "matchups": matchups,
    }