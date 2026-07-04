def build_standings(rosters: list, members: list) -> list:
    member_lookup = {
        member.get("user_id"): member
        for member in members
    }

    standings = []

    for roster in rosters:
        owner_id = roster.get("owner_id")
        member = member_lookup.get(owner_id, {})

        settings = roster.get("settings", {})

        standings.append({
            "roster_id": roster.get("roster_id"),
            "owner_id": owner_id,
            "display_name": member.get("display_name", "Unknown"),
            "wins": settings.get("wins", 0),
            "losses": settings.get("losses", 0),
            "ties": settings.get("ties", 0),
            "points_for": settings.get("fpts", 0),
            "points_against": settings.get("fpts_against", 0),
        })

    standings.sort(
        key=lambda team: (
            team["wins"],
            team["points_for"]
        ),
        reverse=True
    )

    return standings