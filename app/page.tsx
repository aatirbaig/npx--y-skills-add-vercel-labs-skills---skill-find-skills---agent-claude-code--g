import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  categoriesWithCounts,
  getAllDeals,
  latestDeals,
  totalSavingsUsd,
} from "@/lib/content/deals";
import { toCards } from "@/lib/content/redact";
import { DealIndex } from "@/components/deal-card";
import { VendorWall } from "@/components/vendor-wall";
import { SavingsCalculator } from "@/components/savings-calculator";
import { ValueAnchor } from "@/components/value-anchor";
import { Container, Eyebrow, SectionHeading, Stat } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { CountUp } from "@/components/ui/count-up";
import { COLLECTIONS } from "@/content/collections";
import { PLANS } from "@/lib/stripe/plans";

export default function HomePage() {
  const deals = getAllDeals();
  const cards = toCards(deals);
  const total = totalSavingsUsd();
  const categories = categoriesWithCounts();
  const premium = deals.filter((d) => d.tier === "premium").length;
  const pending = deals.filter((d) => d.unverifiedSeed).length;

  return (
    <>
      {/* ---- thesis ---- */}
      <section className="border-b border-rule">
        <Container className="py-20 sm:py-28">
          <Eyebrow>Startup credits, grants &amp; discounts</Eyebrow>

          <h1 className="display mt-6 max-w-4xl text-5xl sm:text-7xl">
            Founders leave{" "}
            <span className="text-foil-ink">
              <CountUp to={total} prefix="$" />
            </span>{" "}
            <em>on the table.</em>
          </h1>

          <p className="lede mt-7">
            That is the combined stated maximum across the {deals.length} programs in this catalog.
            Every listing leads with who qualifies — because the disqualifying detail is usually in
            the last paragraph, discovered after you have spent the afternoon.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <ButtonLink href="/deals" size="lg">
              Browse the catalog
              <ArrowRight className="size-4" aria-hidden="true" />
            </ButtonLink>
            <ButtonLink href="/pricing" variant="quiet" size="lg">
              Membership — ${PLANS.annual.price}/year
            </ButtonLink>
          </div>

          <dl className="mt-16 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
            <Stat label="Programs" value={deals.length} size="sm" />
            <Stat label="Free to read" value={deals.length - premium} size="sm" />
            <Stat label="Behind membership" value={premium} size="sm" />
            <Stat label="Categories" value={categories.length} size="sm" />
          </dl>
        </Container>
      </section>

      {/* ---- who is in here ---- */}
      <section className="border-b border-rule">
        <Container className="py-16">
          <Reveal>
            <SectionHeading
              eyebrow="Every vendor in the catalog"
              title="No sign-up to see who is here"
              blurb={
                pending === deals.length
                  ? `All ${deals.length}, listed openly — and every one currently flagged pending re-check rather than carrying a verification date we have not earned.`
                  : `All ${deals.length} programs, listed openly${pending > 0 ? `, with ${pending} flagged pending re-check rather than carrying a verification date we have not earned` : ""}.`
              }
            />
          </Reveal>
          <Reveal delay={60}>
            <div className="mt-10">
              <VendorWall
                entries={deals.map((d) => ({
                  slug: d.slug,
                  vendor: d.vendor,
                  monogram: d.monogram,
                }))}
              />
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ---- the argument ---- */}
      <section className="border-b border-rule">
        <Container className="py-16">
          <Reveal>
            <SectionHeading
              eyebrow="What it is worth to you"
              title="Work out your own number"
              blurb="Tick the tools you already pay for. The figure is the vendors' own stated maximum — an upper bound, not a promise."
            />
          </Reveal>
          <Reveal delay={60}>
            <div className="mt-10">
              <SavingsCalculator deals={cards} />
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ---- the largest programs ---- */}
      <section className="border-b border-rule">
        <Container className="py-16">
          <SectionHeading
            eyebrow="Ranked by stated maximum"
            title="The largest programs"
            blurb="The numbers are real and the eligibility gets stricter as they climb. Both facts are on every listing."
            action={
              <ButtonLink href="/deals" variant="quiet" size="sm">
                All {deals.length} programs
              </ButtonLink>
            }
          />
          <div className="mt-10">
            <DealIndex deals={cards.slice(0, 6)} />
          </div>
        </Container>
      </section>

      {/* ---- categories as a ruled index ---- */}
      <section className="border-b border-rule">
        <Container className="py-16">
          <SectionHeading
            eyebrow="Browse by line item"
            title="Ten categories, mapped to an early-stage bill"
          />
          <ul className="mt-10 divide-y divide-rule border-y border-rule">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/category/${category.slug}`}
                  className="group flex items-baseline justify-between gap-6 py-5 transition-colors duration-[160ms] [transition-timing-function:var(--ease-out)]"
                >
                  <div className="min-w-0">
                    <h3 className="display text-2xl group-hover:text-foil-ink">{category.name}</h3>
                    <p className="mt-1 max-w-xl text-sm text-ink-soft">{category.blurb}</p>
                  </div>
                  <span data-figure className="shrink-0 text-sm text-ink-soft">
                    {category.count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ---- how it works ---- */}
      <section className="border-b border-rule bg-paper">
        <Container className="py-16">
          <SectionHeading eyebrow="How it works" title="Three steps, no scavenger hunt" />
          <ol className="mt-10 grid gap-px overflow-hidden rounded-[8px] border border-rule bg-rule sm:grid-cols-3">
            {[
              {
                n: "01",
                t: "Read the eligibility first",
                b: "Who qualifies is the first thing on every listing, not the last.",
              },
              {
                n: "02",
                t: "Claim the public ones free",
                b: "Anything a vendor publishes openly stays open here. No account, no click-to-reveal.",
              },
              {
                n: "03",
                t: "Unlock the negotiated ones",
                b: `${premium} programs run through a partner code or referral. That is what membership buys.`,
              },
            ].map((step) => (
              <li key={step.n} className="bg-ivory p-6">
                <span data-figure className="eyebrow">
                  {step.n}
                </span>
                <h3 className="display mt-3 text-xl">{step.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.b}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ---- collections ---- */}
      <section className="border-b border-rule">
        <Container className="py-16">
          <SectionHeading eyebrow="Collections" title="Questions founders actually ask" />
          <ul className="mt-10 divide-y divide-rule border-y border-rule">
            {COLLECTIONS.map((collection) => (
              <li key={collection.slug}>
                <Link
                  href={`/collections/${collection.slug}`}
                  className="group flex items-center justify-between gap-6 py-5"
                >
                  <div>
                    <h3 className="display text-2xl group-hover:text-foil-ink">
                      {collection.name}
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-ink-soft">{collection.blurb}</p>
                  </div>
                  <ArrowRight
                    className="size-4 shrink-0 text-ink-soft transition-transform duration-[160ms] [transition-timing-function:var(--ease-out)] group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ---- recently checked ---- */}
      <section className="border-b border-rule">
        <Container className="py-16">
          <SectionHeading eyebrow="Recently checked" title="Latest updates to the catalog" />
          <div className="mt-10">
            <DealIndex deals={toCards(latestDeals(3))} />
          </div>
        </Container>
      </section>

      {/* ---- close ---- */}
      <section>
        <Container className="py-20">
          <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
            <ValueAnchor available={total} />
            <ButtonLink href="/pricing" size="lg">
              See what membership unlocks
              <ArrowRight className="size-4" aria-hidden="true" />
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
