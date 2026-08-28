import type { Membership } from "@/lib/db/schema";

export type MembershipEvent =
  | { kind: "lifetime-purchased" }
  | { kind: "subscription-active"; currentPeriodEnd: number | null }
  | { kind: "subscription-inactive" };

export type MembershipState = {
  membership: Membership;
  membershipUntil: Date | null;
};

/**
 * Stripe is the source of truth for entitlement; this is the only place that
 * decides what a Stripe event means for a user row. Pure, so the rules are
 * testable without a Stripe account.
 *
 * A lifetime purchase is terminal: no subscription event can revoke it.
 */
export function nextMembership(
  current: Membership,
  event: MembershipEvent,
): MembershipState {
  if (current === "lifetime") {
    return { membership: "lifetime", membershipUntil: null };
  }

  switch (event.kind) {
    case "lifetime-purchased":
      return { membership: "lifetime", membershipUntil: null };
    case "subscription-active":
      return {
        membership: "premium",
        membershipUntil: event.currentPeriodEnd
          ? new Date(event.currentPeriodEnd * 1000)
          : null,
      };
    case "subscription-inactive":
      return { membership: "free", membershipUntil: null };
  }
}

const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);

/** `past_due` keeps access while Stripe retries — dunning, not revocation. */
export function isActiveSubscriptionStatus(status: string): boolean {
  return ACTIVE_STATUSES.has(status);
}
