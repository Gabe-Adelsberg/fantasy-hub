from fastapi import FastAPI
from app.core.config import settings
from app.db.database import Base, engine
from app.db.models.user import User
from app.db import models
from app.db.models.league import League
from app.api.v1 import users, leagues, dashboard
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

Base.metadata.create_all(bind=engine)


def ensure_lightweight_schema_updates():
    inspector = inspect(engine)
    league_columns = {
        column["name"]
        for column in inspector.get_columns("leagues")
    }
    additions = {
        "sleeper_user_id": "VARCHAR",
        "sleeper_username": "VARCHAR",
        "sleeper_roster_id": "INTEGER",
    }

    with engine.begin() as connection:
        for column_name, column_type in additions.items():
            if column_name not in league_columns:
                connection.execute(
                    text(f"ALTER TABLE leagues ADD COLUMN {column_name} {column_type}")
                )


ensure_lightweight_schema_updates()

app = FastAPI(
    title=settings.app_name,
    version="0.1.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(users.router)
app.include_router(leagues.router)
app.include_router(dashboard.router)
@app.get("/")
def root():
    return {"message": "Fantasy Hub backend is running"}
