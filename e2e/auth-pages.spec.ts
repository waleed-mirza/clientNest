import { expect, test } from "@playwright/test";

test("sign-in page has an email field", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
});

test("sign-up page has name, email, and password", async ({ page }) => {
  await page.goto("/signup");
  await expect(page.getByRole("heading", { name: "Create an account" })).toBeVisible();
  await expect(page.getByLabel("Your name")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
});

test("unknown invite token shows an empty state", async ({ page }) => {
  await page.goto("/invite/cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc");
  await expect(page.getByRole("heading", { name: /invite/i })).toBeVisible();
});
