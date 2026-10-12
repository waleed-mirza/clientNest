import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test("unauthenticated visitors cannot open deliverables, invoices, or notifications", async ({
  page,
}) => {
  await page.goto("/app/invoices");
  await expect(page).toHaveURL(/\/(login|onboarding|signup)/);

  await page.goto("/app/notifications");
  await expect(page).toHaveURL(/\/(login|onboarding|signup)/);

  await page.goto("/app/deliverables/51111111-aaaa-4111-8111-aaaaaaaaaaa1");
  await expect(page).toHaveURL(/\/(login|onboarding|signup)/);
});

test("demo owner can submit a deliverable, send an invoice, and the client can decide", async ({
  page,
  browser,
}) => {
  test.skip(Boolean(process.env.CI), "Needs the hosted Harbor Studio seed users.");
  test.setTimeout(120_000);

  await page.goto("/login");
  await page.getByLabel("Email").fill("sam.reed@example.com");
  await page.getByLabel("Password").fill("Harbor-Demo-24");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/(app|onboarding)/);

  await page
    .getByRole("navigation", { name: "Workspace" })
    .getByRole("link", { name: /^Projects/ })
    .click();
  await page.getByRole("link", { name: "Seasonal menu site" }).first().click();
  await page
    .getByRole("navigation", { name: "Project sections" })
    .getByRole("link", { name: "Deliverables" })
    .click();
  await expect(page.getByRole("heading", { name: "Deliverables" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Homepage hero v3" })).toBeVisible();

  const stamp = Date.now();
  const title = `Pastry case v${stamp}`;
  await page.getByRole("link", { name: "New deliverable" }).click();
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Note").fill("New pastry case crop for the autumn board.");
  await page.getByRole("button", { name: "Request approval" }).click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await expect(page.getByText("Awaiting approval")).toBeVisible();

  await page
    .getByRole("navigation", { name: "Workspace" })
    .getByRole("link", { name: /^Invoices/ })
    .click();
  await expect(page.getByRole("link", { name: "INV-2026-0041" })).toBeVisible();
  await page.getByRole("link", { name: "New invoice" }).click();
  await page
    .getByLabel("Project")
    .selectOption({ label: "Seasonal menu site · Pine & Oak Coffee" });
  await page.getByLabel("Description").fill(`Print proofs ${stamp}`);
  await page.getByLabel("Amount (USD)").fill("250.00");
  await page.getByRole("button", { name: "Create invoice" }).click();
  await expect(page.getByRole("heading", { name: /INV-2026-/ })).toBeVisible();
  await page.getByRole("button", { name: "Send invoice" }).click();
  await expect(page.getByRole("button", { name: "Mark as paid" })).toBeVisible();
  await expect(page.getByText("Sent", { exact: true }).first()).toBeVisible();
  const invoiceNumber =
    (await page.getByRole("heading", { name: /INV-2026-/ }).textContent()) ?? "";

  const clientPage = await browser.newPage();
  await clientPage.goto("/login");
  await clientPage.getByLabel("Email").fill("alex.marin@example.com");
  await clientPage.getByLabel("Password").fill("Harbor-Demo-24");
  await clientPage.getByRole("button", { name: "Sign in" }).click();
  await clientPage.waitForURL(/\/(app|onboarding)/);

  await expect(clientPage.getByRole("heading", { name: "Needs your decision" })).toBeVisible();
  await expect(clientPage.getByRole("link", { name: title })).toBeVisible();
  await clientPage.getByRole("link", { name: title }).click();
  await expect(clientPage.getByRole("heading", { name: title })).toBeVisible();
  await clientPage
    .getByLabel("Comment")
    .fill("The crop is closer. Please keep the croissant whole.");
  await clientPage.getByRole("button", { name: "Add comment" }).click();
  await expect(
    clientPage.getByText("The crop is closer. Please keep the croissant whole."),
  ).toBeVisible();
  await clientPage
    .getByLabel("Note (required for changes)")
    .fill("Keep the croissant whole in the crop.");
  await clientPage.getByRole("button", { name: "Request changes" }).click();
  await expect(clientPage.getByText("Keep the croissant whole in the crop.")).toBeVisible({
    timeout: 15_000,
  });
  await expect(clientPage.getByText("Changes requested", { exact: true }).first()).toBeVisible();

  await clientPage
    .getByRole("navigation", { name: "Workspace" })
    .getByRole("link", { name: /^Invoices/ })
    .click();
  await expect(clientPage.getByRole("link", { name: "INV-2026-0041" })).toBeVisible();
  if (invoiceNumber.trim()) {
    await expect(clientPage.getByRole("link", { name: invoiceNumber.trim() })).toBeVisible();
  }
  await clientPage.getByRole("link", { name: "INV-2026-0041" }).click();
  await expect(clientPage.getByText("Homepage design")).toBeVisible();
  await expect(clientPage.getByText("$2,450.00")).toBeVisible();
  await expect(clientPage.getByRole("button", { name: "Send invoice" })).toHaveCount(0);
  await clientPage.getByRole("link", { name: "Print view" }).click();
  await expect(clientPage.getByRole("heading", { name: "INV-2026-0041" })).toBeVisible();
  await expect(clientPage.getByText("This invoice is a record only.")).toBeVisible();

  await clientPage
    .getByRole("navigation", { name: "Workspace" })
    .getByRole("link", { name: /^Notifications/ })
    .click();
  await expect(clientPage.getByRole("heading", { name: "Notifications" })).toBeVisible();
  await clientPage.close();

  await page
    .getByRole("navigation", { name: "Workspace" })
    .getByRole("link", { name: /^Notifications/ })
    .click();
  await expect(page.getByText(`Changes requested on ${title}`)).toBeVisible();
});

test("demo client cannot create deliverables or invoices", async ({ page }) => {
  test.skip(Boolean(process.env.CI), "Needs the hosted Harbor Studio seed users.");

  await page.goto("/login");
  await page.getByLabel("Email").fill("alex.marin@example.com");
  await page.getByLabel("Password").fill("Harbor-Demo-24");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/(app|onboarding)/);

  await page.goto("/app/invoices/new");
  await expect(page.getByText("Only the agency team can create invoices.")).toBeVisible();

  await page.goto("/app");
  await page.getByRole("link", { name: "Seasonal menu site" }).first().click();
  await page
    .getByRole("navigation", { name: "Project sections" })
    .getByRole("link", { name: "Deliverables" })
    .click();
  await expect(page.getByRole("link", { name: "New deliverable" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Homepage hero v3" })).toBeVisible();
});
