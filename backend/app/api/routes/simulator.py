
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/simulator", tags=["Simulator"])


class SimulationRequest(BaseModel):
    country_code: str
    annual_electricity_kwh: float = Field(gt=0)
    electricity_price_per_kwh: float = Field(ge=0)
    reduction_percentage: float = Field(ge=0, le=100)


@router.post("")
def run_simulation(request: SimulationRequest):
    raise HTTPException(
        status_code=501,
        detail=(
            "Climate simulation is not implemented yet. "
            "Verified emission factors are required."
        ),
    )
