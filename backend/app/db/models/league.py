from sqlalchemy import Column, Integer, String, ForeignKey

from app.db.database import Base


class League(Base):
    __tablename__ = "leagues"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    sport = Column(String, nullable=False)
    season = Column(Integer, nullable=False)
    commissioner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    sleeper_league_id = Column(String, unique=True, nullable=True)
    sleeper_user_id = Column(String, nullable=True)
    sleeper_username = Column(String, nullable=True)
    sleeper_roster_id = Column(Integer, nullable=True)
