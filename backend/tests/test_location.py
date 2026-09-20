import json
from pathlib import Path

from fastapi.testclient import TestClient
import psycopg
import pytest

from app.location import LocationConfigError, haversine_miles, load_location_config, point_in_polygon
from app.main import create_app
from app.routes import locations


CONFIG_PATH = Path(__file__).parents[2] / "data" / "coverage" / "carmel.json"


def test_reviewed_carmel_configuration_and_known_distances() -> None:
    config = load_location_config()
    assert config.city_id == "carmel-in"
    assert config.coverage_id == "central-carmel"
    assert config.default_radius_miles == 3
    assert [(item.id, item.latitude, item.longitude) for item in config.presets] == [
        ("midtown", 39.9757552, -86.1289362),
        ("arts-design-district", 39.9786375, -86.1259628),
    ]
    midtown = config.preset("midtown")
    arts = config.preset("arts-design-district")
    assert midtown is not None and arts is not None
    assert haversine_miles(arts.latitude, arts.longitude, arts.latitude, arts.longitude) == 0
    assert round(haversine_miles(midtown.latitude, midtown.longitude, arts.latitude, arts.longitude), 1) == 0.3


def test_polygon_includes_edges_and_rejects_outside_points() -> None:
    ring = ((-2.0, -1.0), (2.0, -1.0), (2.0, 1.0), (-2.0, 1.0), (-2.0, -1.0))
    assert point_in_polygon(0, 0, ring)
    assert point_in_polygon(2, 0, ring)
    assert not point_in_polygon(3, 0, ring)
    assert haversine_miles(0, 0, 0, 180) == pytest.approx(3.141592653589793 * 3958.7613)


def test_configuration_rejects_invalid_boundary_and_duplicate_presets(tmp_path: Path) -> None:
    raw = json.loads(CONFIG_PATH.read_text())
    raw["coverage"]["boundary_geojson"]["coordinates"][0][-1] = [-86.13, 39.97]
    path = tmp_path / "unclosed.json"
    path.write_text(json.dumps(raw))
    with pytest.raises(LocationConfigError, match="closed"):
        load_location_config(path)

    raw = json.loads(CONFIG_PATH.read_text())
    raw["presets"].append(raw["presets"][0])
    path = tmp_path / "duplicate.json"
    path.write_text(json.dumps(raw))
    with pytest.raises(LocationConfigError, match="unique"):
        load_location_config(path)

    raw = json.loads(CONFIG_PATH.read_text())
    raw["presets"][0]["latitude"] = 91
    path = tmp_path / "bad-coordinate.json"
    path.write_text(json.dumps(raw))
    with pytest.raises(LocationConfigError, match="valid range"):
        load_location_config(path)


def test_configuration_is_city_agnostic(tmp_path: Path) -> None:
    raw = json.loads(CONFIG_PATH.read_text())
    raw["city"] = {"id": "sample-city", "name": "Sample City", "state_code": "OH", "country_code": "US"}
    raw["coverage"]["id"] = "sample-center"
    raw["presets"] = [{
        **raw["presets"][0],
        "id": "sample-origin",
        "label": "Sample Center",
        "latitude": 39.98,
        "longitude": -86.13,
    }]
    path = tmp_path / "sample-city.json"
    path.write_text(json.dumps(raw))
    config = load_location_config(path)
    assert config.city_id == "sample-city"
    assert config.presets[0].id == "sample-origin"


def sample_restaurants() -> list[dict]:
    return [
        {"restaurant_id": "known", "latitude": 39.9786375, "longitude": -86.1259628},
        {"restaurant_id": "unknown", "latitude": None, "longitude": None},
    ]


def test_location_endpoints_return_allowlisted_options_and_distances(monkeypatch) -> None:
    monkeypatch.setattr(locations, "list_preview_restaurant_coordinates", sample_restaurants)
    client = TestClient(create_app(local_catalog=True))
    options = client.get("/api/dev/locations")
    assert options.status_code == 200
    assert options.json() == {
        "city_id": "carmel-in",
        "coverage_id": "central-carmel",
        "default_radius_miles": 3,
        "approximate": True,
        "items": [
            {"id": "midtown", "label": "Midtown"},
            {"id": "arts-design-district", "label": "Arts & Design District"},
        ],
    }
    response = client.get("/api/dev/locations/midtown/distances")
    assert response.status_code == 200
    body = response.json()
    assert body["preset"] == {"id": "midtown", "label": "Midtown"}
    assert body["distances"] == [
        {"restaurant_id": "known", "distance_miles": 0.3},
        {"restaurant_id": "unknown", "distance_miles": None},
    ]
    assert "latitude" not in response.text and "longitude" not in response.text


def test_location_endpoint_validation_failures_and_gate(monkeypatch) -> None:
    client = TestClient(create_app(local_catalog=True))
    assert client.get("/api/dev/locations/not-configured/distances").status_code == 404
    assert client.get("/api/dev/locations/bad%20id/distances").status_code == 422
    assert client.get(f"/api/dev/locations/{'a' * 101}/distances").status_code == 422
    assert client.post("/api/dev/locations").status_code == 405
    assert TestClient(create_app(local_catalog=False)).get("/api/dev/locations").status_code == 404

    def unavailable() -> list[dict]:
        raise psycopg.OperationalError("unavailable")

    monkeypatch.setattr(locations, "list_preview_restaurant_coordinates", unavailable)
    assert client.get("/api/dev/locations/midtown/distances").status_code == 503

    def invalid_config():
        raise LocationConfigError("invalid")

    monkeypatch.setattr(locations, "load_location_config", invalid_config)
    assert client.get("/api/dev/locations").status_code == 503
