-- Catalog foundation. The local preview uses synthetic records loaded separately.
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'catalog_reader') then
    create role catalog_reader login;
  end if;
end $$;

create table catalog_cities (
  id text primary key check (length(trim(id)) > 0),
  name text not null check (length(trim(name)) > 0),
  state_code text not null check (length(state_code) = 2),
  country_code text not null check (length(country_code) = 2)
);

create table catalog_coverage_areas (
  id text primary key check (length(trim(id)) > 0),
  city_id text not null references catalog_cities(id),
  name text not null check (length(trim(name)) > 0),
  boundary_geojson jsonb not null check (
    boundary_geojson->>'type' = 'Polygon'
    and jsonb_typeof(boundary_geojson->'coordinates') = 'array'
  ),
  unique (id, city_id)
);

create table catalog_restaurants (
  id text primary key check (length(trim(id)) > 0),
  city_id text not null references catalog_cities(id),
  coverage_id text not null,
  name text not null check (length(trim(name)) > 0),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  address text,
  cuisine_tags text[] not null default '{}',
  website_url text,
  menu_url text,
  source_id text,
  source_url text,
  retrieved_at timestamptz,
  foreign key (coverage_id, city_id) references catalog_coverage_areas(id, city_id),
  unique (city_id, source_id)
);

create table catalog_offerings (
  id text primary key check (length(trim(id)) > 0),
  restaurant_id text not null references catalog_restaurants(id),
  name text not null check (length(trim(name)) > 0),
  description text,
  price_amount numeric(10,2) check (price_amount >= 0),
  price_currency char(3),
  name_provenance text not null check (name_provenance in ('sourced', 'manually_reviewed')),
  description_provenance text check (description_provenance in ('sourced', 'manually_reviewed', 'inferred')),
  price_provenance text check (price_provenance in ('sourced', 'manually_reviewed')),
  source_url text not null check (source_url ~ '^https://[^[:space:]]+$'),
  verified_at timestamptz,
  review_status text not null check (review_status in ('pending', 'reviewed')),
  status text not null check (status in ('active', 'withdrawn')),
  check ((price_amount is null) = (price_currency is null)),
  check ((price_amount is null) = (price_provenance is null)),
  check ((description is null) = (description_provenance is null)),
  check (price_currency is null or price_currency ~ '^[A-Z]{3}$')
);

create table catalog_price_variants (
  id text primary key check (length(trim(id)) > 0),
  offering_id text not null references catalog_offerings(id),
  label text not null check (length(trim(label)) > 0),
  amount numeric(10,2) not null check (amount >= 0),
  currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  provenance text not null check (provenance in ('sourced', 'manually_reviewed')),
  unique (offering_id, label)
);

create table catalog_attributes (
  id text primary key check (length(trim(id)) > 0),
  offering_id text not null references catalog_offerings(id),
  kind text not null check (kind in ('cuisine', 'ingredient', 'spice', 'creaminess', 'flavor', 'texture', 'dietary')),
  value text not null check (length(trim(value)) > 0),
  provenance text not null check (provenance in ('sourced', 'manually_reviewed', 'inferred')),
  evidence_url text,
  reviewed_at timestamptz,
  unique (offering_id, kind, value)
);

create index catalog_coverage_city_idx on catalog_coverage_areas(city_id);
create index catalog_restaurant_city_coverage_idx on catalog_restaurants(city_id, coverage_id);
create index catalog_offering_restaurant_idx on catalog_offerings(restaurant_id);
create index catalog_offering_status_verified_idx on catalog_offerings(status, verified_at);
create index catalog_variant_offering_idx on catalog_price_variants(offering_id);
create index catalog_attribute_offering_idx on catalog_attributes(offering_id);

alter table catalog_cities enable row level security;
alter table catalog_coverage_areas enable row level security;
alter table catalog_restaurants enable row level security;
alter table catalog_offerings enable row level security;
alter table catalog_price_variants enable row level security;
alter table catalog_attributes enable row level security;

revoke all on catalog_cities, catalog_coverage_areas, catalog_restaurants,
  catalog_offerings, catalog_price_variants, catalog_attributes from public, anon, authenticated;
grant usage on schema public to catalog_reader;
grant select on catalog_cities, catalog_coverage_areas, catalog_restaurants,
  catalog_offerings, catalog_price_variants, catalog_attributes to catalog_reader;

create policy catalog_reader_select on catalog_cities for select to catalog_reader using (true);
create policy catalog_reader_select on catalog_coverage_areas for select to catalog_reader using (true);
create policy catalog_reader_select on catalog_restaurants for select to catalog_reader using (true);
create policy catalog_reader_select on catalog_offerings for select to catalog_reader using (true);
create policy catalog_reader_select on catalog_price_variants for select to catalog_reader using (true);
create policy catalog_reader_select on catalog_attributes for select to catalog_reader using (true);
