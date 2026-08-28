import "server-only";
import Stripe from "stripe";

/** Stripe is optional in development; the site runs fine without it. */
export const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

let cached: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return (cached ??= new Stripe(key));
}
