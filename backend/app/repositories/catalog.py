"""Read-only catalog queries for the local dish preview."""

import os
from decimal import Decimal
from urllib.parse import urlsplit

import psycopg
from psycopg.rows import dict_row


MAX_PREVIEW_DISHES = 50


def safe_https_url(value: str | None) -> str | None:
    if not value:
        return None
    try:
        parsed = urlsplit(value)
    except ValueError:
        return None
    if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password:
        return None
    if any(character.isspace() for character in value):
        return None
    return value


def _price(amount: Decimal | None, currency: str | None) -> dict[str, str] | None:
    if amount is None or currency is None:
        return None
    return {"amount": format(amount, ".2f"), "currency": currency}


def list_dishes() -> list[dict]:
    database_url = os.getenv("CATALOG_DATABASE_URL")
    if not database_url:
        raise RuntimeError("CATALOG_DATABASE_URL is not configured")

    with psycopg.connect(database_url, row_factory=dict_row, connect_timeout=3) as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                select o.id, o.restaurant_id, r.name as restaurant_name, o.name,
                       o.description, o.description_provenance, o.price_amount,
                       o.price_currency, o.price_provenance, o.source_url,
                       o.verified_at, o.review_status, o.status, o.is_synthetic
                  from catalog_offerings o
                  join catalog_restaurants r on r.id = o.restaurant_id
                 order by r.id, o.id
                 limit %s
                """,
                (MAX_PREVIEW_DISHES,),
            )
            rows = cursor.fetchall()
            if not rows:
                return []
            ids = [row["id"] for row in rows]
            cursor.execute(
                """
                select offering_id, label, amount, currency, provenance
                  from catalog_price_variants
                 where offering_id = any(%s)
                 order by offering_id, label
                """,
                (ids,),
            )
            variants = cursor.fetchall()
            cursor.execute(
                """
                select offering_id, kind, value, provenance
                  from catalog_attributes
                 where offering_id = any(%s)
                 order by offering_id, kind, value
                """,
                (ids,),
            )
            attributes = cursor.fetchall()

    by_id = {}
    for row in rows:
        by_id[row["id"]] = {
            "id": row["id"],
            "restaurant": {"id": row["restaurant_id"], "name": row["restaurant_name"]},
            "name": row["name"],
            "description": row["description"],
            "description_provenance": row["description_provenance"],
            "price": _price(row["price_amount"], row["price_currency"]),
            "price_provenance": row["price_provenance"],
            "variants": [],
            "attributes": [],
            "source_url": safe_https_url(row["source_url"]),
            "verified_at": row["verified_at"],
            "review_status": row["review_status"],
            "status": row["status"],
            "is_synthetic": row["is_synthetic"],
        }
    for variant in variants:
        by_id[variant["offering_id"]]["variants"].append(
            {
                "label": variant["label"],
                "price": _price(variant["amount"], variant["currency"]),
                "provenance": variant["provenance"],
            }
        )
    for attribute in attributes:
        by_id[attribute["offering_id"]]["attributes"].append(
            {key: attribute[key] for key in ("kind", "value", "provenance")}
        )
    return [by_id[row["id"]] for row in rows]
