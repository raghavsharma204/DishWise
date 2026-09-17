"""Local-only, read-only catalog preview endpoint."""

from datetime import datetime
from typing import Literal

import psycopg
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.repositories.catalog import list_dishes


Provenance = Literal["sourced", "manually_reviewed", "inferred"]


class Price(BaseModel):
    amount: str
    currency: str


class Restaurant(BaseModel):
    id: str
    name: str


class Variant(BaseModel):
    label: str
    price: Price
    provenance: Provenance


class Attribute(BaseModel):
    kind: str
    value: str
    provenance: Provenance


class Dish(BaseModel):
    id: str
    restaurant: Restaurant
    name: str
    description: str | None
    description_provenance: Provenance | None
    price: Price | None
    price_provenance: Provenance | None
    variants: list[Variant]
    attributes: list[Attribute]
    source_url: str | None
    verified_at: datetime | None
    review_status: Literal["pending", "reviewed"]
    status: Literal["active", "withdrawn"]


class DishList(BaseModel):
    items: list[Dish]


router = APIRouter()


@router.get("/api/dev/dishes", response_model=DishList)
def get_dishes() -> DishList:
    try:
        return DishList(items=list_dishes())
    except (psycopg.Error, RuntimeError) as exc:
        raise HTTPException(status_code=503, detail="Catalog unavailable") from exc
