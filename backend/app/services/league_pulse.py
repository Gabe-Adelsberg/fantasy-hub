def _team_lookup(standings: list) -> dict:
    return {
        team["roster_id"]: team["display_name"]
        for team in standings
    }


def _score_weeks(matchups_by_week: dict[int, list]) -> dict[int, dict[int, float]]:
    weeks = {}

    for week, matchups in matchups_by_week.items():
        scores = {
            matchup.get("roster_id"): matchup.get("points", 0)
            for matchup in matchups
            if matchup.get("roster_id") is not None
        }

        if scores:
            weeks[week] = scores

    return weeks


def _all_play_for_team(roster_id: int, weeks: dict[int, dict[int, float]]) -> dict:
    wins = 0
    losses = 0
    ties = 0

    for scores in weeks.values():
        if roster_id not in scores:
            continue

        score = scores[roster_id]

        for opponent_id, opponent_score in scores.items():
            if opponent_id == roster_id:
                continue

            if score > opponent_score:
                wins += 1
            elif score < opponent_score:
                losses += 1
            else:
                ties += 1

    total = wins + losses + ties

    return {
        "wins": wins,
        "losses": losses,
        "ties": ties,
        "win_rate": round(wins / total, 3) if total else 0,
    }


def _consistency(scores: list[float]) -> dict:
    if not scores:
        return {
            "average": 0,
            "high": 0,
            "low": 0,
            "standard_deviation": 0,
        }

    average = sum(scores) / len(scores)
    variance = sum((score - average) ** 2 for score in scores) / len(scores)

    return {
        "average": round(average, 2),
        "high": round(max(scores), 2),
        "low": round(min(scores), 2),
        "standard_deviation": round(variance ** 0.5, 2),
    }


def _weekly_storylines(
    selected_week: int,
    matchups_by_week: dict[int, list],
    weekly_scores: dict[int, dict[int, float]],
    standings: list,
) -> list[dict]:
    lookup = _team_lookup(standings)
    scores = weekly_scores.get(selected_week, {})

    if not scores:
        return [{
            "title": "No pulse yet",
            "description": "No scoring data is available for this week.",
            "team": None,
            "value": None,
        }]

    sorted_scores = sorted(
        scores.items(),
        key=lambda item: item[1],
        reverse=True,
    )
    top_id, top_score = sorted_scores[0]
    low_id, low_score = sorted_scores[-1]
    storylines = [
        {
            "title": "Statement Game",
            "description": f"{lookup.get(top_id, 'Unknown')} led the league this week.",
            "team": lookup.get(top_id, "Unknown"),
            "value": round(top_score, 2),
        },
        {
            "title": "Floor Watch",
            "description": f"{lookup.get(low_id, 'Unknown')} posted the week's lowest score.",
            "team": lookup.get(low_id, "Unknown"),
            "value": round(low_score, 2),
        },
    ]

    closest_gap = None
    bad_beat = None

    for matchup in _group_matchups_for_week(selected_week, matchups_by_week):
        teams = matchup["teams"]

        if len(teams) != 2:
            continue

        first = teams[0]
        second = teams[1]
        gap = abs(first["points"] - second["points"])

        if closest_gap is None or gap < closest_gap["gap"]:
            closest_gap = {
                "gap": gap,
                "winner": first if first["points"] >= second["points"] else second,
                "loser": second if first["points"] >= second["points"] else first,
            }

        loser = second if first["points"] >= second["points"] else first

        if (
            bad_beat is None
            or loser["points"] > bad_beat["loser"]["points"]
        ):
            bad_beat = {
                "gap": gap,
                "loser": loser,
            }

    if closest_gap is not None:
        storylines.append({
            "title": "Nail-Biter",
            "description": (
                f"{lookup.get(closest_gap['winner']['roster_id'], 'Unknown')} "
                f"survived by {round(closest_gap['gap'], 2)}."
            ),
            "team": lookup.get(closest_gap["winner"]["roster_id"], "Unknown"),
            "value": round(closest_gap["gap"], 2),
        })

    if bad_beat is not None:
        storylines.append({
            "title": "Bad Beat",
            "description": (
                f"{lookup.get(bad_beat['loser']['roster_id'], 'Unknown')} "
                "scored well enough to hurt and still lost."
            ),
            "team": lookup.get(bad_beat["loser"]["roster_id"], "Unknown"),
            "value": round(bad_beat["loser"]["points"], 2),
        })

    return storylines


def _group_matchups_for_week(
    selected_week: int,
    matchups_by_week: dict[int, list],
) -> list[dict]:
    matchup_ids = {}

    for matchup in matchups_by_week.get(selected_week, []):
        matchup_id = matchup.get("matchup_id")

        if matchup_id is None:
            continue

        matchup_ids.setdefault(matchup_id, []).append({
            "roster_id": matchup.get("roster_id"),
            "points": matchup.get("points", 0),
        })

    return [
        {"matchup_id": matchup_id, "teams": teams}
        for matchup_id, teams in matchup_ids.items()
    ]


