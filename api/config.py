from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")

API_HOST = os.getenv("API_HOST", "127.0.0.1")
API_PORT = int(os.getenv("API_PORT", "8003"))
API_RELOAD = os.getenv("API_RELOAD", "false").lower() in ("1", "true", "yes")
API_WORKERS = int(os.getenv("API_WORKERS", "1"))
LOG_LEVEL = os.getenv("LOG_LEVEL", "info")


def get_cors_origins() -> list[str]:
    raw = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3003,http://127.0.0.1:3003",
    )
    return [origin.strip() for origin in raw.split(",") if origin.strip()]
