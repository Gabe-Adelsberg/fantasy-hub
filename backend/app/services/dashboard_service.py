from app.services.sleeper.leagues import get_sleeper_league
from app.services.sleeper.users import get_league_users
from app.services.sleeper.rosters import get_league_rosters
from app.services.sleeper.matchups import get_matchups
from app.services.standings_service import build_standings
from app.services.rankings.power import build_power_rankings
from app.services.awards.weekly import calculate_weekly_awards, enrich_awards
from app.services.sleeper.state import get_nfl_state
from app.serializers.league import serialize_league
from app.serializers.members import serialize_members
from app.serializers.matchups import serialize_matchups
from app.serializers.standings import serialize_standings

def get_latest_available_week(sleeper_id: str, league_info: dict) -> int:
    settings = league_info.get("settings", {})

    start_week = (
        settings.get("playoff_week_start")
        or settings.get("leg")
        or 18
    )

    week = int(start_week)

    while week > 1:
        matchups = get_matchups(sleeper_id, week)

        if matchups:
            return week

        week -= 1

    return 1

def build_dashboard(league, week: int | None = None):
    sleeper_id = league.sleeper_league_id

    league_info = get_sleeper_league(sleeper_id)
    members = get_league_users(sleeper_id)
    rosters = get_league_rosters(sleeper_id)

    if week is None:
        week = get_latest_available_week(sleeper_id, league_info)

    matchups = get_matchups(sleeper_id, week)

    standings = build_standings(rosters, members)
    power_rankings = build_power_rankings(standings, matchups)

    weekly_awards = calculate_weekly_awards(matchups)
    weekly_awards = enrich_awards(weekly_awards, standings)

    return {
        "league": serialize_league(league_info),
        "members": serialize_members(members),
        "matchups": serialize_matchups(matchups, standings),
        "standings": serialize_standings(standings),
        "power_rankings": power_rankings,
        "weekly_awards": weekly_awards,
        "week": week,
    }