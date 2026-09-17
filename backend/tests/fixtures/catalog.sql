-- SYNTHETIC TEST DATA ONLY. Run against the disposable local database.
truncate catalog_attributes, catalog_price_variants, catalog_offerings,
  catalog_restaurants, catalog_coverage_areas, catalog_cities cascade;

insert into catalog_cities (id, name, state_code, country_code) values
  ('carmel-in', 'Carmel', 'IN', 'US'),
  ('sample-city', 'Sample City', 'OH', 'US');

insert into catalog_coverage_areas (id, city_id, name, boundary_geojson) values
  ('synthetic-central-carmel', 'carmel-in', 'Synthetic central Carmel test area',
   '{"type":"Polygon","coordinates":[[[-86.14,39.97],[-86.12,39.97],[-86.12,39.99],[-86.14,39.99],[-86.14,39.97]]]}'),
  ('synthetic-sample-area', 'sample-city', 'Synthetic sample area',
   '{"type":"Polygon","coordinates":[[[-83.01,40.0],[-82.99,40.0],[-82.99,40.02],[-83.01,40.02],[-83.01,40.0]]]}');

insert into catalog_restaurants
  (id, city_id, coverage_id, name, latitude, longitude, source_id, source_url, retrieved_at)
values
  ('test-bistro', 'carmel-in', 'synthetic-central-carmel', 'Test Bistro', 39.98, -86.13,
   'synthetic-bistro', 'https://example.com/test-bistro', '2026-09-17T12:00:00Z'),
  ('test-cafe', 'carmel-in', 'synthetic-central-carmel', 'Test Cafe', 39.981, -86.131,
   'synthetic-cafe', 'https://example.com/test-cafe', '2026-09-17T12:00:00Z'),
  ('test-second-city', 'sample-city', 'synthetic-sample-area', 'Test City Kitchen', 40.01, -83.0,
   'synthetic-city', 'https://example.com/test-city', '2026-09-17T12:00:00Z');

insert into catalog_offerings
  (id, restaurant_id, name, description, price_amount, price_currency,
   name_provenance, description_provenance, price_provenance, source_url,
   verified_at, review_status, status)
values
  ('test-bistro:noodles', 'test-bistro', 'Noodles', 'Synthetic spicy noodles', 12.50, 'USD',
   'manually_reviewed', 'manually_reviewed', 'manually_reviewed',
   'https://example.com/test-bistro/menu', '2026-09-17T12:00:00Z', 'reviewed', 'active'),
  ('test-cafe:noodles', 'test-cafe', 'Noodles', null, null, null,
   'manually_reviewed', null, null,
   'https://example.com/test-cafe/menu', '2026-09-17T12:00:00Z', 'reviewed', 'active'),
  ('test-cafe:soup', 'test-cafe', 'Soup', null, null, null,
   'manually_reviewed', null, null,
   'https://example.com/test-cafe/menu', null, 'pending', 'withdrawn'),
  ('test-second-city:rice', 'test-second-city', 'Rice Bowl', null, 9.00, 'USD',
   'manually_reviewed', null, 'manually_reviewed',
   'https://example.com/test-city/menu', '2026-09-17T12:00:00Z', 'reviewed', 'active');

insert into catalog_price_variants (id, offering_id, label, amount, currency, provenance) values
  ('test-cafe:noodles:small', 'test-cafe:noodles', 'Small', 8.00, 'USD', 'manually_reviewed'),
  ('test-cafe:noodles:large', 'test-cafe:noodles', 'Large', 13.00, 'USD', 'manually_reviewed');

insert into catalog_attributes (id, offering_id, kind, value, provenance, evidence_url, reviewed_at) values
  ('test-bistro:noodles:spice', 'test-bistro:noodles', 'spice', 'spicy', 'inferred', null, null),
  ('test-second-city:rice:cuisine', 'test-second-city:rice', 'cuisine', 'fusion',
   'manually_reviewed', 'https://example.com/test-city/menu', '2026-09-17T12:00:00Z');
