from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.models.league import League
from app.db.models.user import User
from app.schemas.league import LeagueCreate
from app.services.sleeper.leagues import get_sleeper_league
from app.services.sleeper.rosters import get_league_rosters
from app.services.sleeper.state import get_nfl_state
from app.services.sleeper.users import (
    get_league_users,
    get_sleeper_user,
    get_sleeper_user_leagues,
)


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
    league = (
        db.query(League)
        .filter(League.sleeper_league_id == league_id)
        .first()
    )

    if league is None:
        league = League(
            name=sleeper_data["name"],
            sport=sleeper_data["sport"],
            season=sleeper_data["season"],
            commissioner_id=current_user.id,
            sleeper_league_id=league_id,
        )
        db.add(league)
    else:
        league.name = sleeper_data["name"]
        league.sport = sleeper_data["sport"]
        league.season = sleeper_data["season"]
        league.commissioner_id = current_user.id

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="That Sleeper league is already connected.",
        ) from exc

    db.refresh(league)

    return league


def _find_roster_id(league_id: str, sleeper_user_id: str) -> int | None:
    try:
        rosters = get_league_rosters(league_id)
    except HTTPException:
        return None

    for roster in rosters:
        if str(roster.get("owner_id")) == str(sleeper_user_id):
            roster_id = roster.get("roster_id")
            return int(roster_id) if roster_id is not None else None

    return None


def _roster_metadata_text(roster: dict) -> str:
    metadata = roster.get("metadata") or {}
    values = []

    if isinstance(metadata, dict):
        values.extend(str(value) for value in metadata.values() if value)

    values.extend(
        str(roster.get(field))
        for field in ["team_name", "display_name", "name"]
        if roster.get(field)
    )

    return " ".join(values).lower()


def _sleeper_user_text(member: dict | None) -> str:
    if member is None:
        return ""

    metadata = member.get("metadata") or {}
    values = [
        str(member.get(field))
        for field in ["username", "display_name", "user_id"]
        if member.get(field)
    ]

    if isinstance(metadata, dict):
        values.extend(str(value) for value in metadata.values() if value)

    return " ".join(values).lower()


def connect_sleeper_account(
    db: Session,
    username: str,
    current_user: User,
    season: int | None = None,
    sport: str = "nfl",
) -> list[League]:
    cleaned_username = username.strip()

    if not cleaned_username:
        raise HTTPException(
            status_code=400,
            detail="Enter a Sleeper username.",
        )

    sleeper_user = get_sleeper_user(cleaned_username)

    if not sleeper_user or "user_id" not in sleeper_user:
        raise HTTPException(
            status_code=404,
            detail=f'No Sleeper account found for "{cleaned_username}".',
        )

    sleeper_user_id = str(sleeper_user["user_id"])
    sleeper_username = (
        sleeper_user.get("username")
        or sleeper_user.get("display_name")
        or cleaned_username
    )
    resolved_sport = sport.lower().strip() or "nfl"
    resolved_season = season

    if resolved_season is None and resolved_sport == "nfl":
        nfl_state = get_nfl_state()
        resolved_season = int(nfl_state.get("season") or 2025)

    if resolved_season is None:
        resolved_season = 2025

    seasons = [resolved_season]

    if season is None:
        seasons.extend(
            candidate
            for candidate in [resolved_season - 1, resolved_season - 2]
            if candidate >= 2020
        )

    sleeper_leagues_by_id: dict[str, dict] = {}

    for league_season in seasons:
        try:
            season_leagues = get_sleeper_user_leagues(
                sleeper_user_id,
                resolved_sport,
                league_season,
            )
        except HTTPException:
            season_leagues = []

        for sleeper_league in season_leagues:
            sleeper_leagues_by_id[str(sleeper_league["league_id"])] = sleeper_league

    sleeper_leagues = list(sleeper_leagues_by_id.values())

    if not sleeper_leagues:
        raise HTTPException(
            status_code=404,
            detail=(
                f"No {resolved_sport.upper()} leagues found for "
                f"{sleeper_username} in {', '.join(str(item) for item in seasons)}."
            ),
        )

    connected: list[League] = []

    for sleeper_league in sorted(
        sleeper_leagues,
        key=lambda item: (int(item.get("season", 0)), item.get("name", "")),
        reverse=True,
    ):
        sleeper_league_id = str(sleeper_league["league_id"])
        league = (
            db.query(League)
            .filter(League.sleeper_league_id == sleeper_league_id)
            .first()
        )
        roster_id = _find_roster_id(sleeper_league_id, sleeper_user_id)
        previous_roster_id = league.sleeper_roster_id if league else None

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
            league.commissioner_id = current_user.id

        league.sleeper_user_id = sleeper_user_id
        league.sleeper_username = sleeper_username
        league.sleeper_roster_id = roster_id
        if not roster_id or previous_roster_id != roster_id:
            league.sleeper_team_verified = 0
        connected.append(league)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail=(
                "One of those Sleeper leagues is already connected in a way "
                "the current database cannot reuse."
            ),
        ) from exc

    for league in connected:
        db.refresh(league)

    return connected


def verify_sleeper_team_code(
    db: Session,
    league_id: int,
    current_user: User,
    code: str,
) -> League:
    cleaned_code = code.strip().lower()

    if len(cleaned_code) < 4:
        raise HTTPException(
            status_code=400,
            detail="Use the generated verification code.",
        )

    league = (
        db.query(League)
        .filter(
            League.id == league_id,
            League.commissioner_id == current_user.id,
        )
        .first()
    )

    if league is None:
        raise HTTPException(status_code=404, detail="League not found.")

    if league.sleeper_league_id is None or league.sleeper_roster_id is None:
        raise HTTPException(
            status_code=400,
            detail="Connect your Sleeper account before verifying your team.",
        )

    rosters = get_league_rosters(league.sleeper_league_id, use_cache=False)
    matched_roster = next(
        (
            roster
            for roster in rosters
            if roster.get("roster_id") == league.sleeper_roster_id
        ),
        None,
    )

    if matched_roster is None:
        raise HTTPException(
            status_code=404,
            detail="Could not find the matched Sleeper roster.",
        )

    if str(matched_roster.get("owner_id")) == str(league.sleeper_user_id):
        league.sleeper_team_verified = 1
        db.commit()
        db.refresh(league)

        return league

    members = get_league_users(league.sleeper_league_id, use_cache=False)
    matched_member = next(
        (
            member
            for member in members
            if str(member.get("user_id")) == str(league.sleeper_user_id)
        ),
        None,
    )
    verification_text = " ".join(
        [
            _roster_metadata_text(matched_roster),
            _sleeper_user_text(matched_member),
            str(league.sleeper_username or "").lower(),
        ]
    )

    if cleaned_code not in verification_text:
        raise HTTPException(
            status_code=400,
            detail=(
                "Could not verify ownership from Sleeper, and the backup code "
                "was not found in the Sleeper team or profile fields."
            ),
        )

    league.sleeper_team_verified = 1
    db.commit()
    db.refresh(league)

    return league
