from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.db.models.league import League
from app.db.models.user import User
from app.services.dashboard_service import build_dashboard

router = APIRouter(
    prefix="/api/v1/dashboard",
    tags=["Dashboard"],
)


@router.get("/{league_id}")
def get_dashboard(
    league_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    league = (
        db.query(League)
        .filter(League.id == league_id)
        .first()
    )

    if league is None:
        raise HTTPException(status_code=404, detail="League not found.")

    if league.commissioner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed.")

    if league.sleeper_league_id is None:
        raise HTTPException(
            status_code=400,
            detail="League is not connected to Sleeper."
        )

    return build_dashboard(league)