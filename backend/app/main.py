
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import FRONTEND_ORIGINS

from app.api.routes import (
    health,
    climate,
    simulator,
    ai,
)

app = FastAPI(
    title="Beyond Borders Climate API",
    description=(
        "Backend API for climate intelligence, "
        "country data, business simulations, "
        "and AI-supported policy analysis."
    ),
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(health.router, prefix="/api")
app.include_router(climate.router, prefix="/api")
app.include_router(simulator.router, prefix="/api")
app.include_router(ai.router, prefix="/api")


@app.get("/")
def root():
    return {
        "message": "Welcome to Beyond Borders Climate API",
        "documentation": "/docs",
        "status": "development",
    }
