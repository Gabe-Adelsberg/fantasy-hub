from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.db.models.user import User
from app.schemas.league import LeagueCreate, LeagueResponse
from app.services.league_service import create_league

router = APIRouter(
    prefix="/leagues",
    tags=["Leagues"]
)


@router.post("/", response_model=LeagueResponse)
def create_new_league(
    league_data: LeagueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_league(db, league_data, current_user)