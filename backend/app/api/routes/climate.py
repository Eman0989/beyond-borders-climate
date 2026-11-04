
from fastapi import APIRouter, HTTPException

from app.models.climate import CountryClimate
from app.services.climate_service import (
    get_all_countries,
    get_country_by_code,
)

router = APIRouter(prefix="/climate", tags=["Climate"])


@router.get("/countries", response_model=list[CountryClimate])
def list_countries():
    return get_all_countries()


@router.get(
    "/countries/{country_code}",
    response_model=CountryClimate,
)
def country_details(country_code: str):
    country = get_country_by_code(country_code)

    if country is None:
        raise HTTPException(
            status_code=404,
            detail="Climate data unavailable for this country.",
        )

    return country
