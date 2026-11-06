
from fastapi import APIRouter

from app.models.simulator import (
    SimulationRequest,
    SimulationResponse,
)

from app.services.simulator_service import (
    calculate_emissions,
)


router = APIRouter(
    prefix="/simulator",
    tags=["Simulator"],
)


@router.post(
    "",
    response_model=SimulationResponse,
)
def run_simulation(
    request: SimulationRequest,
) -> SimulationResponse:

    return calculate_emissions(request)
