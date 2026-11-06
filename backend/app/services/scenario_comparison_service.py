
from app.models.scenario_comparison import (
    ScenarioComparisonRequest,
    ScenarioComparisonResponse,
    ScenarioResult,
)

from app.models.simulator import SimulationRequest

from app.services.simulator_service import (
    calculate_emissions,
)


SCENARIOS = [
    ("Conservative", 10),
    ("Moderate", 20),
    ("Ambitious", 40),
]


def compare_scenarios(
    request: ScenarioComparisonRequest,
) -> ScenarioComparisonResponse:

    results = []

    for name, percentage in SCENARIOS:

        simulation_request = SimulationRequest(
            country_code=request.country_code,
            annual_electricity_kwh=(
                request.annual_electricity_kwh
            ),
            electricity_price_per_kwh=(
                request.electricity_price_per_kwh
            ),
            reduction_percentage=percentage,
            currency=request.currency,
            emission_factor_kg_co2e_per_kwh=(
                request.emission_factor_kg_co2e_per_kwh
            ),
        )

        calculation = calculate_emissions(
            simulation_request
        )

        remaining_electricity = (
            request.annual_electricity_kwh
            * (1 - percentage / 100)
        )

        results.append(
            ScenarioResult(
                name=name,
                reduction_percentage=percentage,
                remaining_electricity_kwh=round(
                    remaining_electricity, 2
                ),
                calculation=calculation,
            )
        )

    return ScenarioComparisonResponse(
        country_code=request.country_code,
        currency=request.currency,
        scenarios=results,
        methodology=(
            "Compare three fixed electricity demand "
            "reduction strategies: 10%, 20%, and 40%. "
            "Each uses the existing SME simulator "
            "calculation engine, with the same "
            "electricity price and emissions factor. "
            "Implementation costs and changes in "
            "electricity tariffs are excluded."
        ),
    )
