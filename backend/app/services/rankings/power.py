def normalize(value: float, max_value: float) -> float:
    if max_value == 0:
        return 0
    return value / max_value


def build_power_rankings(standings: list, matchups: list) -> list:
    if not standings:
        return []

    max_wins = max(team["wins"] for team in standings)
    max_points_for = max(team["points_for"] for team in standings)
    max_points_against = max(team["points_against"] for team in standings)
    max_week_points = max(
        (matchup.get("points", 0) for matchup in matchups),
        default=0
    )

    week_points_by_roster = {
        matchup.get("roster_id"): matchup.get("points", 0)
        for matchup in matchups
    }

    rankings = []

    for team in standings:
        roster_id = team["roster_id"]
        games_played = team["wins"] + team["losses"] + team["ties"]

        win_percentage = (
            team["wins"] / games_played
            if games_played > 0
            else 0
        )

        points_for_score = normalize(
            team["points_for"],
            max_points_for
        )

        # Lower points against = better defensive/luck score
        points_against_score = 1 - normalize(
            team["points_against"],
            max_points_against
        )

        recent_score = normalize(
            week_points_by_roster.get(roster_id, 0),
            max_week_points
        )

        # High PF but bad record = unlucky, low PF but good record = lucky
        expected_win_strength = (
            points_for_score * 0.7
            + points_against_score * 0.3
        )

        luck_adjustment = expected_win_strength - win_percentage

        power_score = (
            win_percentage * 0.35
            + points_for_score * 0.30
            + points_against_score * 0.15
            + recent_score * 0.15
            + luck_adjustment * 0.05
        ) * 100

        rankings.append({
            "team": team["display_name"],
            "roster_id": roster_id,
            "record": f'{team["wins"]}-{team["losses"]}',
            "power_score": round(power_score, 2),
            "components": {
                "win_percentage": round(win_percentage * 100, 2),
                "points_for": round(points_for_score * 100, 2),
                "points_against": round(points_against_score * 100, 2),
                "recent_week": round(recent_score * 100, 2),
                "luck_adjustment": round(luck_adjustment * 100, 2),
            }
        })

    rankings.sort(
        key=lambda team: team["power_score"],
        reverse=True
    )

    for index, team in enumerate(rankings, start=1):
        team["rank"] = index

    return rankings
