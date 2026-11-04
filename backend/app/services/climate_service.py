
from app.models.climate import ClimateRecord, CountryClimate


# Synthetic demonstration data only.
# These values are NOT verified climate statistics.

COUNTRIES = [
    CountryClimate(
        code="POL",
        name="Poland",
        emissions=310,
        emissions_per_capita=8.2,
        renewable_share=23,
        temperature_change=1.6,
        history=[
            ClimateRecord(year=2019, emissions=330),
            ClimateRecord(year=2020, emissions=305),
            ClimateRecord(year=2021, emissions=325),
            ClimateRecord(year=2022, emissions=320),
            ClimateRecord(year=2023, emissions=305),
            ClimateRecord(year=2024, emissions=310),
        ],
    ),
    CountryClimate(
        code="DEU",
        name="Germany",
        emissions=590,
        emissions_per_capita=7.1,
        renewable_share=54,
        temperature_change=1.8,
        history=[
            ClimateRecord(year=2019, emissions=680),
            ClimateRecord(year=2020, emissions=620),
            ClimateRecord(year=2021, emissions=650),
            ClimateRecord(year=2022, emissions=640),
            ClimateRecord(year=2023, emissions=610),
            ClimateRecord(year=2024, emissions=590),
        ],
    ),
    CountryClimate(
        code="PAK",
        name="Pakistan",
        emissions=200,
        emissions_per_capita=0.9,
        renewable_share=12,
        temperature_change=1.3,
        history=[
            ClimateRecord(year=2019, emissions=175),
            ClimateRecord(year=2020, emissions=170),
            ClimateRecord(year=2021, emissions=185),
            ClimateRecord(year=2022, emissions=195),
            ClimateRecord(year=2023, emissions=198),
            ClimateRecord(year=2024, emissions=200),
        ],
    ),
]


def get_all_countries() -> list[CountryClimate]:
    return COUNTRIES


def get_country_by_code(code: str) -> CountryClimate | None:
    return next(
        (
            country
            for country in COUNTRIES
            if country.code == code.upper()
        ),
        None,
    )
