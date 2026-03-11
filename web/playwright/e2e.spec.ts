import { test, expect } from "@playwright/test";

test("landing page loads and has correct title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/EinfachVolley/);
  await expect(page.getByRole("link", { name: "Get Started Free" })).toBeVisible();
});

test("sign-in page is accessible", async ({ page }) => {
  await page.goto("/sign-in");
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
});
