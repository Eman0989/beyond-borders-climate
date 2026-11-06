
from dataclasses import dataclass


@dataclass(frozen=True)
class EmissionFactor:
    country_code: str
    value: float
    year: int
    source: str
    source_url: str
    unit: str
    gas_basis: str


FACTORS = {
    "POL": EmissionFactor(
        country_code="POL",
        value=0.553,
        year=2024,
        source="KOBiZE",
        source_url=(
            "https://www.kobize.pl/uploads/materialy/"
            "materialy_do_pobrania/aktualnosci/"
            "2025/142_Wskazniki_emisyjnosci_2025.pdf"
        ),
        unit="kg CO2/kWh",
        gas_basis="Direct CO2, end-user electricity",
    ),
}


def get_emission_factor(
    country_code: str,
) -> EmissionFactor | None:
    return FACTORS.get(country_code.strip().upper())
