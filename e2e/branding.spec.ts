import { expect, test } from "@playwright/test";

test("color scheme toggle switches the document scheme", async ({ page }) => {
  test.skip(Boolean(process.env.CI), "Needs the hosted Harbor Studio seed users.");

  await page.goto("/login");
  await page.getByLabel("Email").fill("sam.reed@example.com");
  await page.getByLabel("Password").fill("Harbor-Demo-24");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/(app|onboarding)/);

  const scheme = page.locator("aside").getByRole("group", { name: "Color scheme" });
  await expect(scheme.getByRole("button", { name: "Dark" })).toBeVisible();
  await scheme.getByRole("button", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-color-scheme", "dark");
  await scheme.getByRole("button", { name: "Light" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-color-scheme", "light");
});

test("demo owner can open settings and switch a theme preset", async ({ page }) => {
  test.skip(Boolean(process.env.CI), "Needs the hosted Harbor Studio seed users.");

  await page.goto("/login");
  await page.getByLabel("Email").fill("sam.reed@example.com");
  await page.getByLabel("Password").fill("Harbor-Demo-24");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/(app|onboarding)/);

  await page
    .getByRole("navigation", { name: "Workspace" })
    .getByRole("link", { name: "Settings" })
    .click();
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  await page.getByRole("radio", { name: /Clay/ }).check();
  await page.getByRole("button", { name: "Save workspace" }).click();
  await expect(page.getByText("Workspace saved.")).toBeVisible();
  await expect(page.locator("[data-theme='clay']")).toBeVisible();
  await page.getByRole("radio", { name: /Harbor/ }).check();
  await page.getByRole("button", { name: "Save workspace" }).click();
  await expect(page.locator("[data-theme='harbor']")).toBeVisible();
});

test("demo client does not see Settings", async ({ page }) => {
  test.skip(Boolean(process.env.CI), "Needs the hosted Harbor Studio seed users.");

  await page.goto("/login");
  await page.getByLabel("Email").fill("alex.marin@example.com");
  await page.getByLabel("Password").fill("Harbor-Demo-24");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/(app|onboarding)/);

  await expect(
    page.getByRole("navigation", { name: "Workspace" }).getByRole("link", { name: "Settings" }),
  ).toHaveCount(0);

  await page.goto("/app/settings");
  await expect(page.getByText("Only the workspace owner can change the name")).toBeVisible();
});
