from pydantic import BaseModel


class LeagueCreate(BaseModel):
    name: str
    sport: str
    season: int

class LeagueResponse(BaseModel):
    id: int
    name: str
    sport: str
    season: int
    commissioner_id: int
    sleeper_league_id: str | None = None
    sleeper_user_id: str | None = None
    sleeper_username: str | None = None
    sleeper_roster_id: int | None = None

    class Config:
        from_attributes = True
