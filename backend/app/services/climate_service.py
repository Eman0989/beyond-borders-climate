
import json
from functools import lru_cache
from pathlib import Path

from app.models.climate import CountryClimate


DATA_FILE = (
    Path(__file__).resolve().parents[1]
    / "data"
    / "processed"
    / "climate_data.json"
)


@lru_cache(maxsize=1)
def load_climate_data() -> tuple[CountryClimate, ...]:
    """
    Load processed OWID climate records once
    and cache the validated profiles.
    """

    if not DATA_FILE.exists():
        raise FileNotFoundError(
            f"Climate data file not found: {DATA_FILE}. "
            "Run python scripts/process_climate_data.py first."
        )

    with DATA_FILE.open("r", encoding="utf-8") as file:
        payload = json.load(file)

    records = payload.get("countries")

    if not isinstance(records, list):
        raise ValueError(
            "Invalid climate JSON: 'countries' must be a list."
        )

    countries = tuple(
        CountryClimate.model_validate(record)
        for record in records
    )

    codes = [country.code for country in countries]

    if len(codes) != len(set(codes)):
        raise ValueError(
            "Duplicate country codes detected."
        )

    return countries


def get_all_countries() -> list[CountryClimate]:
    return list(load_climate_data())


def get_country_by_code(
    code: str,
) -> CountryClimate | None:
    normalized_code = code.strip().upper()

    return next(
        (
            country
            for country in load_climate_data()
            if country.code == normalized_code
        ),
        None,
    )
