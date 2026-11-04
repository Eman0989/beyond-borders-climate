
from pathlib import Path
from datetime import datetime, timezone
import json
import re

import pandas as pd


# =====================================
# FILE PATHS
# =====================================

BASE_DIR = Path(__file__).resolve().parents[1]

RAW_FILE = BASE_DIR / "app/data/raw/owid-co2-data.csv"

OUTPUT_FILE = (
    BASE_DIR / "app/data/processed/climate_data.json"
)

SOURCE_URL = (
    "https://owid-public.owid.io/data/co2/"
    "owid-co2-data.csv"
)

# Historical chart begins in 1990.
START_YEAR = 1990

REQUIRED_COLUMNS = [
    "country",
    "iso_code",
    "year",
    "co2",
    "co2_per_capita",
]


# =====================================
# HELPERS
# =====================================

def optional_number(value):
    """Convert missing numeric values to JSON null."""
    if pd.isna(value):
        return None

    return float(value)


def is_country_code(code):
    """Keep standard three-letter ISO country codes."""
    if pd.isna(code):
        return False

    code = str(code)

    return bool(
        re.fullmatch(r"[A-Z]{3}", code)
        and not code.startswith("OWID")
    )


# =====================================
# LOAD DATA
# =====================================

def load_data():
    if not RAW_FILE.exists():
        raise FileNotFoundError(
            f"Dataset not found: {RAW_FILE}\n"
            "Download the OWID CSV before running."
        )

    df = pd.read_csv(
        RAW_FILE,
        usecols=REQUIRED_COLUMNS,
        low_memory=False,
    )

    print("Raw records:", len(df))

    return df


# =====================================
# CLEAN DATA
# =====================================

def clean_data(df):
    df = df.copy()

    missing_columns = [
        col for col in REQUIRED_COLUMNS
        if col not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing columns: {missing_columns}"
        )

    # Keep countries rather than OWID aggregates.
    df = df[
        df["iso_code"].apply(is_country_code)
    ].copy()

    # Ensure numeric types.
    for column in [
        "year",
        "co2",
        "co2_per_capita",
    ]:
        df[column] = pd.to_numeric(
            df[column],
            errors="coerce",
        )

    # Keep valid historical years.
    df = df[
        df["year"].notna()
        & (df["year"] >= START_YEAR)
        & (df["year"] <= datetime.now().year)
    ].copy()

    df["year"] = df["year"].astype(int)

    # Reject invalid negative values.
    df.loc[
        df["co2"] < 0, "co2"
    ] = float("nan")

    df.loc[
        df["co2_per_capita"] < 0,
        "co2_per_capita"
    ] = float("nan")

    # Country-year must be unique.
    duplicates = df.duplicated(
        subset=["iso_code", "year"]
    )

    if duplicates.any():
        raise ValueError(
            f"Found {duplicates.sum()} duplicate "
            "country-year records."
        )

    df = df.sort_values(
        ["iso_code", "year"]
    ).reset_index(drop=True)

    print("Cleaned records:", len(df))
    print("Countries:", df["iso_code"].nunique())
    print("Year range:", df["year"].min(), "-", df["year"].max())

    return df


# =====================================
# BUILD COUNTRY PROFILES
# =====================================

def build_profiles(df):
    profiles = []

    for code, group in df.groupby("iso_code"):
        group = group.sort_values("year")

        # Only years with actual CO2 data.
        valid = group.dropna(subset=["co2"])

        if valid.empty:
            continue

        latest = valid.iloc[-1]

        history = [
            {
                "year": int(row.year),
                "emissions": float(row.co2),
                "emissions_per_capita": optional_number(
                    row.co2_per_capita
                ),
            }
            for row in valid.itertuples()
        ]

        profiles.append({
            "code": code,
            "name": str(latest["country"]),
            "year": int(latest["year"]),
            "emissions": float(latest["co2"]),
            "emissions_per_capita": optional_number(
                latest["co2_per_capita"]
            ),
            "history": history,
            "data_status": "observed",
            "emissions_unit": "Mt CO2",
            "per_capita_unit": "t CO2/person",
            "data_source": "Our World in Data",
            "source_url": SOURCE_URL,
        })

    return sorted(
        profiles,
        key=lambda item: item["name"]
    )


# =====================================
# EXPORT
# =====================================

def export_data(profiles):
    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    result = {
        "metadata": {
            "source": "Our World in Data",
            "source_url": SOURCE_URL,
            "processed_at": datetime.now(
                timezone.utc
            ).isoformat(),
            "metric": (
                "Territorial fossil-fuel and "
                "industrial CO2 emissions"
            ),
            "country_count": len(profiles),
            "start_year": START_YEAR,
            "notes": (
                "CO2 excludes land-use change. "
                "Missing observations are not "
                "interpolated. Latest year may "
                "differ between countries."
            ),
        },
        "countries": profiles,
    }

    with open(
        OUTPUT_FILE,
        "w",
        encoding="utf-8"
    ) as file:
        json.dump(
            result,
            file,
            indent=2,
            ensure_ascii=False,
            allow_nan=False,
        )

    print("\nExport successful!")
    print("Output:", OUTPUT_FILE)
    print("Countries exported:", len(profiles))


# =====================================
# MAIN
# =====================================

def main():
    df = load_data()
    cleaned = clean_data(df)
    profiles = build_profiles(cleaned)
    export_data(profiles)

    print("\nSample countries:")

    for code in ["POL", "DEU", "PAK"]:
        country = next(
            (item for item in profiles
             if item["code"] == code),
            None,
        )

        if country:
            print(
                country["name"],
                country["year"],
                round(country["emissions"], 2),
                "Mt CO2",
            )


if __name__ == "__main__":
    main()
