"""Local-only location presets and approximate restaurant distances."""

import psycopg
from fastapi import APIRouter, HTTPException, Path
from pydantic import BaseModel

from app.location import LocationConfigError, haversine_miles, load_location_config
from app.repositories.catalog import list_preview_restaurant_coordinates


class PresetSummary(BaseModel):
    id: str
    label: str


class LocationOptions(BaseModel):
    city_id: str
    coverage_id: str
    default_radius_miles: int
    approximate: bool
    items: list[PresetSummary]


class RestaurantDistance(BaseModel):
    restaurant_id: str
    distance_miles: float | None


class DistanceList(BaseModel):
    city_id: str
    coverage_id: str
    preset: PresetSummary
    approximate: bool
    distances: list[RestaurantDistance]


router = APIRouter()


@router.get("/api/dev/locations", response_model=LocationOptions)
def get_location_options() -> LocationOptions:
    try:
        config = load_location_config()
    except LocationConfigError as exc:
        raise HTTPException(status_code=503, detail="Location configuration unavailable") from exc
    return LocationOptions(
        city_id=config.city_id,
        coverage_id=config.coverage_id,
        default_radius_miles=config.default_radius_miles,
        approximate=True,
        items=[PresetSummary(id=preset.id, label=preset.label) for preset in config.presets],
    )


@router.get("/api/dev/locations/{preset_id}/distances", response_model=DistanceList)
def get_location_distances(
    preset_id: str = Path(min_length=1, max_length=100, pattern=r"^[a-z0-9][a-z0-9-]*$")
) -> DistanceList:
    try:
        config = load_location_config()
        preset = config.preset(preset_id)
        if preset is None:
            raise HTTPException(status_code=404, detail="Location preset not found")
        restaurants = list_preview_restaurant_coordinates()
    except HTTPException:
        raise
    except LocationConfigError as exc:
        raise HTTPException(status_code=503, detail="Location configuration unavailable") from exc
    except (psycopg.Error, RuntimeError) as exc:
        raise HTTPException(status_code=503, detail="Catalog unavailable") from exc

    distances = []
    for restaurant in restaurants:
        latitude = restaurant["latitude"]
        longitude = restaurant["longitude"]
        distance = None
        if latitude is not None and longitude is not None:
            distance = round(haversine_miles(preset.latitude, preset.longitude, latitude, longitude), 1)
        distances.append(RestaurantDistance(restaurant_id=restaurant["restaurant_id"], distance_miles=distance))
    return DistanceList(
        city_id=config.city_id,
        coverage_id=config.coverage_id,
        preset=PresetSummary(id=preset.id, label=preset.label),
        approximate=True,
        distances=distances,
    )
