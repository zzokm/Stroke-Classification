"""Run the API with: python __main__.py (from api/) or npm run dev:api (from root)."""

from __future__ import annotations

import os
import sys
from pathlib import Path

import uvicorn

API_DIR = Path(__file__).resolve().parent
os.chdir(API_DIR)
if str(API_DIR) not in sys.path:
    sys.path.insert(0, str(API_DIR))

from config import API_HOST, API_PORT, API_RELOAD, API_WORKERS, LOG_LEVEL  # noqa: E402


def main() -> None:
    uvicorn.run(
        "main:app",
        host=API_HOST,
        port=API_PORT,
        reload=API_RELOAD,
        workers=1 if API_RELOAD else API_WORKERS,
        log_level=LOG_LEVEL,
    )


if __name__ == "__main__":
    main()
