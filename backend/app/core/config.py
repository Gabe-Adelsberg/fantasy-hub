from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Fantasy Hub API"
    database_url: str = "sqlite:///./fantasy_hub.db"

    class Config:
        env_file = ".env"


settings = Settings()