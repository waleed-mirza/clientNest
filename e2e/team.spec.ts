import { expect, test } from "@playwright/test";

test("demo owner can open team and see the invite form", async ({ page }) => {
  test.skip(Boolean(process.env.CI), "Needs the hosted Harbor Studio seed users.");

  await page.goto("/login");
  await page.getByLabel("Email").fill("sam.reed@example.com");
  await page.getByLabel("Password").fill("Harbor-Demo-24");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/(app|onboarding)/);
  await page.goto("/app/team");
  await expect(page.getByRole("heading", { name: "Team" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create invite" })).toBeVisible();
  await expect(page.getByText("Sam Reed")).toBeVisible();
});
