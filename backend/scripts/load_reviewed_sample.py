"""Load the fixed Setup A factual sample into disposable local PostgreSQL.

This is a local preview command, not a general menu importer. It replaces the
catalog fixture and never fetches restaurant websites.
"""

import csv
import json
import os
from decimal import Decimal
from pathlib import Path
from urllib.parse import urlsplit

import psycopg


ROOT = Path(__file__).resolve().parents[2]
SAMPLE_PATH = ROOT / "data" / "samples" / "carmel_offerings.json"
AUDIT_PATH = ROOT / "data" / "source_audit.csv"


def local_admin_url() -> str:
    url = os.environ["TEST_DATABASE_URL"]
    parsed = urlsplit(url)
    if parsed.hostname not in {"127.0.0.1", "localhost"} or parsed.port != 54322:
        raise SystemExit("Refusing to load a database outside local Supabase port 54322")
    return url


def main() -> None:
    sample = json.loads(SAMPLE_PATH.read_text())
    if sample["status"] != "reviewed_factual_sample_not_launch_catalog":
        raise SystemExit("Unexpected sample status")
    with AUDIT_PATH.open(newline="") as audit_file:
        audit = {row["restaurant_id"]: row for row in csv.DictReader(audit_file)}

    restaurants = {offering["restaurant_id"] for offering in sample["offerings"]}
    if any(audit[id]["reuse_status"] != "permitted-facts-only" for id in restaurants):
        raise SystemExit("Sample includes a source without permitted factual reuse")

    with psycopg.connect(local_admin_url()) as connection:
        connection.execute(
            """truncate catalog_attributes, catalog_price_variants, catalog_offerings,
               catalog_restaurants, catalog_coverage_areas, catalog_cities cascade"""
        )
        connection.execute(
            "insert into catalog_cities (id, name, state_code, country_code) values (%s, %s, %s, %s)",
            ("carmel-in", "Carmel", "IN", "US"),
        )
        connection.execute(
            "insert into catalog_coverage_areas (id, city_id, name, boundary_geojson) values (%s, %s, %s, null)",
            ("sample-central-carmel", "carmel-in", "Central Carmel sample; extent unverified"),
        )
        for restaurant_id in sorted(restaurants):
            row = audit[restaurant_id]
            latitude = Decimal(row["osm_lat"]) if row["osm_lat"] else None
            longitude = Decimal(row["osm_lon"]) if row["osm_lon"] else None
            source_id = f"osm:{row['osm_type']}:{row['osm_id']}" if row["osm_id"] else None
            connection.execute(
                """insert into catalog_restaurants
                   (id, city_id, coverage_id, name, latitude, longitude,
                    website_url, menu_url, source_id, source_url, retrieved_at)
                   values (%s, 'carmel-in', 'sample-central-carmel', %s, %s, %s,
                           %s, %s, %s, %s, %s)""",
                (
                    restaurant_id, row["restaurant_name"], latitude, longitude,
                    row["restaurant_url"], row["menu_url"], source_id,
                    row["osm_record_url"] or row["restaurant_url"],
                    sample["audit_date_utc"],
                ),
            )
        for offering in sample["offerings"]:
            price = offering["price"]
            connection.execute(
                """insert into catalog_offerings
                   (id, restaurant_id, name, description, price_amount, price_currency,
                    name_provenance, description_provenance, price_provenance,
                    source_url, verified_at, review_status, status)
                   values (%s, %s, %s, null, %s, %s, %s, null, %s, %s, %s,
                           'reviewed', 'active')""",
                (
                    offering["id"], offering["restaurant_id"], offering["name"],
                    Decimal(str(price["amount"])) if price else None,
                    price["currency"] if price else None,
                    offering["provenance"]["name"],
                    offering["provenance"]["price"] if price else None,
                    offering["source_url"], offering["verified_at_utc"],
                ),
            )
            for variant in offering["price_variants"]:
                connection.execute(
                    """insert into catalog_price_variants
                       (id, offering_id, label, amount, currency, provenance)
                       values (%s, %s, %s, %s, %s, %s)""",
                    (
                        f"{offering['id']}:{variant['label'].lower().replace(' ', '-')}",
                        offering["id"], variant["label"], Decimal(str(variant["amount"])),
                        variant["currency"], variant["provenance"],
                    ),
                )
    print(f"Loaded {len(sample['offerings'])} reviewed factual offerings from {len(restaurants)} restaurants into the disposable local catalog")


if __name__ == "__main__":
    main()
