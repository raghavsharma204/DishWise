import { expect, Page, test } from "@playwright/test";

const dishes = [
  {
    id: "woodys-library:salad",
    restaurant: { id: "woodys-library", name: "Woody's Library Restaurant" },
    name: "Synthetic Salad",
    description: null,
    description_provenance: null,
    price: null,
    price_provenance: null,
    variants: [],
    attributes: [],
    source_url: "https://example.com/menu",
    verified_at: "2026-09-17T12:00:00Z",
    review_status: "reviewed",
    status: "active",
    is_synthetic: true,
  },
  {
    id: "josephine:pasta",
    restaurant: { id: "josephine", name: "Josephine" },
    name: "Synthetic Pasta",
    description: null,
    description_provenance: null,
    price: null,
    price_provenance: null,
    variants: [],
    attributes: [],
    source_url: "https://example.com/menu",
    verified_at: "2026-09-17T12:00:00Z",
    review_status: "reviewed",
    status: "active",
    is_synthetic: true,
  },
];

const options = {
  city_id: "carmel-in",
  coverage_id: "central-carmel",
  default_radius_miles: 3,
  approximate: true,
  items: [
    { id: "midtown", label: "Midtown" },
    { id: "arts-design-district", label: "Arts & Design District" },
  ],
};

function distances(id: string) {
  const arts = id === "arts-design-district";
  return {
    city_id: "carmel-in",
    coverage_id: "central-carmel",
    preset: options.items.find((item) => item.id === id),
    approximate: true,
    distances: [
      { restaurant_id: "woodys-library", distance_miles: arts ? 0 : 0.3 },
      { restaurant_id: "josephine", distance_miles: null },
    ],
  };
}

async function mockLocationFlow(page: Page) {
  await page.route("**/api/dev/dishes", (route) => route.fulfill({ json: { items: dishes } }));
  await page.route("**/api/dev/locations", (route) => route.fulfill({ json: options }));
  await page.route("**/api/dev/locations/*/distances", (route) => {
    const presetId = new URL(route.request().url()).pathname.split("/").at(-2) ?? "";
    return route.fulfill({ json: distances(presetId) });
  });
}

