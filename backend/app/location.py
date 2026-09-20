"""Validated location configuration and deterministic distance calculations."""

from dataclasses import dataclass
import json
from math import asin, cos, isfinite, radians, sin, sqrt
from pathlib import Path
import re
from typing import Any
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_CONFIG_PATH = ROOT / "data" / "coverage" / "carmel.json"
EARTH_RADIUS_MILES = 3958.7613
MAX_ID_LENGTH = 100
_ID_PATTERN = re.compile(r"^[a-z0-9][a-z0-9-]*$")


class LocationConfigError(ValueError):
    """Raised when checked-in location configuration is invalid."""


@dataclass(frozen=True)
class LocationPreset:
    id: str
    label: str
    latitude: float
    longitude: float


@dataclass(frozen=True)
class LocationConfig:
    city_id: str
    city_name: str
    state_code: str
    country_code: str
    coverage_id: str
    coverage_name: str
    boundary_geojson: dict[str, Any]
    default_radius_miles: int
    presets: tuple[LocationPreset, ...]

    def preset(self, preset_id: str) -> LocationPreset | None:
        return next((preset for preset in self.presets if preset.id == preset_id), None)


def _record(value: Any, field: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise LocationConfigError(f"{field} must be an object")
    return value


def _text(value: Any, field: str, *, maximum: int = 200) -> str:
    if not isinstance(value, str) or not value.strip() or len(value) > maximum:
        raise LocationConfigError(f"{field} must be nonempty and at most {maximum} characters")
    return value


def _identifier(value: Any, field: str) -> str:
    identifier = _text(value, field, maximum=MAX_ID_LENGTH)
    if not _ID_PATTERN.fullmatch(identifier):
        raise LocationConfigError(f"{field} is invalid")
    return identifier


def _coordinate(value: Any, field: str, lower: float, upper: float) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise LocationConfigError(f"{field} must be numeric")
    coordinate = float(value)
    if not isfinite(coordinate) or not lower <= coordinate <= upper:
        raise LocationConfigError(f"{field} is outside its valid range")
    return coordinate


def _https_url(value: Any, field: str) -> str:
    url = _text(value, field, maximum=500)
    parsed = urlsplit(url)
    if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password:
        raise LocationConfigError(f"{field} must be a safe HTTPS URL")
    return url


def _validate_source(value: Any, field: str) -> None:
    source = _record(value, field)
    _https_url(source.get("url"), f"{field}.url")
    _text(source.get("reviewed_at"), f"{field}.reviewed_at", maximum=30)


def _point_on_segment(point: tuple[float, float], start: tuple[float, float], end: tuple[float, float]) -> bool:
    x, y = point
    x1, y1 = start
    x2, y2 = end
    cross = (x - x1) * (y2 - y1) - (y - y1) * (x2 - x1)
    if abs(cross) > 1e-12:
        return False
    return min(x1, x2) - 1e-12 <= x <= max(x1, x2) + 1e-12 and min(y1, y2) - 1e-12 <= y <= max(y1, y2) + 1e-12


def point_in_polygon(longitude: float, latitude: float, ring: tuple[tuple[float, float], ...]) -> bool:
    """Return True for points inside or on the boundary of a simple polygon."""
    point = (longitude, latitude)
    inside = False
    for start, end in zip(ring, ring[1:]):
        if _point_on_segment(point, start, end):
            return True
        x1, y1 = start
        x2, y2 = end
        if (y1 > latitude) != (y2 > latitude):
            intersection = (x2 - x1) * (latitude - y1) / (y2 - y1) + x1
            if longitude < intersection:
                inside = not inside
    return inside


def _polygon(value: Any) -> tuple[dict[str, Any], tuple[tuple[float, float], ...]]:
    polygon = _record(value, "coverage.boundary_geojson")
    coordinates = polygon.get("coordinates")
    if polygon.get("type") != "Polygon" or not isinstance(coordinates, list) or len(coordinates) != 1:
        raise LocationConfigError("coverage boundary must be a single-ring Polygon")
    raw_ring = coordinates[0]
    if not isinstance(raw_ring, list) or len(raw_ring) < 4:
        raise LocationConfigError("coverage boundary ring is too short")
    ring: list[tuple[float, float]] = []
    for index, raw_point in enumerate(raw_ring):
        if not isinstance(raw_point, list) or len(raw_point) != 2:
            raise LocationConfigError(f"coverage point {index} is invalid")
        longitude = _coordinate(raw_point[0], f"coverage point {index} longitude", -180, 180)
        latitude = _coordinate(raw_point[1], f"coverage point {index} latitude", -90, 90)
        ring.append((longitude, latitude))
    if ring[0] != ring[-1] or len(set(ring[:-1])) < 3:
        raise LocationConfigError("coverage boundary must be closed with three distinct vertices")
    return polygon, tuple(ring)


def load_location_config(path: Path = DEFAULT_CONFIG_PATH) -> LocationConfig:
    try:
        raw = json.loads(path.read_text())
    except (OSError, json.JSONDecodeError) as exc:
        raise LocationConfigError("location configuration is unavailable") from exc

    root = _record(raw, "configuration")
    city = _record(root.get("city"), "city")
    coverage = _record(root.get("coverage"), "coverage")
    boundary, ring = _polygon(coverage.get("boundary_geojson"))
    if coverage.get("classification") != "project_operational_boundary":
        raise LocationConfigError("coverage classification is invalid")
    sources = coverage.get("sources")
    if not isinstance(sources, list) or not sources:
        raise LocationConfigError("coverage sources are required")
    for index, source in enumerate(sources):
        _validate_source(source, f"coverage.sources[{index}]")

    if root.get("default_radius_miles") != 3:
        raise LocationConfigError("default radius must be 3 miles")
    raw_presets = root.get("presets")
    if not isinstance(raw_presets, list) or not raw_presets:
        raise LocationConfigError("at least one preset is required")
    presets: list[LocationPreset] = []
    seen_ids: set[str] = set()
    for index, raw_preset in enumerate(raw_presets):
        preset_data = _record(raw_preset, f"presets[{index}]")
        preset_id = _identifier(preset_data.get("id"), f"presets[{index}].id")
        if preset_id in seen_ids:
            raise LocationConfigError("preset IDs must be unique")
        seen_ids.add(preset_id)
        label = _text(preset_data.get("label"), f"presets[{index}].label", maximum=100)
        latitude = _coordinate(preset_data.get("latitude"), f"presets[{index}].latitude", -90, 90)
        longitude = _coordinate(preset_data.get("longitude"), f"presets[{index}].longitude", -180, 180)
        if preset_data.get("approximate") is not True:
            raise LocationConfigError("presets must be marked approximate")
        if preset_data.get("coordinate_method") not in {"node", "geometry_center"}:
            raise LocationConfigError("preset coordinate method is invalid")
        _validate_source(preset_data.get("source"), f"presets[{index}].source")
        if not point_in_polygon(longitude, latitude, ring):
            raise LocationConfigError(f"preset {preset_id} lies outside coverage")
        presets.append(LocationPreset(preset_id, label, latitude, longitude))

    return LocationConfig(
        city_id=_identifier(city.get("id"), "city.id"),
        city_name=_text(city.get("name"), "city.name", maximum=100),
        state_code=_text(city.get("state_code"), "city.state_code", maximum=2),
        country_code=_text(city.get("country_code"), "city.country_code", maximum=2),
        coverage_id=_identifier(coverage.get("id"), "coverage.id"),
        coverage_name=_text(coverage.get("name"), "coverage.name", maximum=150),
        boundary_geojson=boundary,
        default_radius_miles=3,
        presets=tuple(presets),
    )


def haversine_miles(origin_latitude: float, origin_longitude: float, latitude: float, longitude: float) -> float:
    values = (
        _coordinate(origin_latitude, "origin latitude", -90, 90),
        _coordinate(origin_longitude, "origin longitude", -180, 180),
        _coordinate(latitude, "latitude", -90, 90),
        _coordinate(longitude, "longitude", -180, 180),
    )
    origin_lat_radians, origin_lon_radians, lat_radians, lon_radians = map(radians, values)
    latitude_delta = lat_radians - origin_lat_radians
    longitude_delta = lon_radians - origin_lon_radians
    haversine = sin(latitude_delta / 2) ** 2 + cos(origin_lat_radians) * cos(lat_radians) * sin(longitude_delta / 2) ** 2
    return 2 * EARTH_RADIUS_MILES * asin(sqrt(min(1.0, haversine)))
