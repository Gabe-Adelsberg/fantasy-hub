def serialize_matchups(matchups):
    return [
        {
            "roster_id": matchup.get("roster_id"),
            "matchup_id": matchup.get("matchup_id"),
            "points": matchup.get("points"),
        }
        for matchup in matchups
    ]