for (const viewport of [{ width: 1280, height: 800 }, { width: 1440, height: 900 }]) {
  test(`changes approximate origin without changing cards at ${viewport.width}×${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.addInitScript(() => {
      Object.defineProperty(window, "__geolocationCalls", { value: 0, writable: true });
      navigator.geolocation.getCurrentPosition = () => { (window as unknown as { __geolocationCalls: number }).__geolocationCalls += 1; };
    });
    await mockLocationFlow(page);
    await page.goto("/dev/dishes");

    await expect(page.getByRole("heading", { name: "Synthetic Salad" })).toBeVisible();
    const headingsBefore = await page.locator("article h2").allTextContents();
    const midtown = page.getByRole("radio", { name: "Midtown" });
    await midtown.focus();
    await page.keyboard.press("Space");
    await expect(page.getByText("Approx. distance from Midtown: 0.3 mi")).toBeVisible();
    await expect(page.getByText("Approx. distance from Midtown: unknown")).toBeVisible();

    await page.getByRole("radio", { name: "Arts & Design District" }).check();
    await expect(page.getByText("Approx. distance from Arts & Design District: 0.0 mi")).toBeVisible();
    await expect(page.getByText("Approx. distance from Arts & Design District: unknown")).toBeVisible();
    expect(await page.locator("article h2").allTextContents()).toEqual(headingsBefore);
    expect(await page.evaluate(() => (window as unknown as { __geolocationCalls: number }).__geolocationCalls)).toBe(0);
    expect(await page.evaluate(() => sessionStorage.getItem("dishwise:guest-location:v1"))).toBe(
      JSON.stringify({ city_id: "carmel-in", coverage_id: "central-carmel", preset_id: "arts-design-district", radius_miles: 3 })
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

test("restores a valid session and discards corrupt storage", async ({ page }) => {
  await mockLocationFlow(page);
  await page.goto("/dev/dishes");
  await page.evaluate(() => sessionStorage.setItem("dishwise:guest-location:v1", JSON.stringify({
    city_id: "carmel-in", coverage_id: "central-carmel", preset_id: "midtown", radius_miles: 3,
  })));
  await page.reload();
  await expect(page.getByRole("radio", { name: "Midtown" })).toBeChecked();
  await expect(page.getByText("Approx. distance from Midtown: 0.3 mi")).toBeVisible();

  await page.evaluate(() => sessionStorage.setItem("dishwise:guest-location:v1", "{bad json"));
  await page.reload();
  await expect(page.getByRole("radio", { name: "Midtown" })).not.toBeChecked();
  await expect(page.getByRole("radio", { name: "Arts & Design District" })).not.toBeChecked();
  await expect(page.getByText("This choice will last for this page only because session storage is unavailable.")).toHaveCount(0);
  expect(await page.evaluate(() => sessionStorage.getItem("dishwise:guest-location:v1"))).toBeNull();
});

test("keeps cards visible when distance loading fails and retries", async ({ page }) => {
  let failing = true;
  await page.route("**/api/dev/dishes", (route) => route.fulfill({ json: { items: dishes } }));
  await page.route("**/api/dev/locations", (route) => route.fulfill({ json: options }));
  await page.route("**/api/dev/locations/*/distances", (route) => {
    if (failing) return route.fulfill({ status: 503, json: { detail: "unavailable" } });
    return route.fulfill({ json: distances("midtown") });
  });
  await page.goto("/dev/dishes");
  await page.getByRole("radio", { name: "Midtown" }).check();
  await expect(page.getByText("Approximate distances from Midtown are unavailable.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Synthetic Salad" })).toBeVisible();
  failing = false;
  await page.getByRole("button", { name: "Retry distances" }).click();
  await expect(page.getByText("Approx. distance from Midtown: 0.3 mi")).toBeVisible();
});

test("ignores a slow response from an earlier location selection", async ({ page }) => {
  await page.route("**/api/dev/dishes", (route) => route.fulfill({ json: { items: dishes } }));
  await page.route("**/api/dev/locations", (route) => route.fulfill({ json: options }));
  await page.route("**/api/dev/locations/*/distances", async (route) => {
    const presetId = new URL(route.request().url()).pathname.split("/").at(-2) ?? "";
    if (presetId === "midtown") await new Promise((resolve) => setTimeout(resolve, 400));
    return route.fulfill({ json: distances(presetId) });
  });
  await page.goto("/dev/dishes");
  await page.getByRole("radio", { name: "Midtown" }).check();
  await page.getByRole("radio", { name: "Arts & Design District" }).check();
  await expect(page.getByText("Approx. distance from Arts & Design District: 0.0 mi")).toBeVisible();
  await page.waitForTimeout(500);
  await expect(page.getByText(/Approx\. distance from Midtown/)).toHaveCount(0);
});

test("falls back to page memory when session storage is blocked", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "sessionStorage", { get() { throw new DOMException("blocked"); } });
  });
  await mockLocationFlow(page);
  await page.goto("/dev/dishes");
  await page.getByRole("radio", { name: "Midtown" }).check();
  await expect(page.getByText("This choice will last for this page only because session storage is unavailable.")).toBeVisible();
  await expect(page.getByText("Approx. distance from Midtown: 0.3 mi")).toBeVisible();
});

test("shows a recoverable location-options failure without hiding cards", async ({ page }) => {
  let failing = true;
  await page.route("**/api/dev/dishes", (route) => route.fulfill({ json: { items: dishes } }));
  await page.route("**/api/dev/locations", (route) => {
    if (failing) return route.fulfill({ json: { items: [{ id: "incomplete" }] } });
    return route.fulfill({ json: options });
  });
  await page.goto("/dev/dishes");
  await expect(page.getByText("Location choices are unavailable.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Synthetic Salad" })).toBeVisible();
  failing = false;
  await page.getByRole("button", { name: "Retry locations" }).click();
  await expect(page.getByRole("radio", { name: "Midtown" })).toBeVisible();
});
