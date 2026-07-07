from copy import deepcopy
from threading import Lock
from time import monotonic
from typing import Any

import requests
from fastapi import HTTPException

SLEEPER_BASE_URL = "https://api.sleeper.app/v1"
SLEEPER_CACHE_SECONDS = 60
_cache: dict[str, tuple[float, Any]] = {}
_cache_lock = Lock()


def sleeper_get(path: str) -> Any:
    now = monotonic()

    with _cache_lock:
        cached = _cache.get(path)

        if cached and cached[0] > now:
            return deepcopy(cached[1])

    url = f"{SLEEPER_BASE_URL}{path}"

    try:
        response = requests.get(url, timeout=10)
    except requests.RequestException as exc:
        raise HTTPException(
            status_code=502,
            detail="Sleeper API is unavailable."
        ) from exc

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

    payload = response.json()

    with _cache_lock:
        _cache[path] = (now + SLEEPER_CACHE_SECONDS, payload)

    return deepcopy(payload)
