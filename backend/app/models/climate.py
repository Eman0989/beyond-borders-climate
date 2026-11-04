
from pydantic import BaseModel, Field


class ClimateRecord(BaseModel):
    year: int
    emissions: float = Field(ge=0)


class CountryClimate(BaseModel):
    code: str
    name: str
    emissions: float = Field(ge=0)
    emissions_per_capita: float = Field(ge=0)
    renewable_share: float = Field(ge=0, le=100)
    temperature_change: float
    history: list[ClimateRecord]
    data_status: str = "synthetic_demo"
    emissions_unit: str = "Mt CO2"
    data_source: str = "Illustrative development data"
