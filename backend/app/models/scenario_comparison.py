
from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app.models.simulator import SimulationResponse


class ScenarioComparisonRequest(BaseModel):
    country_code: str = Field(
        min_length=3,
        max_length=3,
    )

    annual_electricity_kwh: float = Field(
        ge=0,
        le=1_000_000_000,
    )

    electricity_price_per_kwh: float = Field(
        ge=0,
    )

    currency: Literal["PLN", "EUR", "USD"] = "PLN"

    emission_factor_kg_co2e_per_kwh: float | None = Field(
        default=None,
        ge=0,
        le=5,
    )

    @field_validator("country_code")
    @classmethod
    def normalize_country(cls, value: str) -> str:
        return value.strip().upper()


class ScenarioResult(BaseModel):
    name: str
    reduction_percentage: float
    remaining_electricity_kwh: float

    calculation: SimulationResponse


class ScenarioComparisonResponse(BaseModel):
    country_code: str
    currency: Literal["PLN", "EUR", "USD"]

    scenarios: list[ScenarioResult]

    methodology: str
