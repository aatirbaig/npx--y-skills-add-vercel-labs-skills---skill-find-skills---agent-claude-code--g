"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getCurrentUser, getViewer } from "@/lib/session";
import { getDb, schema } from "@/lib/db/client";
import { getDeal } from "@/lib/content/deals";
import { canUnlock } from "@/lib/content/redact";

export async function toggleSaved(dealSlug: string): Promise<{ saved: boolean }> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Sign in to save a deal.");
  if (!getDeal(dealSlug)) throw new Error("Unknown deal.");

  const db = getDb();
  const where = and(
    eq(schema.savedDeals.userId, user.id),
    eq(schema.savedDeals.dealSlug, dealSlug),
  );

  const existing = await db.select().from(schema.savedDeals).where(where).limit(1);

  if (existing.length > 0) {
    await db.delete(schema.savedDeals).where(where);
    revalidatePath("/dashboard");
    revalidatePath(`/deals/${dealSlug}`);
    return { saved: false };
  }

  await db.insert(schema.savedDeals).values({ userId: user.id, dealSlug });
  revalidatePath("/dashboard");
  revalidatePath(`/deals/${dealSlug}`);
  return { saved: true };
}

/**
 * Recorded when a member actually reveals a redemption. Re-checks entitlement
 * server-side rather than trusting that the button was rendered.
 */
export async function recordClaim(dealSlug: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  const deal = getDeal(dealSlug);
  if (!deal) return;

  const viewer = await getViewer();
  if (!canUnlock(deal, viewer)) return;

  await getDb()
    .insert(schema.claims)
    .values({ userId: user.id, dealSlug })
    .onConflictDoNothing();

  revalidatePath("/dashboard");
}
