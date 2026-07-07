def _int_setting(settings: dict, key: str, fallback: int) -> int:
    value = settings.get(key)

    try:
        return int(value)
    except (TypeError, ValueError):
        return fallback


def _rounds_for_playoff_teams(playoff_teams: int) -> int:
    if playoff_teams <= 2:
        return 1
    if playoff_teams <= 4:
        return 2
    return 3


def _team_lookup(standings: list) -> dict:
    return {
        team["roster_id"]: team["display_name"]
        for team in standings
    }


def _round_name(round_number: int, total_rounds: int) -> str:
    if round_number == total_rounds:
        return "Championship"
    if round_number == total_rounds - 1:
        return "Semifinals"
    if round_number == 1:
        return "Quarterfinals"
    return f"Round {round_number}"


def _serialize_matchup(matchup_id: int, teams: list, lookup: dict) -> dict | None:
    if len(teams) != 2:
        return None

    team_a = teams[0]
    team_b = teams[1]
    team_a_points = team_a.get("points", 0)
    team_b_points = team_b.get("points", 0)

    if team_a_points > team_b_points:
        winner_roster_id = team_a.get("roster_id")
    elif team_b_points > team_a_points:
        winner_roster_id = team_b.get("roster_id")
    else:
        winner_roster_id = None

    return {
        "matchup_id": matchup_id,
        "team_a": lookup.get(team_a.get("roster_id"), "Unknown"),
        "team_a_roster_id": team_a.get("roster_id"),
        "team_a_points": round(team_a_points, 2),
        "team_b": lookup.get(team_b.get("roster_id"), "Unknown"),
        "team_b_roster_id": team_b.get("roster_id"),
        "team_b_points": round(team_b_points, 2),
        "winner": (
            lookup.get(winner_roster_id, "Unknown")
            if winner_roster_id is not None
            else "Tie"
        ),
        "winner_roster_id": winner_roster_id,
        "margin": round(abs(team_a_points - team_b_points), 2),
    }


def build_playoff_bracket(
    playoff_matchups_by_week: dict[int, list],
    standings: list,
    playoff_week_start: int,
    championship_week: int,
    playoff_roster_ids: set[int],
) -> list:
    lookup = _team_lookup(standings)
    total_rounds = max(championship_week - playoff_week_start + 1, 1)
    rounds = []

    for week in range(playoff_week_start, championship_week + 1):
        matchups = playoff_matchups_by_week.get(week, [])
        grouped = {}

        for matchup in matchups:
            matchup_id = matchup.get("matchup_id")
            roster_id = matchup.get("roster_id")

            if matchup_id is None or roster_id not in playoff_roster_ids:
                continue

            grouped.setdefault(matchup_id, []).append(matchup)

        round_number = week - playoff_week_start + 1
        serialized_matchups = []

        for matchup_id, teams in grouped.items():
            serialized = _serialize_matchup(matchup_id, teams, lookup)

            if serialized is not None:
                serialized_matchups.append(serialized)

        rounds.append({
            "week": week,
            "round": _round_name(round_number, total_rounds),
            "matchups": serialized_matchups,
        })

    return rounds


