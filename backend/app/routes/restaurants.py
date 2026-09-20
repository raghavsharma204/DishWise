"""Local-only, read-only restaurant detail endpoint."""

from datetime import datetime

import psycopg
from fastapi import APIRouter, HTTPException, Path
from pydantic import BaseModel

from app.repositories.catalog import get_restaurant


class RestaurantDetails(BaseModel):
    id: str
    name: str
    address: str | None
    cuisine_tags: list[str]
    website_url: str | None
    source_url: str | None
    retrieved_at: datetime | None
    location_url: str | None


router = APIRouter()


@router.get("/api/dev/restaurants/{restaurant_id}", response_model=RestaurantDetails)
def get_restaurant_details(
    restaurant_id: str = Path(min_length=1, max_length=100, pattern=r"^[A-Za-z0-9][A-Za-z0-9:_-]*$")
) -> RestaurantDetails:
    try:
        restaurant = get_restaurant(restaurant_id)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="Invalid restaurant ID") from exc
    except (psycopg.Error, RuntimeError) as exc:
        raise HTTPException(status_code=503, detail="Catalog unavailable") from exc
    if restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return RestaurantDetails.model_validate(restaurant)
