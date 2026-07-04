from app.services.sleeper.leagues import get_sleeper_league
from app.services.sleeper.users import get_league_users
from app.services.sleeper.rosters import get_league_rosters
from app.services.sleeper.matchups import get_matchups
from app.services.standings_service import build_standings

from app.serializers.league import serialize_league
from app.serializers.members import serialize_members
from app.serializers.matchups import serialize_matchups
from app.serializers.standings import serialize_standings

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

    standings = build_standings(rosters, members)

    return {
    "league": serialize_league(league_info),
    "members": serialize_members(members),
    "matchups": serialize_matchups(matchups),
    "standings": serialize_standings(standings),
}