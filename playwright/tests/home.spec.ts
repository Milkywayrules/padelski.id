import { expect, test } from "@playwright/test";

test.describe("home page stub", () => {
  test.skip("renders Padelski title", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Padelski" })).toBeVisible();
  });
});
