import { expect, test } from "@playwright/test";

test("landing page shows the product promise", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign in", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Docs" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Read Quick Start" }).first()).toBeVisible();
  await expect(page.getByText("MIT licensed. You clone it, install it, and host it.")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Follow one project before you sign in." }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Open the dashboard mockup" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Open the folder. Make it your portal." }),
  ).toBeVisible();
  await expect(page.getByText("License rights")).toBeVisible();
  await expect(page.getByText("Hosting needs")).toBeVisible();
  await expect(page.getByText("Support scope")).toBeVisible();
  await expect(page.getByRole("link", { name: "Open an issue" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ask a question" })).toHaveCount(0);
  await expect(page.getByText("Join the waitlist")).toHaveCount(0);
});
