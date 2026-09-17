from fastapi.testclient import TestClient
import psycopg

from app.main import create_app
from app.repositories.catalog import safe_https_url
from app.routes import dishes


def sample_dish() -> dict:
    return {
        "id": "test-cafe:noodles",
        "restaurant": {"id": "test-cafe", "name": "Test Cafe"},
        "name": "Noodles",
        "description": None,
        "description_provenance": None,
        "price": None,
        "price_provenance": None,
        "variants": [{"label": "Small", "price": {"amount": "8.00", "currency": "USD"}, "provenance": "manually_reviewed"}],
        "attributes": [],
        "source_url": "https://example.com/menu",
        "verified_at": "2026-09-17T12:00:00Z",
        "review_status": "reviewed",
        "status": "active",
        "is_synthetic": True,
    }


def test_local_catalog_returns_allowlisted_cards(monkeypatch) -> None:
    extra = sample_dish() | {"private_note": "must not appear"}
    monkeypatch.setattr(dishes, "list_dishes", lambda: [extra])
    response = TestClient(create_app(local_catalog=True)).get("/api/dev/dishes")
    assert response.status_code == 200
    assert response.json()["items"][0]["variants"][0]["price"]["amount"] == "8.00"
    assert "private_note" not in response.json()["items"][0]


def test_empty_and_unavailable_catalog(monkeypatch) -> None:
    client = TestClient(create_app(local_catalog=True))
    monkeypatch.setattr(dishes, "list_dishes", lambda: [])
    assert client.get("/api/dev/dishes").json() == {"items": []}

    def unavailable() -> list[dict]:
        raise psycopg.OperationalError("local database unavailable")

    monkeypatch.setattr(dishes, "list_dishes", unavailable)
    response = client.get("/api/dev/dishes")
    assert response.status_code == 503
    assert response.json() == {"detail": "Catalog unavailable"}


def test_dev_routes_are_absent_without_local_gate(monkeypatch) -> None:
    monkeypatch.setenv("APP_ENV", "local")
    monkeypatch.setenv("ENABLE_DEV_CATALOG", "1")
    monkeypatch.setenv("VERCEL", "1")
    assert TestClient(create_app()).get("/api/dev/dishes").status_code == 404
    assert TestClient(create_app(local_catalog=False)).get("/api/dev/dishes").status_code == 404


def test_catalog_writes_are_rejected() -> None:
    client = TestClient(create_app(local_catalog=True))
    for method in ("post", "patch", "delete"):
        assert getattr(client, method)("/api/dev/dishes").status_code == 405


def test_unsafe_source_urls_are_suppressed() -> None:
    assert safe_https_url("javascript:alert(1)") is None
    assert safe_https_url("https://user:pass@example.com/menu") is None
    assert safe_https_url("https://example.com/menu") == "https://example.com/menu"