def _build_notes(team: dict, luck_delta: float, consistency: dict) -> list[str]:
    notes = []

    if luck_delta >= 1:
        notes.append("Record is running ahead of all-play performance.")
    elif luck_delta <= -1:
        notes.append("Better than the record suggests.")

    if consistency["standard_deviation"] >= 25:
        notes.append("High-variance roster: scary ceiling, shaky floor.")
    elif consistency["standard_deviation"] and consistency["standard_deviation"] <= 12:
        notes.append("Reliable weekly scorer.")

    if not notes:
        notes.append("Profile roughly matches the standings.")

    return notes


def _head_to_head_records(matchups_by_week: dict[int, list]) -> dict[int, dict]:
    records = {}

    for matchups in matchups_by_week.values():
        grouped = {}

        for matchup in matchups:
            matchup_id = matchup.get("matchup_id")

            if matchup_id is None:
                continue

            grouped.setdefault(matchup_id, []).append(matchup)

        for teams in grouped.values():
            if len(teams) != 2:
                continue

            first = teams[0]
            second = teams[1]
            first_id = first.get("roster_id")
            second_id = second.get("roster_id")

            if first_id is None or second_id is None:
                continue

            records.setdefault(first_id, {"wins": 0, "losses": 0, "ties": 0})
            records.setdefault(second_id, {"wins": 0, "losses": 0, "ties": 0})

            if first.get("points", 0) > second.get("points", 0):
                records[first_id]["wins"] += 1
                records[second_id]["losses"] += 1
            elif second.get("points", 0) > first.get("points", 0):
                records[second_id]["wins"] += 1
                records[first_id]["losses"] += 1
            else:
                records[first_id]["ties"] += 1
                records[second_id]["ties"] += 1

    return records


def _schedule_difficulty(matchups_by_week: dict[int, list]) -> dict[int, dict]:
    opponents = {}

    for matchups in matchups_by_week.values():
        grouped = {}

        for matchup in matchups:
            matchup_id = matchup.get("matchup_id")

            if matchup_id is None:
                continue

            grouped.setdefault(matchup_id, []).append(matchup)

        for teams in grouped.values():
            if len(teams) != 2:
                continue

            first = teams[0]
            second = teams[1]
            first_id = first.get("roster_id")
            second_id = second.get("roster_id")

            if first_id is None or second_id is None:
                continue

            opponents.setdefault(first_id, []).append(second.get("points", 0))
            opponents.setdefault(second_id, []).append(first.get("points", 0))

    difficulty = {}

    for roster_id, scores in opponents.items():
        average = sum(scores) / len(scores) if scores else 0
        difficulty[roster_id] = {
            "average_opponent_score": round(average, 2),
            "games_tracked": len(scores),
        }

    ranked = sorted(
        difficulty.items(),
        key=lambda item: item[1]["average_opponent_score"],
        reverse=True,
    )

    for rank, (roster_id, _) in enumerate(ranked, start=1):
        difficulty[roster_id]["difficulty_rank"] = rank

    return difficulty


def _rivalries(matchups_by_week: dict[int, list], standings: list) -> dict[int, list]:
    lookup = _team_lookup(standings)
    rivalries = {}

    for matchups in matchups_by_week.values():
        grouped = {}

        for matchup in matchups:
            matchup_id = matchup.get("matchup_id")

            if matchup_id is None:
                continue

            grouped.setdefault(matchup_id, []).append(matchup)

        for teams in grouped.values():
            if len(teams) != 2:
                continue

            first = teams[0]
            second = teams[1]
            first_id = first.get("roster_id")
            second_id = second.get("roster_id")

            if first_id is None or second_id is None:
                continue

            for roster_id, opponent_id, points_for, points_against in (
                (
                    first_id,
                    second_id,
                    first.get("points", 0),
                    second.get("points", 0),
                ),
                (
                    second_id,
                    first_id,
                    second.get("points", 0),
                    first.get("points", 0),
                ),
            ):
                team_rivalries = rivalries.setdefault(roster_id, {})
                rivalry = team_rivalries.setdefault(opponent_id, {
                    "opponent": lookup.get(opponent_id, "Unknown"),
                    "opponent_roster_id": opponent_id,
                    "wins": 0,
                    "losses": 0,
                    "ties": 0,
                    "points_for": 0,
                    "points_against": 0,
                    "games": 0,
                })
                rivalry["games"] += 1
                rivalry["points_for"] += points_for
                rivalry["points_against"] += points_against

                if points_for > points_against:
                    rivalry["wins"] += 1
                elif points_against > points_for:
                    rivalry["losses"] += 1
                else:
                    rivalry["ties"] += 1

    serialized = {}

    for roster_id, team_rivalries in rivalries.items():
        serialized[roster_id] = sorted(
            [
                {
                    **rivalry,
                    "points_for": round(rivalry["points_for"], 2),
                    "points_against": round(rivalry["points_against"], 2),
                }
                for rivalry in team_rivalries.values()
            ],
            key=lambda rivalry: (
                rivalry["games"],
                abs(rivalry["points_for"] - rivalry["points_against"]),
            ),
            reverse=True,
        )

    return serialized


