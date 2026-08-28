import { describe, expect, it } from "vitest";
import {
  isActiveSubscriptionStatus,
  nextMembership,
} from "@/lib/stripe/membership";

const PERIOD_END = 1_800_000_000;

describe("nextMembership", () => {
  it("promotes a free user to premium when a subscription goes active", () => {
    expect(
      nextMembership("free", { kind: "subscription-active", currentPeriodEnd: PERIOD_END }),
    ).toEqual({ membership: "premium", membershipUntil: new Date(PERIOD_END * 1000) });
  });

  it("promotes a free user to lifetime on a one-off purchase", () => {
    expect(nextMembership("free", { kind: "lifetime-purchased" })).toEqual({
      membership: "lifetime",
      membershipUntil: null,
    });
  });

  it("drops a premium user back to free when the subscription ends", () => {
    expect(nextMembership("premium", { kind: "subscription-inactive" })).toEqual({
      membership: "free",
      membershipUntil: null,
    });
  });

  it("never revokes lifetime, whatever Stripe says about subscriptions", () => {
    for (const event of [
      { kind: "subscription-inactive" },
      { kind: "subscription-active", currentPeriodEnd: PERIOD_END },
      { kind: "lifetime-purchased" },
    ] as const) {
      expect(nextMembership("lifetime", event)).toEqual({
        membership: "lifetime",
        membershipUntil: null,
      });
    }
  });

  it("handles a subscription with no period end", () => {
    expect(
      nextMembership("free", { kind: "subscription-active", currentPeriodEnd: null }),
    ).toEqual({ membership: "premium", membershipUntil: null });
  });

  it("is idempotent — replaying the same event changes nothing", () => {
    const first = nextMembership("free", { kind: "lifetime-purchased" });
    const second = nextMembership(first.membership, { kind: "lifetime-purchased" });
    expect(second).toEqual(first);
  });
});

describe("isActiveSubscriptionStatus", () => {
  it("keeps access during dunning but not after a real failure", () => {
    expect(isActiveSubscriptionStatus("active")).toBe(true);
    expect(isActiveSubscriptionStatus("trialing")).toBe(true);
    expect(isActiveSubscriptionStatus("past_due")).toBe(true);
    expect(isActiveSubscriptionStatus("canceled")).toBe(false);
    expect(isActiveSubscriptionStatus("unpaid")).toBe(false);
    expect(isActiveSubscriptionStatus("incomplete_expired")).toBe(false);
  });
});
