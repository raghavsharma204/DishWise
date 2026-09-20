import { expect, Page, test } from "@playwright/test";

const locationOptions = {
  city_id: "carmel-in",
  coverage_id: "central-carmel",
  default_radius_miles: 3,
  approximate: true,
  items: [
    { id: "midtown", label: "Midtown" },
    { id: "arts-design-district", label: "Arts & Design District" },
  ],
};

test.beforeEach(async ({ page }) => {
  await page.route("**/api/dev/locations", (route) => route.fulfill({ json: locationOptions }));
});

const dish = {
  id: "test-bistro:noodles",
  restaurant: { id: "test-bistro", name: "Test Bistro" },
  name: "Noodles",
  description: null,
  description_provenance: null,
  price: { amount: "12.50", currency: "USD" },
  price_provenance: "manually_reviewed",
  variants: [],
  attributes: [],
  source_url: "https://example.com/menu",
  verified_at: "2026-09-17T12:00:00Z",
  review_status: "reviewed",
  status: "active",
  is_synthetic: true,
};

const restaurant = {
  id: "test-bistro",
  name: "Test Bistro",
  address: "1 Main Street",
  cuisine_tags: ["American"],
  website_url: "https://example.com/bistro",
  source_url: "https://example.com/source",
  retrieved_at: "2026-09-17T12:00:00Z",
  location_url: "https://www.openstreetmap.org/?mlat=39.980000&mlon=-86.130000#map=18/39.980000/-86.130000",
};

async function setup(page: Page) {
  await page.route("**/api/dev/dishes", (route) => route.fulfill({ json: { items: [dish] } }));
  await page.route("**/api/dev/restaurants/test-bistro", (route) => route.fulfill({ json: restaurant }));
  await page.goto("/dev/dishes");
}

test("opens restaurant details and safe links with keyboard", async ({ page }) => {
  await setup(page);
  const toggle = page.getByRole("button", { name: "Restaurant details" });
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Test Bistro" })).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("link", { name: "Open location" })).toHaveAttribute("href", restaurant.location_url);
  await expect(page.getByRole("link", { name: "Restaurant website" })).toHaveAttribute("rel", "noopener noreferrer");
  await page.keyboard.press("Enter");
  await expect(page.getByText("Restaurant details", { exact: true })).toBeVisible();
});

test("shows unknown fields and recoverable failure", async ({ page }) => {
  await page.route("**/api/dev/dishes", (route) => route.fulfill({ json: { items: [dish] } }));
  await page.route("**/api/dev/restaurants/test-bistro", (route) => route.fulfill({ status: 503, json: { detail: "unavailable" } }));
  await page.goto("/dev/dishes");
  await page.getByRole("button", { name: "Restaurant details" }).click();
  await expect(page.getByText("Restaurant details are unavailable.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
});

test("renders explicit unknown restaurant fields", async ({ page }) => {
  await page.route("**/api/dev/dishes", (route) => route.fulfill({ json: { items: [dish] } }));
  await page.route("**/api/dev/restaurants/test-bistro", (route) => route.fulfill({ json: {
    ...restaurant,
    address: null,
    cuisine_tags: [],
    website_url: null,
    source_url: null,
    retrieved_at: null,
    location_url: null,
  } }));
  await page.goto("/dev/dishes");
  await page.getByRole("button", { name: "Restaurant details" }).click();
  await expect(page.getByText("Address unknown")).toBeVisible();
  await expect(page.getByText("Cuisine unknown")).toBeVisible();
  await expect(page.getByText("Website unavailable")).toBeVisible();
  await expect(page.getByText("Location link unavailable")).toBeVisible();
  await expect(page.getByText("Restaurant source unavailable")).toBeVisible();
});
