
from typing import Literal

from pydantic import BaseModel, Field, field_validator


# ==========================================
# SIMULATION REQUEST
# ==========================================

class SimulationRequest(BaseModel):

    country_code: str = Field(
        min_length=3,
        max_length=3,
        description="Three-letter ISO country code",
    )

    annual_electricity_kwh: float = Field(
        ge=0,
        le=1_000_000_000,
        description="Annual electricity consumption in kWh",
    )

    electricity_price_per_kwh: float = Field(
        ge=0,
        description="Electricity price per kWh",
    )

    reduction_percentage: float = Field(
        ge=0,
        le=100,
        description="Percentage reduction in electricity demand",
    )

    # Optional: use a verified country default if available
    emission_factor_kg_co2e_per_kwh: float | None = Field(
        default=None,
        ge=0,
        le=5,
        description=(
            "Optional electricity emissions factor in "
            "kg per kWh. If omitted, a documented "
            "country-specific factor is used where "
            "available."
        ),
    )

    currency: Literal["PLN", "EUR", "USD"] = "PLN"

    @field_validator("country_code")
    @classmethod
    def normalize_country_code(cls, value: str) -> str:
        return value.strip().upper()


# ==========================================
# SIMULATION RESPONSE
# ==========================================

class SimulationResponse(BaseModel):

    # Country and consumption information
    country_code: str
    annual_electricity_kwh: float
    reduction_percentage: float
    currency: Literal["PLN", "EUR", "USD"]

    # Emissions factor details
    emission_factor_kg_co2e_per_kwh: float

    factor_source: str
    factor_year: int | None = None
    factor_unit: str
    factor_gas_basis: str
    factor_source_url: str | None = None

    # Emissions calculations
    baseline_emissions_tonnes: float
    scenario_emissions_tonnes: float
    avoided_emissions_tonnes: float

    # Electricity cost calculations
    baseline_electricity_cost: float
    scenario_electricity_cost: float
    annual_cost_savings: float

    # Transparency and methodology
    methodology: str
    limitations: list[str]
