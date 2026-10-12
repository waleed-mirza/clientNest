import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test("unauthenticated visitors cannot download files", async ({ page }) => {
  await page.goto("/app/files/11111111-eeee-4111-8111-eeeeeeeeeee1/download");
  await expect(page).toHaveURL(/\/(login|onboarding|signup)/);
});

test("demo owner can manage milestones, tasks, files, and activity", async ({ page, browser }) => {
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

  await expect(page.getByRole("heading", { name: "Seasonal menu site" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Milestones" })).toBeVisible();
  await expect(page.locator("summary").filter({ hasText: "Kickoff & sitemap" })).toBeVisible();
  await expect(page.locator("summary").filter({ hasText: "Revise hero headline" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Activity" })).toBeVisible();

  const stamp = Date.now();
  const milestone = `Content freeze ${stamp}`;
  await page.getByLabel("Milestone name").fill(milestone);
  await page.getByRole("button", { name: "Add milestone" }).click();
  await expect(page.getByText("Milestone added.")).toBeVisible();
  await expect(page.locator("summary").filter({ hasText: milestone })).toBeVisible();

  const task = `Proof print board ${stamp}`;
  await page.getByLabel("Task name").fill(task);
  await page.getByRole("button", { name: "Add task" }).click();
  await expect(page.getByText("Task added.")).toBeVisible();
  await expect(page.locator("summary").filter({ hasText: task })).toBeVisible();

  await page
    .getByRole("navigation", { name: "Project sections" })
    .getByRole("link", { name: "Files" })
    .click();

  const sharedName = `client-brief-${stamp}.txt`;
  await page.locator('input[name="file"]').setInputFiles({
    name: sharedName,
    mimeType: "text/plain",
    buffer: Buffer.from("Autumn tasting notes for the menu board."),
  });
  await page.getByRole("radio", { name: "Shared with client" }).check();
  await page.getByRole("button", { name: "Upload file" }).click();
  await expect(page.getByText("File uploaded.")).toBeVisible();
  await expect(page.getByRole("link", { name: sharedName })).toBeVisible();

  const teamName = `team-notes-${stamp}.txt`;
  await page.locator('input[name="file"]').setInputFiles({
    name: teamName,
    mimeType: "text/plain",
    buffer: Buffer.from("Internal print vendor notes."),
  });
  await page.getByRole("radio", { name: "Team only" }).check();
  await page.getByRole("button", { name: "Upload file" }).click();
  await expect(page.getByText("File uploaded.")).toBeVisible();
  await expect(page.getByRole("link", { name: teamName })).toBeVisible();
  await page
    .getByRole("navigation", { name: "Project sections" })
    .getByRole("link", { name: "Overview" })
    .click();
  await expect(page.getByText(`Sam Reed uploaded ${sharedName}`)).toBeVisible();

  await page.getByRole("link", { name: "Dashboard" }).click();
  await expect(page.getByRole("heading", { name: "Activity" })).toBeVisible();
  await expect(page.getByText(`Sam Reed uploaded ${sharedName}`)).toBeVisible();

  const clientPage = await browser.newPage();
  await clientPage.goto("/login");
  await clientPage.getByLabel("Email").fill("alex.marin@example.com");
  await clientPage.getByLabel("Password").fill("Harbor-Demo-24");
  await clientPage.getByRole("button", { name: "Sign in" }).click();
  await clientPage.waitForURL(/\/(app|onboarding)/);
  await clientPage.getByRole("link", { name: "Seasonal menu site" }).first().click();
  await clientPage
    .getByRole("navigation", { name: "Project sections" })
    .getByRole("link", { name: "Files" })
    .click();
  await expect(clientPage.getByRole("link", { name: sharedName })).toBeVisible();
  await expect(clientPage.getByRole("link", { name: teamName })).toHaveCount(0);
  await clientPage
    .getByRole("navigation", { name: "Project sections" })
    .getByRole("link", { name: "Overview" })
    .click();
  await expect(clientPage.getByText(`Sam Reed uploaded ${sharedName}`)).toBeVisible();
  await expect(clientPage.getByText(`Sam Reed uploaded ${teamName}`)).toHaveCount(0);
  await clientPage.close();
});

test("demo client sees shared files and cannot mutate workflow", async ({ page }) => {
  test.skip(Boolean(process.env.CI), "Needs the hosted Harbor Studio seed users.");

  await page.goto("/login");
  await page.getByLabel("Email").fill("alex.marin@example.com");
  await page.getByLabel("Password").fill("Harbor-Demo-24");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/(app|onboarding)/);

  await page.getByRole("link", { name: "Seasonal menu site" }).first().click();
  await expect(page.getByRole("heading", { name: "Seasonal menu site" })).toBeVisible();
  await expect(page.getByText("Kickoff & sitemap", { exact: true })).toBeVisible();
  await expect(page.getByText("Confirm allergen copy", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add milestone" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Upload file" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Save task" })).toHaveCount(0);
});
