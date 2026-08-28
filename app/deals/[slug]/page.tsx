import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { marked } from "marked";
import { ArrowUpRight, BadgeCheck, CircleAlert } from "lucide-react";
import { getDeal, getRelatedDeals } from "@/lib/content/deals";
import { publicDeal, toCards } from "@/lib/content/redact";
import { getCurrentUser, getViewer } from "@/lib/session";
import { getDb, schema } from "@/lib/db/client";
import { DEAL_TYPE_LABELS } from "@/lib/content/schema";
import { CATEGORIES } from "@/content/categories";
import { Container, Eyebrow, SectionHeading } from "@/components/ui/section";
import { HexMark } from "@/components/ui/hex-mark";
import { Chip } from "@/components/ui/chip";
import { DealIndex } from "@/components/deal-card";
import { LockedPanel } from "@/components/locked-panel";
import { RedemptionPanel } from "@/components/redemption-panel";
import { SaveButton } from "@/components/save-button";
import { formatDate, formatUsdExact } from "@/lib/utils";
import { siteUrl } from "@/lib/site";

const CATEGORY_NAMES = new Map(CATEGORIES.map((c) => [c.slug, c.name]));

export async function generateMetadata(
  props: PageProps<"/deals/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const deal = getDeal(slug);
  if (!deal) return {};

  const title = `${deal.name} — ${deal.value}`;
  return {
    title,
    description: deal.tagline,
    alternates: { canonical: `/deals/${deal.slug}` },
    openGraph: { title, description: deal.tagline, url: siteUrl(`/deals/${deal.slug}`) },
  };
}

async function isSaved(userId: string | undefined, slug: string): Promise<boolean> {
  if (!userId) return false;
  try {
    const rows = await getDb()
      .select()
      .from(schema.savedDeals)
      .where(
        and(eq(schema.savedDeals.userId, userId), eq(schema.savedDeals.dealSlug, slug)),
      )
      .limit(1);
    return rows.length > 0;
  } catch {
    return false;
  }
}

