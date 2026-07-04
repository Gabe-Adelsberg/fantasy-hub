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

    class Config:
        from_attributes = True