
from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parents[1]

DATA_PATH = (
    BASE_DIR / "app/data/raw/owid-co2-data.csv"
)

df = pd.read_csv(DATA_PATH, low_memory=False)

print("\n=== DATASET OVERVIEW ===")
print("Rows:", len(df))
print("Columns:", len(df.columns))

print("\n=== REPORTING PERIOD ===")
print("First year:", df["year"].min())
print("Last year:", df["year"].max())

print("\n=== KEY COLUMNS ===")
columns = [
    "country",
    "iso_code",
    "year",
    "co2",
    "co2_per_capita",
    "energy_per_capita",
]

for column in columns:
    print(
        column,
        "FOUND" if column in df.columns else "MISSING"
    )

print("\n=== SAMPLE: POLAND ===")
poland = df[df["iso_code"] == "POL"]

print(
    poland[
        [
            "country",
            "year",
            "co2",
            "co2_per_capita",
        ]
    ].tail(5).to_string(index=False)
)

print("\n=== DATA COMPLETENESS ===")
print(
    df[
        [
            "co2",
            "co2_per_capita",
        ]
    ].isna().sum()
)
