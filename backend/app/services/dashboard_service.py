from concurrent.futures import ThreadPoolExecutor

from app.services.sleeper.leagues import get_sleeper_league
from app.services.sleeper.users import get_league_users
from app.services.sleeper.rosters import get_league_rosters
from app.services.sleeper.matchups import get_matchups
from app.services.sleeper.state import get_nfl_state
from app.services.standings_service import build_standings
from app.services.rankings.power import build_power_rankings
from app.services.awards.weekly import calculate_weekly_awards, enrich_awards
from app.services.league_pulse import build_league_pulse
from app.services.playoffs import build_playoff_picture
from app.services.playoffs import _int_setting, _rounds_for_playoff_teams
from app.services.social_hub import build_social_hub
from app.serializers.league import serialize_league
from app.serializers.members import serialize_members
from app.serializers.matchups import serialize_matchups
from app.serializers.standings import serialize_standings


def _build_user_team(league, standings: list[dict]) -> dict | None:
    sleeper_roster_id = getattr(league, "sleeper_roster_id", None)

    if sleeper_roster_id is None:
        return None

    for team in standings:
        if team.get("roster_id") == sleeper_roster_id:
            return {
                "roster_id": sleeper_roster_id,
                "team": team.get("display_name"),
                "display_name": team.get("display_name"),
                "sleeper_user_id": getattr(league, "sleeper_user_id", None),
                "sleeper_username": getattr(league, "sleeper_username", None),
            }

    return {
        "roster_id": sleeper_roster_id,
        "team": None,
        "display_name": None,
        "sleeper_user_id": getattr(league, "sleeper_user_id", None),
        "sleeper_username": getattr(league, "sleeper_username", None),
    }


def get_latest_available_week(sleeper_id: str, league_info: dict) -> int:
    settings = league_info.get("settings", {})
    nfl_state = get_nfl_state()

    start_week = (
        settings.get("leg")
        or nfl_state.get("week")
        or settings.get("playoff_week_start")
        or 18
    )

    week = min(max(int(start_week), 1), 18)

    while week > 1:
        matchups = get_matchups(sleeper_id, week)

        if matchups:
            return week

        week -= 1

    return 1

def build_dashboard(league, week: int | None = None):
    sleeper_id = league.sleeper_league_id

    with ThreadPoolExecutor(max_workers=3) as executor:
        league_info_future = executor.submit(get_sleeper_league, sleeper_id)
        members_future = executor.submit(get_league_users, sleeper_id)
        rosters_future = executor.submit(get_league_rosters, sleeper_id)

        league_info = league_info_future.result()
        members = members_future.result()
        rosters = rosters_future.result()

    latest_week = get_latest_available_week(sleeper_id, league_info)
    requested_week = latest_week if week is None else week
    week = min(max(int(requested_week), 1), latest_week)

    weeks_to_fetch = set(range(1, latest_week + 1))
    weeks_to_fetch.update(
        playoff_week
        for playoff_week in range(1, latest_week + 1)
    )

    with ThreadPoolExecutor(max_workers=6) as executor:
        matchup_futures = {
            matchup_week: executor.submit(
                get_matchups,
                sleeper_id,
                matchup_week,
            )
            for matchup_week in weeks_to_fetch
        }
        matchups_by_week = {
            matchup_week: future.result()
            for matchup_week, future in matchup_futures.items()
        }

    matchups = matchups_by_week.get(week, [])

    standings = build_standings(rosters, members)
    power_rankings = build_power_rankings(standings, matchups)
    settings = league_info.get("settings", {})
    playoff_week_start = _int_setting(settings, "playoff_week_start", 15)
    playoff_teams = min(
        _int_setting(settings, "playoff_teams", min(6, len(standings))),
        len(standings),
    )
    championship_week = (
        playoff_week_start
        + _rounds_for_playoff_teams(playoff_teams)
        - 1
    )
    playoff_matchups_by_week = {}

    for playoff_week in range(playoff_week_start, championship_week + 1):
        if playoff_week <= latest_week:
            playoff_matchups_by_week[playoff_week] = matchups_by_week.get(
                playoff_week,
                [],
            )

    playoff_picture = build_playoff_picture(
        standings,
        league_info,
        latest_week,
        playoff_matchups_by_week,
    )

    weekly_awards = calculate_weekly_awards(matchups)
    weekly_awards = enrich_awards(weekly_awards, standings)
    league_pulse = build_league_pulse(
        standings,
        matchups_by_week,
        week,
        playoff_teams,
    )
    serialized_standings = serialize_standings(standings)
    serialized_matchups = serialize_matchups(matchups, standings)
    social_hub = build_social_hub(
        league_info,
        week,
        serialized_standings,
        serialized_matchups,
        weekly_awards,
        league_pulse,
        playoff_picture,
    )

    return {
        "league": serialize_league(league_info),
        "user_team": _build_user_team(league, standings),
        "members": serialize_members(members),
        "matchups": serialized_matchups,
        "standings": serialized_standings,
        "power_rankings": power_rankings,
        "weekly_awards": weekly_awards,
        "week": week,
        "week_bounds": {
            "min": 1,
            "max": latest_week,
        },
        "playoff_picture": playoff_picture,
        "league_pulse": league_pulse,
        "social_hub": social_hub,
    }
