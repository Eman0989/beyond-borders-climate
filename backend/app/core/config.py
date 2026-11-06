
import os

from dotenv import load_dotenv

load_dotenv()


# Frontend URLs allowed to communicate with FastAPI
DEFAULT_FRONTEND_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
]

FRONTEND_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        ",".join(DEFAULT_FRONTEND_ORIGINS),
    ).split(",")
    if origin.strip()
]
