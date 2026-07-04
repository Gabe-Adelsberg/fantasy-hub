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

    class Config:
        from_attributes = True