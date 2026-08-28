export type PlanId = "annual" | "lifetime";

export const PLANS = {
  annual: {
    id: "annual" as const,
    name: "Premium",
    price: 149,
    cadence: "per year",
    mode: "subscription" as const,
    blurb: "Every premium deal, all year, cancel whenever.",
    envPrice: "STRIPE_PRICE_ANNUAL",
  },
  lifetime: {
    id: "lifetime" as const,
    name: "Lifetime",
    price: 399,
    cadence: "once",
    mode: "payment" as const,
    blurb: "Pay once. Every deal FoundersBee ever negotiates, for as long as it exists.",
    envPrice: "STRIPE_PRICE_LIFETIME",
  },
} satisfies Record<PlanId, unknown> as Record<
  PlanId,
  {
    id: PlanId;
    name: string;
    price: number;
    cadence: string;
    mode: "subscription" | "payment";
    blurb: string;
    envPrice: string;
  }
>;

export const FREE_PLAN = {
  name: "Free",
  price: 0,
  cadence: "forever",
  blurb: "Every public program, with the eligibility rules and the fine print.",
};

export function priceIdFor(plan: PlanId): string | undefined {
  return process.env[PLANS[plan].envPrice];
}
