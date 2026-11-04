
from pydantic import BaseModel, Field


class ClimateRecord(BaseModel):
    year: int
    emissions: float = Field(ge=0)
    emissions_per_capita: float | None = Field(
        default=None, ge=0
    )


class CountryClimate(BaseModel):
    code: str
    name: str
    year: int

    emissions: float = Field(ge=0)
    emissions_per_capita: float | None = Field(
        default=None, ge=0
    )

    # Not available in our processed OWID dataset.
    renewable_share: float | None = None
    temperature_change: float | None = None

    history: list[ClimateRecord]

    data_status: str = "observed"
    emissions_unit: str = "Mt CO2"
    per_capita_unit: str = "t CO2/person"

    data_source: str
    source_url: str
