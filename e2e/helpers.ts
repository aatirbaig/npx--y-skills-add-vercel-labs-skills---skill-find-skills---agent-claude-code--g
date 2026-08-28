import { readFile, rm } from "node:fs/promises";
import { createClient } from "@libsql/client";
import type { Page } from "@playwright/test";

const MAGIC_LINK_FILE = ".data/last-magic-link.txt";

/** The dev mailer writes the link to disk; poll until it lands. */
async function waitForMagicLink(timeoutMs = 15_000): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  let lastError: unknown;
  while (Date.now() < deadline) {
    try {
      const link = (await readFile(MAGIC_LINK_FILE, "utf8")).trim();
      if (link) return link;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`No magic link was written: ${String(lastError)}`);
}

const db = () =>
  createClient({ url: process.env.DATABASE_URL ?? "file:.data/foundersbee.db" });

/** The dev server holds the same SQLite file open, so a write can be blocked. */
async function write(sql: string, args: unknown[]) {
  for (let attempt = 0; attempt < 10; attempt++) {
    const client = db();
    try {
      await client.execute({ sql, args: args as never });
      return;
    } catch (error) {
      if (attempt === 9 || !String(error).includes("SQLITE_BUSY")) throw error;
      await new Promise((resolve) => setTimeout(resolve, 150));
    } finally {
      client.close();
    }
  }
}

/** Signs in through the real magic-link flow, reading the link off disk. */
export async function signIn(page: Page, email: string) {
  // Clear the previous link first: otherwise a slow write lets the poller read
  // a stale one and sign in as whoever the last test used.
  await rm(MAGIC_LINK_FILE, { force: true });

  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByRole("button", { name: /email me a link/i }).click();
  // Generous: the first hit on a route pays for compilation in dev.
  await page.waitForURL(/check-email/, { timeout: 60_000 });

  const link = await waitForMagicLink();
  await page.goto(link);
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

/**
 * Stands in for the Stripe webhook, which needs the Stripe CLI to exercise for
 * real. The mapping from a Stripe event to this value is unit-tested in
 * tests/membership.test.ts.
 */
export async function setMembership(
  email: string,
  membership: "free" | "premium" | "lifetime",
) {
  await write("UPDATE user SET membership = ? WHERE email = ?", [membership, email]);
}

export async function deleteUser(email: string) {
  await write("DELETE FROM user WHERE email = ?", [email]);
}
