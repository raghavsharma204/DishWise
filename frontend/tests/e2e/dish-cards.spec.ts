import { expect, test } from "@playwright/test";

const dish = {
  id: "test-cafe:noodles",
  restaurant: { id: "test-cafe", name: "Test Cafe" },
  name: "Noodles <script>alert(1)</script>",
  description: null,
  description_provenance: null,
  price: null,
  price_provenance: null,
  variants: [{ label: "Small", price: { amount: "8.00", currency: "USD" }, provenance: "manually_reviewed" }],
  attributes: [{ kind: "spice", value: "spicy", provenance: "inferred" }],
  source_url: "javascript:alert(1)",
  verified_at: null,
  review_status: "reviewed",
  status: "active",
  is_synthetic: true,
};

for (const viewport of [{ width: 1280, height: 800 }, { width: 1440, height: 900 }]) {
  test(`renders one safe card at ${viewport.width}×${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.route("**/api/dev/dishes", (route) => route.fulfill({ json: { items: [dish] } }));
    await page.goto("/dev/dishes");
    await expect(page.getByRole("heading", { name: "Stored dish cards" })).toBeVisible();
    await expect(page.getByRole("heading", { name: dish.name })).toBeVisible();
    await expect(page.getByText("Base price unknown")).toBeVisible();
    await expect(page.getByText("Small: $8.00")).toBeVisible();
    await expect(page.getByText("spice: spicy (inferred, uncertain)")).toBeVisible();
    await expect(page.getByText("Menu source unavailable")).toBeVisible();
    await expect(page.locator("article script")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

test("shows empty and recoverable failure states", async ({ page }) => {
  let failing = true;
  await page.route("**/api/dev/dishes", (route) => {
    if (failing) return route.fulfill({ status: 503, json: { detail: "unavailable" } });
    return route.fulfill({ json: { items: [] } });
  });
  await page.goto("/dev/dishes");
  await expect(page.locator("section[role=alert]")).toContainText("catalog is unavailable");
  failing = false;
  await page.getByRole("button", { name: "Retry" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("No stored dishes are in this local catalog yet.")).toBeVisible();
});

test("rejects malformed catalog responses", async ({ page }) => {
  await page.route("**/api/dev/dishes", (route) => route.fulfill({ json: { items: [{ name: "Incomplete" }] } }));
  await page.goto("/dev/dishes");
  await expect(page.locator("section[role=alert]")).toContainText("catalog is unavailable");
});

test("shows loading and a safe source link", async ({ page }) => {
  await page.route("**/api/dev/dishes", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.fulfill({ json: { items: [{ ...dish, source_url: "https://example.com/menu" }] } });
  });
  await page.goto("/dev/dishes");
  await expect(page.getByRole("status", { name: "" })).toContainText("Loading stored dishes");
  await expect(page.getByRole("link", { name: "View menu source" })).toHaveAttribute("href", "https://example.com/menu");
});
