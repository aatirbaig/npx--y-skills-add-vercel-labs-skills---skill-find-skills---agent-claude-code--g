import Link from "next/link";
import { ArrowRight, BadgeCheck, Lock, ShieldQuestion } from "lucide-react";
import {
  categoriesWithCounts,
  getAllDeals,
  latestDeals,
  totalSavingsUsd,
} from "@/lib/content/deals";
import { toCards } from "@/lib/content/redact";
import { DealGrid } from "@/components/deal-card";
import { Container, SectionHeading } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { COLLECTIONS } from "@/content/collections";
import { PLANS } from "@/lib/stripe/plans";
import { formatUsd } from "@/lib/utils";

export default function HomePage() {
  const deals = getAllDeals();
  const categories = categoriesWithCounts();
  const featured = deals.filter((d) => d.featured).slice(0, 6);
  const premiumCount = deals.filter((d) => d.tier === "premium").length;

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="honeycomb pointer-events-none absolute inset-0"
          aria-hidden="true"
        />
        <Container className="relative py-20 sm:py-28">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 font-mono text-xs tracking-wider text-muted uppercase">
            <BadgeCheck className="size-3.5 text-accent-strong" aria-hidden="true" />
            {deals.length} programs · {formatUsd(totalSavingsUsd())} in stated value
          </p>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            Every startup credit worth claiming, with the fine print{" "}
            <span className="text-accent-strong">stated up front</span>.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted text-pretty">
            Cloud credits, non-dilutive grants and negotiated software discounts — each one
            with its eligibility rules, its catch, and a link to the vendor&rsquo;s own page.
            Browse the whole catalog free. Premium unlocks the codes.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/deals" size="lg">
              Browse the catalog
              <ArrowRight className="size-4" aria-hidden="true" />
            </ButtonLink>
            <ButtonLink href="/pricing" size="lg" variant="secondary">
              See premium — ${PLANS.annual.price}/yr
            </ButtonLink>
          </div>

          <dl className="mt-12 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-3">
            <Stat label="Programs tracked" value={String(deals.length)} />
            <Stat label="Stated value" value={formatUsd(totalSavingsUsd())} />
            <Stat label="Free to read" value={`${deals.length - premiumCount} of ${deals.length}`} />
          </dl>
        </Container>
      </section>

      <Container className="py-16">
        <SectionHeading
          eyebrow="Start here"
          title="Browse by what you're actually buying"
          blurb="Ten categories, mapped to the lines that actually appear on an early-stage bill."
        />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="group rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent/50"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-semibold tracking-tight group-hover:text-accent-strong">
                  {category.name}
                </h3>
                <span className="font-mono text-xs text-muted">{category.count}</span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{category.blurb}</p>
            </Link>
          ))}
        </div>
      </Container>

      <Container className="py-16">
        <SectionHeading
          eyebrow="The big ones"
          title="Largest programs in the catalog"
          blurb="Ranked by the vendor's own stated maximum. The numbers are real; the eligibility gets stricter as they climb."
          action={
            <ButtonLink href="/deals" variant="secondary" size="sm">
              All {deals.length} programs
            </ButtonLink>
          }
        />
        <div className="mt-8">
          <DealGrid deals={toCards(featured)} />
        </div>
      </Container>

      <section className="border-y border-border bg-surface py-16">
        <Container>
          <SectionHeading
            eyebrow="How it works"
            title="Three steps, no scavenger hunt"
          />
          <ol className="mt-8 grid gap-6 sm:grid-cols-3">
            <Step
              n="01"
              title="Read the eligibility first"
              body="Every listing leads with who qualifies, because most founders lose the afternoon before finding out they don't."
              icon={<ShieldQuestion className="size-5" aria-hidden="true" />}
            />
            <Step
              n="02"
              title="Claim the public programs free"
              body="Anything a vendor publishes openly stays open here — no account, no click-to-reveal, no email wall."
              icon={<BadgeCheck className="size-5" aria-hidden="true" />}
            />
            <Step
              n="03"
              title="Unlock the negotiated ones"
              body={`${premiumCount} programs need a partner code or referral route. Premium is where those live.`}
              icon={<Lock className="size-5" aria-hidden="true" />}
            />
          </ol>
        </Container>
      </section>

      <Container className="py-16">
        <SectionHeading
          eyebrow="Collections"
          title="Answers to the questions founders actually ask"
        />
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {COLLECTIONS.map((collection) => (
            <Link
              key={collection.slug}
              href={`/collections/${collection.slug}`}
              className="group flex items-start justify-between gap-4 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent/50"
            >
              <div>
                <h3 className="font-semibold tracking-tight group-hover:text-accent-strong">
                  {collection.name}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{collection.blurb}</p>
              </div>
              <ArrowRight
                className="mt-1 size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </Container>

      <Container className="pb-8">
        <SectionHeading eyebrow="Recently checked" title="Latest updates" />
        <div className="mt-8">
          <DealGrid deals={toCards(latestDeals(3))} />
        </div>
      </Container>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs tracking-wider text-muted uppercase">{label}</dt>
      <dd className="mt-1 font-mono text-2xl font-semibold tracking-tight">{value}</dd>
    </div>
  );
}

function Step({
  n,
  title,
  body,
  icon,
}: {
  n: string;
  title: string;
  body: string;
  icon: React.ReactNode;
}) {
  return (
    <li className="rounded-xl border border-border bg-bg p-5">
      <div className="flex items-center gap-3 text-accent-strong">
        {icon}
        <span className="font-mono text-xs tracking-widest">{n}</span>
      </div>
      <h3 className="mt-3 font-semibold tracking-tight">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
    </li>
  );
}
