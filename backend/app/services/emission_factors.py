
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


FACTORS: dict[str, EmissionFactor] = {

    # POLAND
    # KOBiZE: 553 kg CO2/MWh, 2024
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
        gas_basis=(
            "Direct CO2, end-user electricity; "
            "KOBiZE national-average indicator"
        ),
    ),

    # GERMANY
    # UBA: 353 g CO2/kWh, 2024 (revised 2026)
    "DEU": EmissionFactor(
        country_code="DEU",
        value=0.353,
        year=2024,
        source="Umweltbundesamt (UBA)",
        source_url=(
            "https://www.umweltbundesamt.de/themen/"
            "klima-energie/energieversorgung/"
            "strom-waermeversorgung-in-zahlen"
        ),
        unit="kg CO2/kWh",
        gas_basis=(
            "Direct CO2 per kWh of electricity consumed "
            "in Germany; UBA 2026 revision"
        ),
    ),
}


def get_emission_factor(
    country_code: str,
) -> EmissionFactor | None:
    return FACTORS.get(country_code.strip().upper())
