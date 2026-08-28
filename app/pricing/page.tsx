import type { Metadata } from "next";
import { Check } from "lucide-react";
import { getAllDeals } from "@/lib/content/deals";
import { FREE_PLAN, PLANS } from "@/lib/stripe/plans";
import { stripeConfigured } from "@/lib/stripe/client";
import { Container } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { CheckoutButton } from "@/components/checkout-button";
import { Badge } from "@/components/ui/badge";
import { formatUsd } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing — free to browse, premium unlocks the codes",
  description:
    "FoundersBee is free to read. Premium unlocks the partner codes and claim routes on the negotiated programs, at $149 a year or $399 once.",
  alternates: { canonical: "/pricing" },
};

const FREE_FEATURES = [
  "Every program in the catalog, with its eligibility rules",
  "Search, filters and category pages",
  "Direct links to each vendor's official page",
  "Claim steps for every publicly-available program",
];

const PREMIUM_FEATURES = [
  "Partner codes and referral routes on the negotiated programs",
  "Step-by-step claim instructions on every listing",
  "Saved deals and a record of what you've claimed",
  "New programs as they are added",
];

export default function PricingPage() {
  const deals = getAllDeals();
  const premium = deals.filter((d) => d.tier === "premium");
  const premiumValue = premium.reduce((sum, d) => sum + d.savingsUsd, 0);

  return (
    <Container className="py-16">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
          Free to read. Pay only for the parts we negotiated.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted text-pretty">
          Anything a vendor publishes openly stays free here — no click-to-reveal, no email
          wall. Premium covers the {premium.length} programs that need a partner code or a
          referral route, worth a stated {formatUsd(premiumValue)}.
        </p>
      </header>

      {!stripeConfigured ? (
        <p className="mx-auto mt-8 max-w-xl rounded-lg border border-dashed border-border bg-surface px-4 py-3 text-center text-sm text-muted">
          Checkout is not configured on this deployment. Set the Stripe keys in the
          environment to take payments.
        </p>
      ) : null}

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        <PlanCard
          name={FREE_PLAN.name}
          price={FREE_PLAN.price}
          cadence={FREE_PLAN.cadence}
          blurb={FREE_PLAN.blurb}
          features={FREE_FEATURES}
          action={
            <ButtonLink href="/deals" variant="secondary" size="lg" className="w-full">
              Browse the catalog
            </ButtonLink>
          }
        />

        <PlanCard
          highlight
          name={PLANS.annual.name}
          price={PLANS.annual.price}
          cadence={PLANS.annual.cadence}
          blurb={PLANS.annual.blurb}
          features={PREMIUM_FEATURES}
          action={
            <CheckoutButton plan="annual">
              Get premium
            </CheckoutButton>
          }
        />

        <PlanCard
          name={PLANS.lifetime.name}
          price={PLANS.lifetime.price}
          cadence={PLANS.lifetime.cadence}
          blurb={PLANS.lifetime.blurb}
          features={[...PREMIUM_FEATURES, "No renewal, ever"]}
          action={
            <CheckoutButton plan="lifetime" variant="secondary">
              Buy lifetime
            </CheckoutButton>
          }
        />
      </div>

      <section className="mx-auto mt-20 max-w-2xl">
        <h2 className="text-2xl font-semibold tracking-tight">Questions people actually ask</h2>
        <dl className="mt-6 divide-y divide-border border-y border-border">
          <Faq q="Do I need to pay to see the deals?">
            No. Every program, its value and its eligibility rules are public. Premium unlocks
            the claim route on the {premium.length} programs that run through a partner code
            or referral rather than a public sign-up page.
          </Faq>
          <Faq q="Will I definitely qualify for these programs?">
            No, and we say so on each listing. Eligibility is set by the vendor, not by us —
            the big cloud programs in particular are gated on funding stage and referral
            source. Read the eligibility block before you spend an afternoon applying.
          </Faq>
          <Faq q="What happens when my year is up?">
            Premium renews annually and you can cancel any time from the billing portal.
            Cancelling stops the renewal and returns you to the free tier at the end of the
            period. Lifetime never renews.
          </Faq>
          <Faq q="Are these numbers guaranteed?">
            They are the vendor&rsquo;s own stated maximums, not a promise. Most programs award
            less than their ceiling, and terms change without notice. If a listing no longer
            matches the vendor page, tell us and we will correct it.
          </Faq>
        </dl>
      </section>
    </Container>
  );
}

function PlanCard({
  name,
  price,
  cadence,
  blurb,
  features,
  action,
  highlight,
}: {
  name: string;
  price: number;
  cadence: string;
  blurb: string;
  features: string[];
  action: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex flex-col rounded-2xl border bg-surface p-6 ${
        highlight ? "border-accent" : "border-border"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold tracking-tight">{name}</h2>
        {highlight ? <Badge tone="accent">Most popular</Badge> : null}
      </div>

      <p className="mt-4 flex items-baseline gap-1.5">
        <span className="font-mono text-4xl font-semibold tracking-tight">${price}</span>
        <span className="text-sm text-muted">{cadence}</span>
      </p>

      <p className="mt-3 text-sm leading-relaxed text-muted">{blurb}</p>

      <ul className="mt-6 flex-1 space-y-2.5">
        {features.map((feature) => (
          <li key={feature} className="flex gap-2.5 text-sm leading-relaxed">
            <Check className="mt-0.5 size-4 shrink-0 text-accent-strong" aria-hidden="true" />
            <span className="text-muted">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6">{action}</div>
    </div>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div className="py-5">
      <dt className="font-medium">{q}</dt>
      <dd className="mt-1.5 text-sm leading-relaxed text-muted">{children}</dd>
    </div>
  );
}
