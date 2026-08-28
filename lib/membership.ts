import "server-only";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { nextMembership, type MembershipEvent } from "@/lib/stripe/membership";

/** Applies a Stripe event to a user row. Safe to replay. */
export async function applyMembershipEvent(
  userId: string,
  event: MembershipEvent,
): Promise<void> {
  const db = getDb();
  const rows = await db
    .select({ membership: schema.users.membership })
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  const current = rows[0]?.membership;
  if (!current) {
    console.error(`[membership] no user ${userId}`);
    return;
  }

  const next = nextMembership(current, event);
  await db
    .update(schema.users)
    .set({ membership: next.membership, membershipUntil: next.membershipUntil })
    .where(eq(schema.users.id, userId));
}

export async function findUserByStripeCustomer(customerId: string) {
  const rows = await getDb()
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.stripeCustomerId, customerId))
    .limit(1);
  return rows[0] ?? null;
}

export async function setStripeCustomerId(userId: string, customerId: string) {
  await getDb()
    .update(schema.users)
    .set({ stripeCustomerId: customerId })
    .where(eq(schema.users.id, userId));
}
