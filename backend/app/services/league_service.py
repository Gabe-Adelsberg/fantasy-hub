from sqlalchemy.orm import Session

from app.db.models.league import League
from app.db.models.user import User
from app.schemas.league import LeagueCreate


def create_league(
    db: Session,
    league_data: LeagueCreate,
    current_user: User
) -> League:
    new_league = League(
        name=league_data.name,
        sport=league_data.sport,
        season=league_data.season,
        commissioner_id=current_user.id
    )

    db.add(new_league)
    db.commit()
    db.refresh(new_league)

    return new_league

def get_user_leagues(
    db: Session,
    current_user: User
):
    return (
        db.query(League)
        .filter(League.commissioner_id == current_user.id)
        .all()
    )

def get_user_leagues(
    db: Session,
    current_user: User
):
    return (
        db.query(League)
        .filter(
            League.commissioner_id == current_user.id
        )
        .all()
    )