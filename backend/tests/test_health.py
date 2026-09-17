from fastapi.testclient import TestClient

from app.main import app


def test_health_returns_process_status() -> None:
    response = TestClient(app).get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_health_allows_only_configured_frontend_origin() -> None:
    client = TestClient(app)
    allowed = client.get("/health", headers={"Origin": "http://localhost:3000"})
    other = client.get("/health", headers={"Origin": "https://other.example"})
    assert allowed.headers["access-control-allow-origin"] == "http://localhost:3000"
    assert "access-control-allow-origin" not in other.headers


def test_only_health_is_publicly_documented() -> None:
    client = TestClient(app)
    for path in ("/docs", "/redoc", "/openapi.json", "/api/dishes"):
        assert client.get(path).status_code == 404
