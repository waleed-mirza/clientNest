import { expect, test } from "@playwright/test";

test("docs index lists install guides", async ({ page }) => {
  await page.goto("/docs");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const nav = page.getByRole("navigation", { name: "Documentation" });
  await expect(nav.getByRole("link", { name: "Quick Start" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Environment reference" })).toBeVisible();
});

test("quick start has numbered install steps", async ({ page }) => {
  await page.goto("/docs/quick-start");
  await expect(page.getByRole("heading", { name: "Quick Start" })).toBeVisible();
  await expect(page.getByText("pnpm supabase:setup", { exact: true })).toBeVisible();
  const troubleshooting = page.getByRole("main").getByRole("link", { name: "Troubleshooting" });
  await expect(troubleshooting).toBeVisible();
  await expect(troubleshooting).toHaveAttribute("href", "/docs/troubleshooting");
});