def _bench_pain(matchups_by_week: dict[int, list]) -> dict[int, dict]:
    pain = {}

    for week, matchups in matchups_by_week.items():
        for matchup in matchups:
            roster_id = matchup.get("roster_id")
            players_points = matchup.get("players_points") or {}

            if roster_id is None or not players_points:
                continue

            total_player_points = sum(players_points.values())
            started_points = matchup.get("points", 0)
            bench_points = max(total_player_points - started_points, 0)
            team_pain = pain.setdefault(roster_id, {
                "total_bench_points": 0,
                "worst_week": None,
                "worst_week_points": 0,
                "weeks_tracked": 0,
            })
            team_pain["total_bench_points"] += bench_points
            team_pain["weeks_tracked"] += 1

            if bench_points > team_pain["worst_week_points"]:
                team_pain["worst_week"] = week
                team_pain["worst_week_points"] = bench_points

    for team_pain in pain.values():
        weeks = team_pain["weeks_tracked"]
        team_pain["total_bench_points"] = round(
            team_pain["total_bench_points"],
            2,
        )
        team_pain["average_bench_points"] = round(
            team_pain["total_bench_points"] / weeks,
            2,
        ) if weeks else 0
        team_pain["worst_week_points"] = round(
            team_pain["worst_week_points"],
            2,
        )

    return pain


def _power_history(roster_id: int, weekly_scores: dict[int, dict[int, float]]) -> list[dict]:
    history = []

    for week in sorted(weekly_scores):
        scores = weekly_scores[week]

        if roster_id not in scores:
            continue

        ranked = sorted(
            scores.items(),
            key=lambda item: item[1],
            reverse=True,
        )
        rank = next(
            index
            for index, item in enumerate(ranked, start=1)
            if item[0] == roster_id
        )
        history.append({
            "week": week,
            "rank": rank,
            "score": round(scores[roster_id], 2),
        })

    return history


def _team_label(
    actual_win_rate: float,
    all_play_win_rate: float,
    consistency: dict,
) -> tuple[str, str]:
    gap = actual_win_rate - all_play_win_rate

    if actual_win_rate >= 0.6 and all_play_win_rate >= 0.6:
        return "Juggernaut", "Winning record backed up by strong all-play scoring."

    if actual_win_rate >= 0.6 and gap >= 0.15:
        return "Fraud Watch", "Record is outpacing the weekly scoring profile."

    if actual_win_rate <= 0.45 and all_play_win_rate >= 0.55:
        return "Sleeping Giant", "Better weekly scoring than the record shows."

    if consistency["standard_deviation"] >= 25:
        return "Chaos Team", "Ceiling and floor are both very alive."

    return "Steady Profile", "Record and scoring profile are mostly aligned."


def _playoff_probability(
    pulse_rank: int,
    team_count: int,
    playoff_teams: int,
    actual_win_rate: float,
    all_play_win_rate: float,
) -> int:
    seed_score = max((team_count - pulse_rank + 1) / team_count, 0)
    probability = (
        seed_score * 45
        + actual_win_rate * 30
        + all_play_win_rate * 25
    )

    if pulse_rank <= playoff_teams:
        probability += 10

    return max(1, min(round(probability), 99))


def _share_cards(teams: list[dict], storylines: list[dict]) -> list[dict]:
    cards = []
    fraud = next(
        (team for team in teams if team["label"] == "Fraud Watch"),
        None,
    )
    sleeping = next(
        (team for team in teams if team["label"] == "Sleeping Giant"),
        None,
    )

    if fraud is not None:
        cards.append({
            "title": "Fraud Watch",
            "body": (
                f"{fraud['team']} is {fraud['actual_record']} but only "
                f"{fraud['all_play_record']} in all-play. The table has receipts."
            ),
        })

    if sleeping is not None:
        cards.append({
            "title": "Sleeping Giant",
            "body": (
                f"{sleeping['team']} looks better than the standings: "
                f"{sleeping['all_play_record']} all-play with a "
                f"{sleeping['average_score']} average."
            ),
        })

    for storyline in storylines[:2]:
        cards.append({
            "title": storyline["title"],
            "body": storyline["description"],
        })

    return cards


