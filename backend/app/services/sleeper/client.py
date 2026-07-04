import requests
from fastapi import HTTPException

SLEEPER_BASE_URL = "https://api.sleeper.app/v1"


def sleeper_get(path: str) -> dict:
    url = f"{SLEEPER_BASE_URL}{path}"

    response = requests.get(url, timeout=10)

    if response.status_code == 404:
        raise HTTPException(
            status_code=404,
            detail="Sleeper resource not found."
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail="Sleeper API error."
        )

    return response.json()