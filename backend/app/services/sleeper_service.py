import requests
from fastapi import HTTPException

SLEEPER_BASE_URL = "https://api.sleeper.app/v1"


def get_sleeper_league(league_id: str) -> dict:
    url = f"{SLEEPER_BASE_URL}/league/{league_id}"

    response = requests.get(url, timeout=10)

    if response.status_code == 404:
        raise HTTPException(
            status_code=404,
            detail="Sleeper league not found."
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail="Sleeper API error."
        )

    return response.json()