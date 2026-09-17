"""Run with TEST_DATABASE_URL pointing only to disposable local Supabase."""

import os
from pathlib import Path
from urllib.parse import urlsplit

import psycopg
import pytest

from app.repositories.catalog import list_dishes
from scripts.load_reviewed_sample import main as load_reviewed_sample


FIXTURE_SQL = Path(__file__).parents[1] / "fixtures" / "catalog.sql"


@pytest.fixture(scope="module", autouse=True)
def disposable_database():
    admin_url = os.getenv("TEST_DATABASE_URL")
    reader_url = os.getenv("CATALOG_DATABASE_URL")
    if not admin_url or not reader_url:
        pytest.skip("Local integration database URLs are not configured")
    for url in (admin_url, reader_url):
        parsed = urlsplit(url)
        if parsed.hostname not in {"127.0.0.1", "localhost"} or parsed.port != 54322:
            pytest.fail("Catalog integration tests require local Supabase port 54322")
    with psycopg.connect(admin_url) as connection:
        connection.execute(FIXTURE_SQL.read_text())
    yield


def test_fixture_round_trip_and_second_city() -> None:
    dishes = list_dishes()
    assert len(dishes) == 4
    assert {dish["restaurant"]["id"] for dish in dishes if dish["name"] == "Noodles"} == {"test-bistro", "test-cafe"}
    assert {dish["restaurant"]["name"] for dish in dishes} == {"Test Bistro", "Test Cafe", "Test City Kitchen"}
    variant_dish = next(dish for dish in dishes if dish["id"] == "test-cafe:noodles")
    assert all(dish["is_synthetic"] for dish in dishes)
    assert variant_dish["price"] is None
    assert [variant["label"] for variant in variant_dish["variants"]] == ["Large", "Small"]
    assert next(dish for dish in dishes if dish["id"] == "test-bistro:noodles")["attributes"][0]["provenance"] == "inferred"


def test_foreign_keys_and_read_only_role() -> None:
    with psycopg.connect(os.environ["TEST_DATABASE_URL"]) as admin:
        with pytest.raises(psycopg.errors.ForeignKeyViolation):
            with admin.transaction():
                admin.execute("insert into catalog_price_variants values ('bad', 'missing', 'Small', 1, 'USD', 'sourced')")
    with psycopg.connect(os.environ["CATALOG_DATABASE_URL"]) as reader:
        with pytest.raises(psycopg.errors.InsufficientPrivilege):
            reader.execute("delete from catalog_offerings")


def test_catalog_read_is_bounded() -> None:
    admin_url = os.environ["TEST_DATABASE_URL"]
    try:
        with psycopg.connect(admin_url) as admin:
            admin.execute(
                """
                insert into catalog_offerings
                  (id, restaurant_id, name, name_provenance, source_url, review_status, status)
                select 'bulk:' || n, 'test-bistro', 'Synthetic item ' || n,
                       'manually_reviewed', 'https://example.com/test-menu', 'pending', 'active'
                  from generate_series(1, 51) as n
                """
            )
        assert len(list_dishes()) == 50
    finally:
        with psycopg.connect(admin_url) as admin:
            admin.execute("delete from catalog_offerings where id like 'bulk:%'")


def test_reviewed_sample_loads_only_recorded_facts() -> None:
    admin_url = os.environ["TEST_DATABASE_URL"]
    try:
        load_reviewed_sample()
        dishes = list_dishes()
        assert len(dishes) == 6
        assert not any(dish["is_synthetic"] for dish in dishes)
        salad = next(dish for dish in dishes if dish["id"] == "josephine:french-bistro-salad")
        assert salad["price"] is None
        assert {(item["label"], item["price"]["amount"]) for item in salad["variants"]} == {
            ("Small", "8.00"), ("Entree", "14.00")
        }
        assert all(dish["description"] is None and dish["attributes"] == [] for dish in dishes)
        with psycopg.connect(admin_url) as admin:
            coords = admin.execute(
                "select latitude, longitude from catalog_restaurants where id = 'josephine'"
            ).fetchone()
            assert coords == (None, None)
    finally:
        with psycopg.connect(admin_url) as admin:
            admin.execute(FIXTURE_SQL.read_text())
