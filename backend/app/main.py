from fastapi import FastAPI
from app.api import users
from app.core.config import settings
from app.db.database import Base, engine
from app.db.models.user import User
from app.db import models

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.app_name,
    version="0.1.0"
)
app.include_router(users.router)

@app.get("/")
def root():
    return {"message": "Fantasy Hub backend is running"}