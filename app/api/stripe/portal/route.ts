import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getStripe, stripeConfigured } from "@/lib/stripe/client";
import { siteUrl } from "@/lib/site";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }
  if (!stripeConfigured || !user.stripeCustomerId) {
    return NextResponse.json(
      { error: "No billing account to manage yet." },
      { status: 503 },
    );
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${siteUrl()}/dashboard`,
  });

  return NextResponse.json({ url: session.url });
}
