def serialize_standings(standings):
    serialized = []

    for index, team in enumerate(standings, start=1):
        serialized.append({
            "rank": index,
            "team": team["display_name"],
            "record": f'{team["wins"]}-{team["losses"]}',
            "points_for": team["points_for"],
            "points_against": team["points_against"],
        })

    return serialized