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
import { Container, SectionHeading } from "@/components/ui/section";
import { HexMark } from "@/components/ui/hex-mark";
import { Badge } from "@/components/ui/badge";
import { DealGrid } from "@/components/deal-card";
import { LockedPanel } from "@/components/locked-panel";
import { RedemptionPanel } from "@/components/redemption-panel";
import { SaveButton } from "@/components/save-button";
import { formatDate, formatUsd } from "@/lib/utils";
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

      <Container className="py-10">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted">
          <Link href="/deals" className="hover:text-fg">
            Deals
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span className="text-fg">{deal.name}</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <article>
            <header className="flex flex-wrap items-start gap-4">
              <HexMark label={deal.monogram} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted">{deal.vendor}</p>
                <h1 className="mt-0.5 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                  {deal.name}
                </h1>
                <p className="mt-3 text-xl font-medium text-accent-strong text-pretty">
                  {deal.value}
                </p>
              </div>
            </header>

            <div className="mt-5 flex flex-wrap items-center gap-1.5">
              <Badge tone={deal.tier === "premium" ? "accent" : "neutral"}>
                {deal.tier === "premium" ? "Premium" : "Free"}
              </Badge>
              <Badge>{DEAL_TYPE_LABELS[deal.dealType]}</Badge>
              {deal.categories.map((c) => (
                <Link key={c} href={`/category/${c}`}>
                  <Badge tone="muted" className="hover:text-fg">
                    {CATEGORY_NAMES.get(c) ?? c}
                  </Badge>
                </Link>
              ))}
            </div>

            <p className="mt-6 text-lg leading-relaxed text-muted text-pretty">
              {deal.tagline}
            </p>

            <section className="mt-10 rounded-xl border border-border bg-surface p-6">
              <h2 className="text-lg font-semibold tracking-tight">Who qualifies</h2>
              <ul className="mt-4 space-y-2.5">
                {deal.eligibility.map((rule) => (
                  <li key={rule} className="flex gap-3 text-sm leading-relaxed text-muted">
                    <BadgeCheck
                      className="mt-0.5 size-4 shrink-0 text-accent-strong"
                      aria-hidden="true"
                    />
                    {rule}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="sr-only">How to claim</h2>
              {deal.locked || !deal.howToClaim ? (
                <LockedPanel signedIn={Boolean(user)} />
              ) : (
                <div className="rounded-xl border border-border bg-surface p-6">
                  <h3 className="text-lg font-semibold tracking-tight">How to claim it</h3>
                  <ol className="mt-4 space-y-3">
                    {deal.howToClaim.map((step, index) => (
                      <li key={step} className="flex gap-3 text-sm leading-relaxed text-muted">
                        <span className="mt-0.5 font-mono text-xs text-accent-strong">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>

                  <div className="mt-6">
                    {deal.redemption ? (
                      <RedemptionPanel dealSlug={deal.slug} redemption={deal.redemption} />
                    ) : (
                      <a
                        href={deal.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-accent-strong underline underline-offset-4"
                      >
                        Apply on {deal.vendor}&rsquo;s site
                        <ArrowUpRight className="size-4" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </section>

            <div
              className="prose-deal mt-10 max-w-none"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </article>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-border bg-surface p-5">
              <dl className="space-y-3 text-sm">
                <Row label="Stated value">
                  {deal.savingsUsd > 0 ? formatUsd(deal.savingsUsd) : "Varies"}
                </Row>
                <Row label="Type">{DEAL_TYPE_LABELS[deal.dealType]}</Row>
                <Row label="Access">{deal.tier === "premium" ? "Premium" : "Free"}</Row>
                {deal.expiresAt ? (
                  <Row label="Expires">{formatDate(deal.expiresAt)}</Row>
                ) : null}
              </dl>

              <a
                href={deal.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted underline underline-offset-4 hover:text-fg"
              >
                Official program page
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </a>

              {user ? (
                <div className="mt-4">
                  <SaveButton dealSlug={deal.slug} initialSaved={saved} />
                </div>
              ) : null}
            </div>

            <div className="rounded-xl border border-border bg-surface p-5 text-sm">
              {deal.unverifiedSeed ? (
                <p className="flex gap-2 text-muted">
                  <CircleAlert
                    className="mt-0.5 size-4 shrink-0 text-accent-strong"
                    aria-hidden="true"
                  />
                  <span>
                    Pending re-check. This entry was written from {deal.vendor}&rsquo;s public
                    documentation and has not been re-confirmed against the live page.{" "}
                    <Link href="/editorial-policy" className="underline underline-offset-2">
                      What that means
                    </Link>
                    .
                  </span>
                </p>
              ) : (
                <p className="flex gap-2 text-muted">
                  <BadgeCheck
                    className="mt-0.5 size-4 shrink-0 text-accent-strong"
                    aria-hidden="true"
                  />
                  <span>Checked against the vendor page on {formatDate(deal.verifiedAt)}.</span>
                </p>
              )}
            </div>
          </aside>
        </div>

        {related.length > 0 ? (
          <section className="mt-20">
            <SectionHeading title="Related programs" />
            <div className="mt-6">
              <DealGrid deals={toCards(related)} />
            </div>
          </section>
        ) : null}
      </Container>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}
