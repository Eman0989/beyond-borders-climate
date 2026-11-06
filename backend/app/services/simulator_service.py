
from fastapi import HTTPException

from app.models.simulator import (
    SimulationRequest,
    SimulationResponse,
)

from app.services.emission_factors import (
    get_emission_factor,
)


def calculate_emissions(
    request: SimulationRequest,
) -> SimulationResponse:

    # =====================================
    # 1. COUNTRY AND EMISSIONS FACTOR
    # =====================================

    country_code = request.country_code.upper()

    official_factor = get_emission_factor(
        country_code
    )

    custom_factor = (
        request.emission_factor_kg_co2e_per_kwh
    )

    if custom_factor is not None:
        factor = custom_factor

        factor_source = "User-provided assumption"
        factor_year = None
        factor_unit = "kg/kWh (user-declared)"
        factor_gas_basis = "User-supplied; not verified"
        factor_source_url = None

    elif official_factor is not None:
        factor = official_factor.value

        factor_source = official_factor.source
        factor_year = official_factor.year
        factor_unit = official_factor.unit
        factor_gas_basis = official_factor.gas_basis
        factor_source_url = official_factor.source_url

    else:
        raise HTTPException(
            status_code=422,
            detail=(
                f"No verified electricity emissions "
                f"factor is available for {country_code}. "
                "Please provide "
                "emission_factor_kg_co2e_per_kwh."
            ),
        )

    # =====================================
    # 2. INPUTS
    # =====================================

    electricity = request.annual_electricity_kwh

    reduction = (
        request.reduction_percentage / 100
    )

    electricity_price = (
        request.electricity_price_per_kwh
    )

    # =====================================
    # 3. BASELINE EMISSIONS
    # =====================================

    baseline_emissions = (
        electricity * factor / 1000
    )

    # =====================================
    # 4. REDUCTION SCENARIO
    # =====================================

    scenario_electricity = (
        electricity * (1 - reduction)
    )

    scenario_emissions = (
        scenario_electricity * factor / 1000
    )

    avoided_emissions = (
        baseline_emissions - scenario_emissions
    )

    # =====================================
    # 5. FINANCIAL CALCULATIONS
    # =====================================

    baseline_cost = (
        electricity * electricity_price
    )

    scenario_cost = (
        scenario_electricity * electricity_price
    )

    savings = baseline_cost - scenario_cost

    # =====================================
    # 6. METHODOLOGY
    # =====================================

    methodology = (
        "Annual electricity consumption (kWh) "
        "is multiplied by the selected electricity "
        "emissions factor (kg/kWh), then divided "
        "by 1000 to express emissions in tonnes. "
        "The scenario reduces electricity demand "
        "while holding the emissions factor "
        "and electricity price constant."
    )

    limitations = [
        "This model covers purchased electricity only.",
        "Results are estimates, not certified "
        "corporate greenhouse gas inventories.",
        "The scenario uses the same emissions "
        "factor as the baseline.",
        "Electricity price remains constant.",
        "Fixed charges and implementation "
        "costs are excluded.",
        "The factor's gas basis must be checked "
        "before interpreting results as CO2e.",
    ]

    if custom_factor is not None:
        limitations.append(
            "The emissions factor was supplied by "
            "the user and has not been independently "
            "verified."
        )
    else:
        limitations.append(
            "The country default uses a historical "
            "national electricity factor. Actual "
            "supply-specific emissions may differ."
        )

    # =====================================
    # 7. RESPONSE
    # =====================================

    return SimulationResponse(
        country_code=country_code,

        annual_electricity_kwh=electricity,
        reduction_percentage=(
            request.reduction_percentage
        ),

        emission_factor_kg_co2e_per_kwh=factor,

        factor_source=factor_source,
        factor_year=factor_year,
        factor_unit=factor_unit,
        factor_gas_basis=factor_gas_basis,
        factor_source_url=factor_source_url,

        currency=request.currency,

        baseline_emissions_tonnes=round(
            baseline_emissions, 4
        ),
        scenario_emissions_tonnes=round(
            scenario_emissions, 4
        ),
        avoided_emissions_tonnes=round(
            avoided_emissions, 4
        ),

        baseline_electricity_cost=round(
            baseline_cost, 2
        ),
        scenario_electricity_cost=round(
            scenario_cost, 2
        ),
        annual_cost_savings=round(
            savings, 2
        ),

        methodology=methodology,
        limitations=limitations,
    )
