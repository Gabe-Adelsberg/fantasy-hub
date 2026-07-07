from fastapi import FastAPI
from app.core.config import settings
from app.db.database import Base, engine
from app.db.models.user import User
from app.db import models
from app.db.models.league import League
from app.api.v1 import users, leagues, dashboard
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

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