export default async function DealPage(props: PageProps<"/deals/[slug]">) {
  const { slug } = await props.params;
  const raw = getDeal(slug);
  if (!raw) notFound();

  const [viewer, user] = await Promise.all([getViewer(), getCurrentUser()]);
  const deal = publicDeal(raw, viewer);
  const saved = await isSaved(user?.id, slug);
  const related = getRelatedDeals(raw);
  const html = marked.parse(deal.body, { async: false });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Offer",
    name: deal.name,
    description: deal.tagline,
    url: siteUrl(`/deals/${deal.slug}`),
    category: deal.categories.map((c) => CATEGORY_NAMES.get(c)).join(", "),
    seller: { "@type": "Organization", name: deal.vendor, url: deal.sourceUrl },
    availability: "https://schema.org/InStock",
    ...(deal.savingsUsd > 0
      ? {
          priceSpecification: {
            "@type": "PriceSpecification",
            price: deal.savingsUsd,
            priceCurrency: "USD",
            valueAddedTaxIncluded: false,
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Container className="py-12">
        <nav aria-label="Breadcrumb" className="text-sm text-ink-soft">
          <Link href="/deals" className="hover:text-ink">
            Catalog
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span className="text-ink">{deal.name}</span>
        </nav>

        <header className="mt-10 flex flex-wrap items-start gap-6 border-b border-rule pb-10">
          <HexMark label={deal.monogram} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-ink-soft">{deal.vendor}</p>
            <h1 className="display mt-1 text-4xl sm:text-6xl">{deal.name}</h1>
            <p className="display mt-4 text-2xl text-foil-ink sm:text-3xl">{deal.value}</p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Chip tone={deal.tier === "premium" ? "foil" : "quiet"}>
                {deal.tier === "premium" ? "Premium" : "Free"}
              </Chip>
              <Chip tone="quiet">{DEAL_TYPE_LABELS[deal.dealType]}</Chip>
              {deal.categories.map((c) => (
                <Link key={c} href={`/category/${c}`}>
                  <Chip tone="bare" className="hover:text-ink">
                    {CATEGORY_NAMES.get(c) ?? c}
                  </Chip>
                </Link>
              ))}
            </div>
          </div>
        </header>

        <div className="mt-12 grid gap-14 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <article>
            <p className="lede">{deal.tagline}</p>

            <section className="mt-12">
              <Eyebrow as="h2">Who qualifies</Eyebrow>
              <ul className="mt-5 divide-y divide-rule border-y border-rule">
                {deal.eligibility.map((rule) => (
                  <li key={rule} className="flex gap-4 py-4">
                    <BadgeCheck
                      className="mt-0.5 size-4 shrink-0 text-foil"
                      aria-hidden="true"
                    />
                    <span className="leading-relaxed text-ink-soft">{rule}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="sr-only">How to claim</h2>
              {deal.locked || !deal.howToClaim ? (
                <LockedPanel signedIn={Boolean(user)} statedValue={deal.savingsUsd} />
              ) : (
                <div className="rounded-[8px] border border-rule bg-paper p-7 sm:p-8">
                  <Eyebrow as="h3">How to claim it</Eyebrow>
                  <ol className="mt-5 divide-y divide-rule">
                    {deal.howToClaim.map((step, index) => (
                      <li key={step} className="flex gap-4 py-4 first:pt-0">
                        <span data-figure className="text-xs text-foil-ink">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="leading-relaxed text-ink-soft">{step}</span>
                      </li>
                    ))}
                  </ol>

                  <div className="mt-7 border-t border-rule pt-6">
                    {deal.redemption ? (
                      <RedemptionPanel dealSlug={deal.slug} redemption={deal.redemption} />
                    ) : (
                      <a
                        href={deal.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-foil-ink underline underline-offset-4"
                      >
                        Apply on {deal.vendor}&rsquo;s site
                        <ArrowUpRight className="size-4" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </section>

            <div className="prose-deal mt-14" dangerouslySetInnerHTML={{ __html: html }} />
          </article>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[8px] border border-rule bg-paper p-6">
              <Eyebrow as="h2">At a glance</Eyebrow>
              <dl className="mt-4 divide-y divide-rule text-sm">
                <Row label="Stated value">
                  {deal.savingsUsd > 0 ? formatUsdExact(deal.savingsUsd) : "Varies"}
                </Row>
                <Row label="Type">{DEAL_TYPE_LABELS[deal.dealType]}</Row>
                <Row label="Access">{deal.tier === "premium" ? "Premium" : "Free"}</Row>
                {deal.expiresAt ? <Row label="Expires">{formatDate(deal.expiresAt)}</Row> : null}
              </dl>

              <a
                href={deal.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-1.5 text-sm text-foil-ink underline underline-offset-4"
              >
                Official program page
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </a>

              {user ? (
                <div className="mt-5">
                  <SaveButton dealSlug={deal.slug} initialSaved={saved} />
                </div>
              ) : null}
            </div>

            <div className="rounded-[8px] border border-rule bg-foil-wash p-5 text-sm">
              {deal.unverifiedSeed ? (
                <p className="flex gap-2.5 text-ink-soft">
                  <CircleAlert className="mt-0.5 size-4 shrink-0 text-foil" aria-hidden="true" />
                  <span>
                    Pending re-check. Written from {deal.vendor}&rsquo;s public documentation and
                    not yet re-confirmed against the live page.{" "}
                    <Link href="/editorial-policy" className="underline underline-offset-2">
                      What that means
                    </Link>
                    .
                  </span>
                </p>
              ) : (
                <p className="flex gap-2.5 text-ink-soft">
                  <BadgeCheck className="mt-0.5 size-4 shrink-0 text-foil" aria-hidden="true" />
                  <span>Checked against the vendor page on {formatDate(deal.verifiedAt)}.</span>
                </p>
              )}
            </div>
          </aside>
        </div>

        {related.length > 0 ? (
          <section className="mt-24">
            <SectionHeading title="Related programs" />
            <div className="mt-8">
              <DealIndex deals={toCards(related)} />
            </div>
          </section>
        ) : null}
      </Container>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3 first:pt-0">
      <dt className="text-ink-soft">{label}</dt>
      <dd data-figure className="text-right font-medium">
        {children}
      </dd>
    </div>
  );
}
