def calculate_weekly_awards(matchups):
    if not matchups:
        return {
            "highest_score": None,
            "lowest_score": None,
            "closest_game": None,
            "biggest_blowout": None,
        }

    scored_matchups = [
        matchup
        for matchup in matchups
        if matchup.get("points") is not None
    ]

    if not scored_matchups:
        return {
            "highest_score": None,
            "lowest_score": None,
            "closest_game": None,
            "biggest_blowout": None,
        }

    highest_score = max(
        scored_matchups,
        key=lambda team: team["points"]
    )

    lowest_score = min(
        scored_matchups,
        key=lambda team: team["points"]
    )

    grouped = {}

    for team in scored_matchups:
        matchup_id = team.get("matchup_id")

        if matchup_id is None:
            continue

        grouped.setdefault(matchup_id, []).append(team)

    biggest_blowout = None
    closest_game = None

    for teams in grouped.values():
        if len(teams) != 2:
            continue

        margin = abs(
            teams[0]["points"] -
            teams[1]["points"]
        )

        if (
            biggest_blowout is None
            or margin > biggest_blowout["margin"]
        ):
            biggest_blowout = {
                "winner": max(
                    teams,
                    key=lambda t: t["points"]
                ),
                "loser": min(
                    teams,
                    key=lambda t: t["points"]
                ),
                "margin": round(margin, 2)
            }

        if (
            closest_game is None
            or margin < closest_game["margin"]
        ):
            closest_game = {
                "winner": max(
                    teams,
                    key=lambda t: t["points"]
                ),
                "loser": min(
                    teams,
                    key=lambda t: t["points"]
                ),
                "margin": round(margin, 2)
            }

    return {
        "highest_score": highest_score,
        "lowest_score": lowest_score,
        "closest_game": closest_game,
        "biggest_blowout": biggest_blowout,
    }

def enrich_awards(awards, standings):
    team_lookup = {
        team["roster_id"]: team["display_name"]
        for team in standings
    }

    def enrich_team(team):
        if team is None:
            return None

        return {
            "team": team_lookup.get(
                team["roster_id"],
                "Unknown"
            ),
            "points": round(team["points"], 2)
        }

    awards["highest_score"] = enrich_team(
        awards["highest_score"]
    )

    awards["lowest_score"] = enrich_team(
        awards["lowest_score"]
    )

    if awards["closest_game"] is not None:
        awards["closest_game"] = {
            "winner": enrich_team(
                awards["closest_game"]["winner"]
            ),
            "loser": enrich_team(
                awards["closest_game"]["loser"]
            ),
            "margin": awards["closest_game"]["margin"]
        }

    if awards["biggest_blowout"] is not None:
        awards["biggest_blowout"] = {
            "winner": enrich_team(
                awards["biggest_blowout"]["winner"]
            ),
            "loser": enrich_team(
                awards["biggest_blowout"]["loser"]
            ),
            "margin": awards["biggest_blowout"]["margin"]
        }

    return awards
