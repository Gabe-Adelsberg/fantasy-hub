from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.db.models.user import User
from app.schemas.league import LeagueCreate, LeagueResponse
from app.schemas.sleeper import SleeperAccountConnect, SleeperLeagueConnect
from app.services.league_service import (
    create_league,
    connect_sleeper_account,
    connect_sleeper_league,
    get_user_leagues,
)

router = APIRouter(
    prefix="/api/v1/leagues",
    tags=["Leagues"]
)


@router.post("/", response_model=LeagueResponse)
def create_new_league(
    league_data: LeagueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_league(db, league_data, current_user)

@router.get("/", response_model=List[LeagueResponse])
def get_my_leagues(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_user_leagues(db, current_user)

@router.post("/connect-sleeper", response_model=LeagueResponse)
def connect_sleeper(
    request: SleeperLeagueConnect,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return connect_sleeper_league(
        db,
        request.league_id,
        current_user,
    )


@router.post("/connect-sleeper-account", response_model=List[LeagueResponse])
def connect_sleeper_by_account(
    request: SleeperAccountConnect,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return connect_sleeper_account(
        db,
        request.username,
        current_user,
        request.season,
        request.sport,
    )
