from datetime import datetime, timezone

import psycopg
from fastapi.testclient import TestClient

from app.main import create_app
from app.routes import restaurants


def sample_restaurant() -> dict:
    return {
        "id": "test-bistro",
        "name": "Test Bistro",
        "address": "1 Main Street",
        "cuisine_tags": ["American"],
        "website_url": "https://example.com/bistro",
        "source_url": "https://example.com/source",
        "retrieved_at": datetime(2026, 9, 17, 12, tzinfo=timezone.utc),
        "location_url": "https://www.openstreetmap.org/?mlat=39.980000&mlon=-86.130000#map=18/39.980000/-86.130000",
    }


def test_restaurant_details_returns_allowlisted_data(monkeypatch) -> None:
    monkeypatch.setattr(restaurants, "get_restaurant", lambda restaurant_id: sample_restaurant() if restaurant_id == "test-bistro" else None)
    response = TestClient(create_app(local_catalog=True)).get("/api/dev/restaurants/test-bistro")
    assert response.status_code == 200
    assert response.json()["name"] == "Test Bistro"
    assert response.json()["location_url"].startswith("https://www.openstreetmap.org/")


def test_restaurant_details_handles_missing_and_unknown(monkeypatch) -> None:
    missing = sample_restaurant() | {"address": None, "website_url": None, "source_url": None, "retrieved_at": None, "location_url": None, "cuisine_tags": []}
    monkeypatch.setattr(restaurants, "get_restaurant", lambda restaurant_id: missing if restaurant_id == "missing" else None)
    client = TestClient(create_app(local_catalog=True))
    assert client.get("/api/dev/restaurants/missing").json()["location_url"] is None
    assert client.get("/api/dev/restaurants/unknown").status_code == 404


def test_restaurant_details_handles_database_failure(monkeypatch) -> None:
    def unavailable(_restaurant_id: str) -> dict:
        raise psycopg.OperationalError("unavailable")

    monkeypatch.setattr(restaurants, "get_restaurant", unavailable)
    assert TestClient(create_app(local_catalog=True)).get("/api/dev/restaurants/test-bistro").status_code == 503


def test_restaurant_id_validation_and_production_gate(monkeypatch) -> None:
    client = TestClient(create_app(local_catalog=True))
    assert client.get("/api/dev/restaurants/bad%20id").status_code == 422
    assert client.post("/api/dev/restaurants/test-bistro").status_code == 405
    assert TestClient(create_app(local_catalog=False)).get("/api/dev/restaurants/test-bistro").status_code == 404
