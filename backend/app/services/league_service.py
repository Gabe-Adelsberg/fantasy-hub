from sqlalchemy.orm import Session

from app.db.models.league import League
from app.db.models.user import User
from app.schemas.league import LeagueCreate
from app.services.sleeper.leagues import get_sleeper_league
from app.services.sleeper.rosters import get_league_rosters
from app.services.sleeper.state import get_nfl_state
from app.services.sleeper.users import get_sleeper_user, get_sleeper_user_leagues


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

def connect_sleeper_league(
    db: Session,
    league_id: str,
    current_user: User
):
    sleeper_data = get_sleeper_league(league_id)

    league = League(
        name=sleeper_data["name"],
        sport=sleeper_data["sport"],
        season=sleeper_data["season"],
        commissioner_id=current_user.id,
        sleeper_league_id=league_id,
    )

    db.add(league)
    db.commit()
    db.refresh(league)

    return league


def _find_roster_id(league_id: str, sleeper_user_id: str) -> int | None:
    rosters = get_league_rosters(league_id)

    for roster in rosters:
        if str(roster.get("owner_id")) == str(sleeper_user_id):
            roster_id = roster.get("roster_id")
            return int(roster_id) if roster_id is not None else None

    return None


def connect_sleeper_account(
    db: Session,
    username: str,
    current_user: User,
    season: int | None = None,
    sport: str = "nfl",
) -> list[League]:
    sleeper_user = get_sleeper_user(username.strip())
    sleeper_user_id = str(sleeper_user["user_id"])
    sleeper_username = (
        sleeper_user.get("username")
        or sleeper_user.get("display_name")
        or username.strip()
    )
    resolved_sport = sport.lower().strip() or "nfl"
    resolved_season = season

    if resolved_season is None and resolved_sport == "nfl":
        nfl_state = get_nfl_state()
        resolved_season = int(nfl_state.get("season") or 2025)

    if resolved_season is None:
        resolved_season = 2025

    sleeper_leagues = get_sleeper_user_leagues(
        sleeper_user_id,
        resolved_sport,
        resolved_season,
    )
    connected: list[League] = []

    for sleeper_league in sleeper_leagues:
        sleeper_league_id = str(sleeper_league["league_id"])
        league = (
            db.query(League)
            .filter(
                League.commissioner_id == current_user.id,
                League.sleeper_league_id == sleeper_league_id,
            )
            .first()
        )
        roster_id = _find_roster_id(sleeper_league_id, sleeper_user_id)

        if league is None:
            league = League(
                name=sleeper_league["name"],
                sport=sleeper_league["sport"],
                season=int(sleeper_league["season"]),
                commissioner_id=current_user.id,
                sleeper_league_id=sleeper_league_id,
            )
            db.add(league)
        else:
            league.name = sleeper_league["name"]
            league.sport = sleeper_league["sport"]
            league.season = int(sleeper_league["season"])

        league.sleeper_user_id = sleeper_user_id
        league.sleeper_username = sleeper_username
        league.sleeper_roster_id = roster_id
        connected.append(league)

    db.commit()

    for league in connected:
        db.refresh(league)

    return connected
