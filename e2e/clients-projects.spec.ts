import { expect, test } from "@playwright/test";

test("unauthenticated visitors cannot open clients or projects", async ({ page }) => {
  await page.goto("/app/clients");
  await expect(page).toHaveURL(/\/(login|onboarding|signup)/);

  await page.goto("/app/projects");
  await expect(page).toHaveURL(/\/(login|onboarding|signup)/);
});

test("demo owner can manage clients and projects", async ({ page }) => {
  test.skip(Boolean(process.env.CI), "Needs the hosted Harbor Studio seed users.");
  test.setTimeout(120_000);

  await page.goto("/login");
  await page.getByLabel("Email").fill("sam.reed@example.com");
  await page.getByLabel("Password").fill("Harbor-Demo-24");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/(app|onboarding)/);

  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Workspace" }).getByRole("link", { name: /^Clients/ }),
  ).toBeVisible();

  await page
    .getByRole("navigation", { name: "Workspace" })
    .getByRole("link", { name: /^Clients/ })
    .click();
  await expect(page.getByRole("heading", { name: "Clients" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Pine & Oak Coffee" })).toBeVisible();

  await page.getByRole("link", { name: "Pine & Oak Coffee" }).click();
  await expect(page.getByRole("heading", { name: "Pine & Oak Coffee" })).toBeVisible();

  const clientSections = page.getByRole("navigation", { name: "Client sections" });
  await expect(clientSections.getByRole("link", { name: "Overview" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page.getByRole("button", { name: "Save client" })).toBeVisible();
  await expect(page.getByText("Alex Marin")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Seasonal menu site" })).toHaveCount(0);

  await clientSections.getByRole("link", { name: "Contacts" }).click();
  await expect(page).toHaveURL(/tab=contacts/);
  await expect(page.getByText("Alex Marin")).toBeVisible();
  await expect(page.getByRole("button", { name: "Save client" })).toHaveCount(0);

  await clientSections.getByRole("link", { name: "Projects" }).click();
  await expect(page.getByRole("link", { name: "Seasonal menu site" })).toBeVisible();

  await clientSections.getByRole("link", { name: "Invoices" }).click();
  await expect(page.getByRole("link", { name: "INV-2026-0041" })).toBeVisible();

  const company = `Cedar Bakery ${Date.now()}`;
  await page
    .getByRole("navigation", { name: "Workspace" })
    .getByRole("link", { name: /^Clients/ })
    .click();
  await page.getByRole("link", { name: "New client" }).click();
  await page.getByLabel("Company name").fill(company);
  await page.getByRole("button", { name: "Create client" }).click();
  await expect(page.getByRole("heading", { name: company })).toBeVisible();

  await page.getByRole("button", { name: "Archive client" }).click();
  await expect(page.getByText("Client archived.")).toBeVisible();

  await page
    .getByRole("navigation", { name: "Workspace" })
    .getByRole("link", { name: /^Projects/ })
    .click();
  await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Seasonal menu site" })).toBeVisible();

  await page.getByRole("link", { name: "Seasonal menu site" }).click();
  await expect(page.getByRole("heading", { name: "Seasonal menu site" })).toBeVisible();
  await expect(
    page
      .locator("span")
      .filter({ hasText: /^Awaiting approval$/ })
      .first(),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Pine & Oak Coffee" })).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: "Riley Chen" }).first()).toBeVisible();

  const projectName = `Window display ${Date.now()}`;
  await page
    .getByRole("navigation", { name: "Workspace" })
    .getByRole("link", { name: /^Projects/ })
    .click();
  await page.getByRole("link", { name: "New project" }).click();
  await page.getByLabel("Project name").fill(projectName);
  await page.getByLabel("Client").selectOption({ label: "North Shore Dental" });
  await page.getByRole("button", { name: "Create project" }).click();
  await expect(page.getByRole("heading", { name: projectName })).toBeVisible();
});

test("demo client only sees assigned company projects", async ({ page }) => {
  test.skip(Boolean(process.env.CI), "Needs the hosted Harbor Studio seed users.");

  await page.goto("/login");
  await page.getByLabel("Email").fill("alex.marin@example.com");
  await page.getByLabel("Password").fill("Harbor-Demo-24");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/(app|onboarding)/);

  const nav = page.getByRole("navigation", { name: "Workspace" });
  await expect(nav.getByRole("link", { name: /^Clients/ })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "Team" })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: /^Projects/ })).toBeVisible();

  await expect(page.getByRole("link", { name: "Seasonal menu site" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Brand refresh" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Launch landing page" })).toHaveCount(0);

  await page.goto("/app/clients");
  await expect(page.getByRole("status")).toContainText(
    "Client accounts don't have the agency client list",
  );

  await page.goto("/app/clients/11111111-cccc-4111-8111-ccccccccccc1");
  await expect(page.getByRole("status")).toContainText(
    "Client accounts don't have the agency client list",
  );

  await page.goto("/app/projects/new");
  await expect(page.getByRole("status")).toContainText(
    "Only agency team members can create projects",
  );

  await page.goto("/app/projects");
  await expect(page.getByRole("link", { name: "Seasonal menu site" })).toBeVisible();
  await expect(page.getByText("Brand refresh")).toHaveCount(0);

  await page.getByRole("link", { name: "Seasonal menu site" }).click();
  await expect(page.getByRole("heading", { name: "Seasonal menu site" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save project" })).toHaveCount(0);
});
