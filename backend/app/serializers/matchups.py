def serialize_matchups(matchups, standings):
    team_lookup = {
        team["roster_id"]: team["display_name"]
        for team in standings
    }

    grouped = {}

    for matchup in matchups:
        matchup_id = matchup.get("matchup_id")

        if matchup_id not in grouped:
            grouped[matchup_id] = []

        grouped[matchup_id].append(matchup)

    serialized = []

    for matchup_id, teams in grouped.items():
        if len(teams) != 2:
            continue

        team_a = teams[0]
        team_b = teams[1]

        team_a_points = team_a.get("points", 0)
        team_b_points = team_b.get("points", 0)

        if team_a_points > team_b_points:
            winner = team_lookup.get(team_a.get("roster_id"), "Unknown")
        elif team_b_points > team_a_points:
            winner = team_lookup.get(team_b.get("roster_id"), "Unknown")
        else:
            winner = "Tie"

        serialized.append({
            "matchup_id": matchup_id,
            "team_a": team_lookup.get(team_a.get("roster_id"), "Unknown"),
            "team_a_points": team_a_points,
            "team_b": team_lookup.get(team_b.get("roster_id"), "Unknown"),
            "team_b_points": team_b_points,
            "winner": winner,
            "margin": round(abs(team_a_points - team_b_points), 2),
        })

    return serialized