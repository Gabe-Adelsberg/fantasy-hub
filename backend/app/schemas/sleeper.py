from pydantic import BaseModel


class SleeperLeagueConnect(BaseModel):
    league_id: str


class SleeperAccountConnect(BaseModel):
    username: str
    season: int | None = None
    sport: str = "nfl"
