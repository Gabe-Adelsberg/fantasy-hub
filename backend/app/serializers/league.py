def serialize_league(league_info):
    return {
        "name": league_info.get("name"),
        "sport": league_info.get("sport"),
        "season": league_info.get("season"),
        "status": league_info.get("status"),
    }