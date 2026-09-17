-- A reviewed menu may precede verified restaurant coordinates or coverage.
-- Later location features must reject unknown geography rather than invent it.
alter table catalog_coverage_areas alter column boundary_geojson drop not null;
alter table catalog_restaurants alter column latitude drop not null;
alter table catalog_restaurants alter column longitude drop not null;
alter table catalog_restaurants add constraint catalog_restaurant_coordinate_pair
  check ((latitude is null) = (longitude is null));
alter table catalog_offerings add column is_synthetic boolean not null default false;
