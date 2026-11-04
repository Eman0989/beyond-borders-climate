
import json
import math
from pathlib import Path

from app.services.climate_service import (
    get_all_countries,
    get_country_by_code,
)

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_FILE = BASE_DIR / "app/data/processed/climate_data.json"

def main():
    assert DATA_FILE.exists(), "Processed climate JSON is missing"

    payload = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    countries = get_all_countries()

    assert len(countries) == 215
    assert len(payload["countries"]) == len(countries)

    codes = [country.code for country in countries]
    assert len(codes) == len(set(codes)), "Duplicate country codes"

    for country in countries:
        assert country.history, f"No history for {country.code}"

        years = [record.year for record in country.history]
        assert years == sorted(years)
        assert len(years) == len(set(years))

        assert country.year == years[-1]

        for record in country.history:
            assert math.isfinite(record.emissions)
            assert record.emissions >= 0

            if record.emissions_per_capita is not None:
                assert math.isfinite(record.emissions_per_capita)
                assert record.emissions_per_capita >= 0

        assert country.data_source == "Our World in Data"
        assert country.source_url.startswith("https://")

    expected = {
        "POL": 272.86181640625,
        "DEU": 572.32,
        "PAK": 179.8,
    }

    for code, emissions in expected.items():
        country = get_country_by_code(code)
        assert country is not None
        assert country.year == 2024
        assert math.isclose(
            country.emissions,
            emissions,
            abs_tol=0.02,
        ), f"Unexpected emissions for {code}"

        print(
            f"PASS {country.name}: "
            f"{country.emissions:.2f} Mt CO2 ({country.year})"
        )

    print(f"\nPASS: {len(countries)} country profiles validated")


if __name__ == "__main__":
    main()