def build_league_pulse(
    standings: list,
    matchups_by_week: dict[int, list],
    selected_week: int,
    playoff_teams: int,
) -> dict:
    matchups_through_selected_week = {
        week: matchups
        for week, matchups in matchups_by_week.items()
        if week <= selected_week
    }
    weekly_scores = _score_weeks(matchups_through_selected_week)
    head_to_head = _head_to_head_records(matchups_through_selected_week)
    schedule = _schedule_difficulty(matchups_through_selected_week)
    rivalries = _rivalries(matchups_through_selected_week, standings)
    bench_pain = _bench_pain(matchups_through_selected_week)
    teams = []

    for team in standings:
        roster_id = team["roster_id"]
        scores = [
            scores_by_team[roster_id]
            for scores_by_team in weekly_scores.values()
            if roster_id in scores_by_team
        ]
        all_play = _all_play_for_team(roster_id, weekly_scores)
        consistency = _consistency(scores)
        actual = head_to_head.get(
            roster_id,
            {
                "wins": team["wins"],
                "losses": team["losses"],
                "ties": team["ties"],
            },
        )
        games_played = actual["wins"] + actual["losses"] + actual["ties"]
        actual_win_rate = (
            (actual["wins"] + actual["ties"] * 0.5) / games_played
            if games_played
            else 0
        )
        label, label_description = _team_label(
            actual_win_rate,
            all_play["win_rate"],
            consistency,
        )
        actual_wins = actual["wins"]
        all_play_expected_wins = (
            all_play["win_rate"] * games_played
        )
        luck_delta = round(actual_wins - all_play_expected_wins, 2)

        teams.append({
            "team": team["display_name"],
            "roster_id": roster_id,
            "actual_record": (
                f'{actual["wins"]}-{actual["losses"]}'
                + (f'-{actual["ties"]}' if actual["ties"] else "")
            ),
            "all_play_record": (
                f'{all_play["wins"]}-{all_play["losses"]}'
                + (f'-{all_play["ties"]}' if all_play["ties"] else "")
            ),
            "all_play_win_rate": all_play["win_rate"],
            "luck_delta": luck_delta,
            "average_score": consistency["average"],
            "high_score": consistency["high"],
            "low_score": consistency["low"],
            "standard_deviation": consistency["standard_deviation"],
            "label": label,
            "label_description": label_description,
            "playoff_odds": 0,
            "schedule_difficulty": schedule.get(roster_id, {
                "average_opponent_score": 0,
                "difficulty_rank": 0,
                "games_tracked": 0,
            }),
            "bench_pain": bench_pain.get(roster_id, {
                "total_bench_points": 0,
                "average_bench_points": 0,
                "worst_week": None,
                "worst_week_points": 0,
                "weeks_tracked": 0,
            }),
            "rivalries": rivalries.get(roster_id, []),
            "power_history": _power_history(roster_id, weekly_scores),
            "notes": _build_notes(team, luck_delta, consistency),
        })

    teams.sort(
        key=lambda team: (
            team["all_play_win_rate"],
            team["average_score"],
        ),
        reverse=True,
    )

    for index, team in enumerate(teams, start=1):
        team["pulse_rank"] = index
        team["playoff_odds"] = _playoff_probability(
            index,
            len(teams),
            playoff_teams,
            _record_win_rate(team["actual_record"]),
            team["all_play_win_rate"],
        )

    luckiest = max(teams, key=lambda team: team["luck_delta"], default=None)
    unluckiest = min(teams, key=lambda team: team["luck_delta"], default=None)
    most_consistent = min(
        [team for team in teams if team["standard_deviation"] > 0],
        key=lambda team: team["standard_deviation"],
        default=None,
    )
    most_volatile = max(
        teams,
        key=lambda team: team["standard_deviation"],
        default=None,
    )

    storylines = _weekly_storylines(
        selected_week,
        matchups_through_selected_week,
        weekly_scores,
        standings,
    )

    return {
        "storylines": storylines,
        "teams": teams,
        "highlights": {
            "luckiest_team": luckiest,
            "unluckiest_team": unluckiest,
            "most_consistent_team": most_consistent,
            "most_volatile_team": most_volatile,
        },
        "share_cards": _share_cards(teams, storylines),
    }


def _record_win_rate(record: str) -> float:
    parts = [int(part) for part in record.split("-")]
    wins = parts[0] if len(parts) > 0 else 0
    losses = parts[1] if len(parts) > 1 else 0
    ties = parts[2] if len(parts) > 2 else 0
    total = wins + losses + ties

    return (wins + ties * 0.5) / total if total else 0
