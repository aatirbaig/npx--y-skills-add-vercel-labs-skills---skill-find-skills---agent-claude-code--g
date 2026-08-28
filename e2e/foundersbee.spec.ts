import { expect, test } from "@playwright/test";
import { deleteUser, setMembership, signIn } from "./helpers";

const FREE_DEAL = "github-student-developer-pack";
const PREMIUM_DEAL = "notion-for-startups";
const PREMIUM_CLAIM_STEP = "Enter it on the Notion for Startups redemption page";
const EMAIL = "e2e@foundersbee.test";

test.describe("public catalog", () => {
  test("browses from the home page into a filtered catalog", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1, name: /every startup credit worth claiming/i }),
    ).toBeVisible();

    await page.getByRole("link", { name: /browse the catalog/i }).first().click();
    await page.waitForURL("**/deals");

    const counter = page.getByText(/\d+ programs/).first();
    await expect(counter).toBeVisible();

    await page.getByRole("button", { name: "Cloud & Hosting", exact: true }).click();
    await page.getByRole("button", { name: "Credits", exact: true }).click();
    await expect(page.getByRole("link", { name: /AWS Activate/ })).toBeVisible();

    await page.getByLabel("Search deals").fill("payroll");
    await expect(page.getByText(/nothing matches that yet/i)).toBeVisible();

    await page.getByRole("button", { name: /clear filters/i }).click();
    await expect(page.getByRole("link", { name: /AWS Activate/ })).toBeVisible();
  });

  test("shows a free deal's claim route to an anonymous visitor", async ({ page }) => {
    await page.goto(`/deals/${FREE_DEAL}`);
    await expect(page.getByRole("heading", { name: /how to claim it/i })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /apply for the pack/i }),
    ).toBeVisible();
  });
});

test.describe("gating", () => {
  test("locks a premium deal and never sends its claim steps to the client", async ({
    page,
  }) => {
    const response = await page.goto(`/deals/${PREMIUM_DEAL}`);
    const html = (await response?.text()) ?? "";

    // Public half: still indexable.
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Notion");
    expect(html).toContain("Up to $6,000 off the Plus plan");
    expect(html).toContain("Fewer than 50 employees");

    // Private half: absent from the payload entirely, not merely hidden.
    await expect(page.getByText(/the claim steps for this one are for members/i)).toBeVisible();
    expect(html).not.toContain(PREMIUM_CLAIM_STEP);
    expect(html).not.toContain("__ENV__");
  });

  test("unlocks for a member and stays locked for a signed-in free user", async ({ page }) => {
    await deleteUser(EMAIL);
    await signIn(page, EMAIL);

    // Signing in is not the same as paying.
    await page.goto(`/deals/${PREMIUM_DEAL}`);
    await expect(page.getByText(/the claim steps for this one are for members/i)).toBeVisible();

    await setMembership(EMAIL, "premium");

    const response = await page.goto(`/deals/${PREMIUM_DEAL}`);
    const html = (await response?.text()) ?? "";
    await expect(page.getByRole("heading", { name: /how to claim it/i })).toBeVisible();
    expect(html).toContain(PREMIUM_CLAIM_STEP);
  });
});

test.describe("member dashboard", () => {
  test("saves a deal and shows it on the dashboard", async ({ page }) => {
    await deleteUser(EMAIL);
    await signIn(page, EMAIL);
    await setMembership(EMAIL, "premium");

    await page.goto(`/deals/${PREMIUM_DEAL}`);
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByRole("button", { name: /saved/i })).toBeVisible();

    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /your dashboard/i })).toBeVisible();
    await expect(page.getByText("Premium", { exact: true }).first()).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Notion for Startups/ }).first(),
    ).toBeVisible();
  });

  test("redirects an anonymous visitor away from the dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/\/login/);
  });
});
