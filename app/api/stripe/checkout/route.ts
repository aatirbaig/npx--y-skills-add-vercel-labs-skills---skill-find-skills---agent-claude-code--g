import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getStripe, stripeConfigured } from "@/lib/stripe/client";
import { PLANS, priceIdFor, type PlanId } from "@/lib/stripe/plans";
import { setStripeCustomerId } from "@/lib/membership";
import { siteUrl } from "@/lib/site";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  const plan = (body as { plan?: string } | null)?.plan;
  if (plan !== "annual" && plan !== "lifetime") {
    return NextResponse.json({ error: "Unknown plan." }, { status: 400 });
  }

  const price = priceIdFor(plan as PlanId);
  if (!stripeConfigured || !price) {
    return NextResponse.json(
      { error: "Checkout is not configured on this deployment yet." },
      { status: 503 },
    );
  }

  const stripe = getStripe();

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await setStripeCustomerId(user.id, customerId);
  }

  const session = await stripe.checkout.sessions.create({
    mode: PLANS[plan].mode,
    customer: customerId,
    line_items: [{ price, quantity: 1 }],
    client_reference_id: user.id,
    metadata: { userId: user.id, plan },
    success_url: `${siteUrl()}/dashboard?welcome=1`,
    cancel_url: `${siteUrl()}/pricing?cancelled=1`,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
