
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/ai", tags=["AI Assistant"])


class ClimateQuestion(BaseModel):
    question: str = Field(min_length=3, max_length=2000)
    country_code: str | None = None


@router.post("/ask")
def ask_climate_assistant(request: ClimateQuestion):
    raise HTTPException(
        status_code=501,
        detail=(
            "The AI policy assistant is not configured yet. "
            "Document retrieval and source verification "
            "will be added in a later development phase."
        ),
    )
