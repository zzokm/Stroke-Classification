#!/usr/bin/env python3
"""Verify the stroke screening API is reachable."""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request

API_BASE = os.getenv("API_HEALTH_URL", "http://127.0.0.1:8003").rstrip("/")
TIMEOUT = float(os.getenv("API_HEALTH_TIMEOUT", "5"))


def main() -> int:
    url = f"{API_BASE}/health"
    try:
        with urllib.request.urlopen(url, timeout=TIMEOUT) as response:
            body = json.loads(response.read().decode())
    except urllib.error.URLError as exc:
        print(f"API health check failed: {exc}", file=sys.stderr)
        return 1

    if body.get("status") != "ok":
        print(f"Unexpected health response: {body}", file=sys.stderr)
        return 1

    print(f"API OK — model: {body.get('model', 'unknown')} ({url})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
