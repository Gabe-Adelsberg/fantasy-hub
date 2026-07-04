from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.user import UserCreate, UserResponse
from app.services.user_service import create_user

from app.schemas.user import UserCreate, UserResponse, UserLogin, Token
from app.services.auth_service import login_user

from app.core.dependencies import get_current_user
from app.db.models.user import User

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("/")
def test():
    return {"message": "Users route works!"}


@router.post("/register", response_model=UserResponse)
def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    return create_user(db, user_data)

@router.post("/login", response_model=Token)
def login(
    login_data: UserLogin,
    db: Session = Depends(get_db)
):
    return login_user(
        db,
        login_data.email,
        login_data.password
    )

@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user)
):
    return current_user