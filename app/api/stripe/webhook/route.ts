import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, stripeConfigured } from "@/lib/stripe/client";
import { applyMembershipEvent, findUserByStripeCustomer } from "@/lib/membership";
import { isActiveSubscriptionStatus } from "@/lib/stripe/membership";

export const runtime = "nodejs";

/**
 * `current_period_end` moved onto subscription items in recent Stripe API
 * versions. Read whichever the account's version provides.
 */
function periodEnd(subscription: Stripe.Subscription): number | null {
  const legacy = (subscription as unknown as { current_period_end?: number })
    .current_period_end;
  if (typeof legacy === "number") return legacy;
  const item = subscription.items?.data?.[0] as
    | { current_period_end?: number }
    | undefined;
  return typeof item?.current_period_end === "number" ? item.current_period_end : null;
}

async function userIdFor(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null,
  fallback?: string | null,
): Promise<string | null> {
  if (fallback) return fallback;
  const id = typeof customer === "string" ? customer : customer?.id;
  if (!id) return null;
  return (await findUserByStripeCustomer(id))?.id ?? null;
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!stripeConfigured || !secret || !signature) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    console.error("[stripe] signature verification failed:", error);
    return NextResponse.json({ error: "Bad signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = await userIdFor(
          session.customer,
          session.metadata?.userId ?? session.client_reference_id,
        );
        if (!userId) break;

        if (session.mode === "payment") {
          await applyMembershipEvent(userId, { kind: "lifetime-purchased" });
        } else if (session.mode === "subscription" && session.subscription) {
          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;
          const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
          await applyMembershipEvent(userId, {
            kind: "subscription-active",
            currentPeriodEnd: periodEnd(subscription),
          });
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const userId = await userIdFor(subscription.customer);
        if (!userId) break;

        const active =
          event.type !== "customer.subscription.deleted" &&
          isActiveSubscriptionStatus(subscription.status);

        await applyMembershipEvent(
          userId,
          active
            ? { kind: "subscription-active", currentPeriodEnd: periodEnd(subscription) }
            : { kind: "subscription-inactive" },
        );
        break;
      }

      default:
        break;
    }
  } catch (error) {
    // Return 500 so Stripe retries rather than dropping the entitlement change.
    console.error(`[stripe] failed handling ${event.type}:`, error);
    return NextResponse.json({ error: "Handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
