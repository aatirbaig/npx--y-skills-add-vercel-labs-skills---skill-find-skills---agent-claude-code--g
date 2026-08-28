import type { Metadata } from "next";
import { Check } from "lucide-react";
import { getAllDeals, totalSavingsUsd } from "@/lib/content/deals";
import { toCards } from "@/lib/content/redact";
import { FREE_PLAN, PLANS } from "@/lib/stripe/plans";
import { stripeConfigured } from "@/lib/stripe/client";
import { Container, Eyebrow, SectionHeading } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { CheckoutButton } from "@/components/checkout-button";
import { Chip } from "@/components/ui/chip";
import { SavingsCalculator } from "@/components/savings-calculator";
import { formatUsdExact } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Membership — free to browse, premium unlocks the codes",
  description:
    "FoundersBee is free to read. Membership unlocks the partner codes and claim routes on the negotiated programs, at $149 a year or $399 once.",
  alternates: { canonical: "/pricing" },
};

const FREE_FEATURES = [
  "Every program in the catalog, with its eligibility rules",
  "Search, filters, category and collection pages",
  "Direct links to each vendor's official page",
  "Claim steps for every publicly available program",
];

const PREMIUM_FEATURES = [
  "Partner codes and referral routes on the negotiated programs",
  "Step-by-step claim instructions on every listing",
  "Saved programs and a record of what you have claimed",
  "New programs as they are added",
];

export default function PricingPage() {
  const deals = getAllDeals();
  const premium = deals.filter((d) => d.tier === "premium");
  const premiumValue = premium.reduce((sum, d) => sum + d.savingsUsd, 0);
  const ratio = Math.round(totalSavingsUsd() / PLANS.annual.price);

  return (
    <>
      <section className="border-b border-rule">
        <Container className="py-20">
          <div className="max-w-3xl">
            <Eyebrow>Membership</Eyebrow>
            <h1 className="display mt-5 text-5xl sm:text-6xl">
              Free to read. You pay only for the parts we negotiated.
            </h1>
            <p className="lede mt-6">
              Anything a vendor publishes openly stays free here — no click-to-reveal, no email
              wall. Membership covers the {premium.length} programs that run through a partner code
              or referral route, worth a stated {formatUsdExact(premiumValue)}.
            </p>
            <p className="mt-6 text-sm text-ink-soft">
              The catalog states{" "}
              <span data-figure className="font-semibold text-ink">
                {formatUsdExact(totalSavingsUsd())}
              </span>{" "}
              in total —{" "}
              <span data-figure className="font-semibold text-foil-ink">
                {ratio.toLocaleString("en-US")}×
              </span>{" "}
              the annual price.
            </p>
          </div>

          {!stripeConfigured ? (
            <p className="mt-10 max-w-xl rounded-[6px] border border-dashed border-rule-strong bg-paper px-4 py-3 text-sm text-ink-soft">
              Checkout is not configured on this deployment. Set the Stripe keys in the environment
              to take payments.
            </p>
          ) : null}

          <div className="mt-14 grid gap-px overflow-hidden rounded-[8px] border border-rule bg-rule lg:grid-cols-3">
            <PlanCard
              name={FREE_PLAN.name}
              price={FREE_PLAN.price}
              cadence={FREE_PLAN.cadence}
              blurb={FREE_PLAN.blurb}
              features={FREE_FEATURES}
              action={
                <ButtonLink href="/deals" variant="quiet" size="lg" className="w-full">
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
              action={<CheckoutButton plan="annual">Get membership</CheckoutButton>}
            />

            <PlanCard
              name={PLANS.lifetime.name}
              price={PLANS.lifetime.price}
              cadence={PLANS.lifetime.cadence}
              blurb={PLANS.lifetime.blurb}
              features={[...PREMIUM_FEATURES, "No renewal, ever"]}
              action={
                <CheckoutButton plan="lifetime" variant="quiet">
                  Buy lifetime
                </CheckoutButton>
              }
            />
          </div>
        </Container>
      </section>

      <section className="border-b border-rule">
        <Container className="py-16">
          <SectionHeading
            eyebrow="Before you decide"
            title="Work out what it is worth to you"
            blurb="Tick the tools you already pay for. Figures are the vendors' own stated maxima."
          />
          <div className="mt-10">
            <SavingsCalculator deals={toCards(deals)} />
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-16">
          <div className="max-w-2xl">
            <SectionHeading eyebrow="Straight answers" title="Questions people actually ask" />
            <dl className="mt-10 divide-y divide-rule border-y border-rule">
              <Faq q="Do I need to pay to see the deals?">
                No. Every program, its value and its eligibility rules are public. Membership
                unlocks the claim route on the {premium.length} programs that run through a partner
                code or referral rather than a public sign-up page.
              </Faq>
              <Faq q="Will I definitely qualify?">
                No, and we say so on each listing. Eligibility is set by the vendor, not by us — the
                large cloud programs in particular gate on funding stage and referral source. Read
                the eligibility block before you spend an afternoon applying.
              </Faq>
              <Faq q="What happens when my year is up?">
                Membership renews annually and you can cancel any time from the billing portal.
                Cancelling stops the renewal and returns you to the free tier at the end of the
                period. Lifetime never renews.
              </Faq>
              <Faq q="Are these numbers guaranteed?">
                They are the vendor&rsquo;s own stated maxima, not a promise. Most programs award
                less than their ceiling, and terms change without notice. If a listing no longer
                matches the vendor page, tell us and we will correct it.
              </Faq>
            </dl>
          </div>
        </Container>
      </section>
    </>
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
      className={`flex flex-col p-7 sm:p-8 ${highlight ? "bg-ink text-ivory" : "bg-ivory"}`}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="display text-2xl">{name}</h2>
        {highlight ? <Chip tone="foil">Most popular</Chip> : null}
      </div>

      <p className="mt-6 flex items-baseline gap-2">
        <span data-figure className="display text-6xl">
          ${price}
        </span>
        <span className={`text-sm ${highlight ? "text-[#a89e88]" : "text-ink-soft"}`}>
          {cadence}
        </span>
      </p>

      <p className={`mt-4 text-sm leading-relaxed ${highlight ? "text-[#c9c1ae]" : "text-ink-soft"}`}>
        {blurb}
      </p>

      <ul className="mt-8 flex-1 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex gap-3 text-sm leading-relaxed">
            <Check
              className={`mt-0.5 size-4 shrink-0 ${highlight ? "text-foil-glow" : "text-foil"}`}
              aria-hidden="true"
            />
            <span className={highlight ? "text-[#c9c1ae]" : "text-ink-soft"}>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8">{action}</div>
    </div>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div className="py-6">
      <dt className="display text-xl">{q}</dt>
      <dd className="mt-2 leading-relaxed text-ink-soft">{children}</dd>
    </div>
  );
}
