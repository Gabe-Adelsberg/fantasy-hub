from fastapi import FastAPI
from app.core.config import settings
from app.db.database import Base, engine
from app.db.models.user import User
from app.db import models
from app.db.models.league import League
from app.api.v1 import users, leagues, dashboard

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.app_name,
    version="0.1.0"
)
app.include_router(users.router)
app.include_router(leagues.router)
app.include_router(dashboard.router)
@app.get("/")
def root():
    return {"message": "Fantasy Hub backend is running"}