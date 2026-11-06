
from dataclasses import asdict

from fastapi import APIRouter

from app.models.simulator import (
    SimulationRequest,
    SimulationResponse,
)

from app.models.scenario_comparison import (
    ScenarioComparisonRequest,
    ScenarioComparisonResponse,
)

from app.services.simulator_service import (
    calculate_emissions,
)

from app.services.scenario_comparison_service import (
    compare_scenarios,
)

from app.services.emission_factors import FACTORS


router = APIRouter(
    prefix="/simulator",
    tags=["Simulator"],
)


# ========================================
# DOCUMENTED COUNTRY FACTORS
# ========================================

@router.get("/factors")
def list_emission_factors():
    return {
        "count": len(FACTORS),
        "factors": [
            asdict(factor)
            for factor in sorted(
                FACTORS.values(),
                key=lambda item: item.country_code,
            )
        ],
    }


@router.get("/factors/{country_code}")
def get_country_factor(country_code: str):
    code = country_code.strip().upper()

    factor = FACTORS.get(code)

    if factor is None:
        return {
            "country_code": code,
            "available": False,
            "factor": None,
        }

    return {
        "country_code": code,
        "available": True,
        "factor": asdict(factor),
    }


# ========================================
# ADVANCED SCENARIO COMPARISON
# ========================================

@router.post(
    "/compare",
    response_model=ScenarioComparisonResponse,
)
def run_scenario_comparison(
    request: ScenarioComparisonRequest,
) -> ScenarioComparisonResponse:
    return compare_scenarios(request)


# ========================================
# ORIGINAL SME SIMULATOR
# ========================================

@router.post(
    "",
    response_model=SimulationResponse,
)
def run_simulation(
    request: SimulationRequest,
) -> SimulationResponse:
    return calculate_emissions(request)
