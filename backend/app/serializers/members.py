def serialize_members(members):
    return [
        {
            "user_id": member.get("user_id"),
            "display_name": member.get("display_name"),
        }
        for member in members
    ]