def build_playoff_performance(
    standings: list,
    playoff_matchups_by_week: dict[int, list],
    playoff_roster_ids: set[int],
) -> list:
    lookup = _team_lookup(standings)
    stats = {
        roster_id: {
            "roster_id": roster_id,
            "team": lookup.get(roster_id, "Unknown"),
            "playoff_wins": 0,
            "playoff_losses": 0,
            "playoff_points": 0,
            "weeks_played": 0,
            "high_score": 0,
        }
        for roster_id in playoff_roster_ids
    }

    for matchups in playoff_matchups_by_week.values():
        grouped = {}

        for matchup in matchups:
            matchup_id = matchup.get("matchup_id")
            roster_id = matchup.get("roster_id")

            if matchup_id is None or roster_id not in stats:
                continue

            grouped.setdefault(matchup_id, []).append(matchup)

            points = matchup.get("points", 0)
            stats[roster_id]["playoff_points"] += points
            stats[roster_id]["weeks_played"] += 1
            stats[roster_id]["high_score"] = max(
                stats[roster_id]["high_score"],
                points,
            )

        for teams in grouped.values():
            if len(teams) != 2:
                continue

            team_a = teams[0]
            team_b = teams[1]
            team_a_id = team_a.get("roster_id")
            team_b_id = team_b.get("roster_id")

            if team_a.get("points", 0) > team_b.get("points", 0):
                winner_id = team_a_id
                loser_id = team_b_id
            elif team_b.get("points", 0) > team_a.get("points", 0):
                winner_id = team_b_id
                loser_id = team_a_id
            else:
                continue

            if winner_id in stats:
                stats[winner_id]["playoff_wins"] += 1

            if loser_id in stats:
                stats[loser_id]["playoff_losses"] += 1

    performance = []

    for team in stats.values():
        weeks_played = team["weeks_played"]
        performance.append({
            **team,
            "playoff_points": round(team["playoff_points"], 2),
            "average_score": round(
                team["playoff_points"] / weeks_played,
                2,
            ) if weeks_played else 0,
            "high_score": round(team["high_score"], 2),
        })

    performance.sort(
        key=lambda team: (
            team["playoff_wins"],
            team["playoff_points"],
        ),
        reverse=True,
    )

    return performance


def build_playoff_picture(
    standings: list,
    league_info: dict,
    current_week: int,
    playoff_matchups_by_week: dict[int, list] | None = None,
) -> dict:
    settings = league_info.get("settings", {})
    team_count = len(standings)
    playoff_teams = min(
        _int_setting(settings, "playoff_teams", min(6, team_count)),
        team_count,
    )
    playoff_week_start = _int_setting(settings, "playoff_week_start", 15)
    regular_season_weeks = max(playoff_week_start - 1, 1)
    rounds = _rounds_for_playoff_teams(playoff_teams)
    championship_week = playoff_week_start + rounds - 1
    bye_count = 2 if playoff_teams == 6 else 0

    def serialize_team(team: dict, rank: int, status: str) -> dict:
        return {
            "seed": rank,
            "team": team["display_name"],
            "roster_id": team["roster_id"],
            "record": f'{team["wins"]}-{team["losses"]}',
            "points_for": team["points_for"],
            "status": status,
        }

    projected_playoff_teams = [
        serialize_team(team, rank, "bye" if rank <= bye_count else "playoff")
        for rank, team in enumerate(standings[:playoff_teams], start=1)
    ]

    bubble_teams = [
        serialize_team(team, rank, "bubble")
        for rank, team in enumerate(
            standings[playoff_teams:playoff_teams + 4],
            start=playoff_teams + 1,
        )
    ]
    playoff_matchups_by_week = playoff_matchups_by_week or {}
    playoff_roster_ids = {
        team["roster_id"]
        for team in standings[:playoff_teams]
    }
    bracket = build_playoff_bracket(
        playoff_matchups_by_week,
        standings,
        playoff_week_start,
        championship_week,
        playoff_roster_ids,
    )
    performance = build_playoff_performance(
        standings,
        playoff_matchups_by_week,
        playoff_roster_ids,
    )

    return {
        "playoff_week_start": playoff_week_start,
        "regular_season_weeks": regular_season_weeks,
        "playoff_teams": playoff_teams,
        "bye_count": bye_count,
        "championship_week": championship_week,
        "is_playoffs": current_week >= playoff_week_start,
        "weeks_until_playoffs": max(playoff_week_start - current_week, 0),
        "projected_playoff_teams": projected_playoff_teams,
        "bubble_teams": bubble_teams,
        "bracket": bracket,
        "performance": performance,
    }
