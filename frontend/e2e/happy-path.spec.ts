import { test, expect } from "@playwright/test";

test.describe("Happy Path", () => {
  test("should load the auth page for unauthenticated users", async ({
    page,
  }) => {
    await page.goto("/");

    // Unauthenticated users should be redirected to /auth
    await page.waitForURL("**/auth");

    // Verify the auth page has loaded
    await expect(page).toHaveURL(/\/auth/);

    // Check that the page has rendered something visible
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("should have correct page title", async ({ page }) => {
    await page.goto("/");

    // Verify that the page has a title
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test("should redirect unknown routes to auth", async ({ page }) => {
    await page.goto("/nonexistent-route");

    // Should redirect to auth for unauthenticated users
    await page.waitForURL("**/auth");
    await expect(page).toHaveURL(/\/auth/);
  });
});
