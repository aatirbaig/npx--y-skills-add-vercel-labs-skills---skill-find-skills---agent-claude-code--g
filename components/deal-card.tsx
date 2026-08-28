import Link from "next/link";
import { Lock } from "lucide-react";
import type { DealCard as DealCardData } from "@/lib/content/redact";
import { DEAL_TYPE_LABELS } from "@/lib/content/schema";
import { CATEGORIES } from "@/content/categories";
import { HexMark } from "@/components/ui/hex-mark";
import { Chip } from "@/components/ui/chip";
import { FreshnessChip, newnessDistinguishes } from "@/components/freshness";
import { formatUsdExact } from "@/lib/utils";

const CATEGORY_NAMES = new Map(CATEGORIES.map((c) => [c.slug, c.name]));

/**
 * The catalog reads as a ruled index rather than a field of boxes: hairlines
 * between rows, the value set in tabular figures on the right where the eye can
 * compare down the column.
 */
export function DealRow({
  deal,
  showNew = false,
}: {
  deal: DealCardData;
  showNew?: boolean;
}) {
  return (
    <li>
      <Link
        href={`/deals/${deal.slug}`}
        className="group grid grid-cols-[auto_1fr] items-start gap-x-4 gap-y-3 py-5 transition-colors duration-[160ms] [transition-timing-function:var(--ease-out)] sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-x-6"
      >
        <HexMark label={deal.monogram} />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="text-sm text-ink-soft">{deal.vendor}</span>
            {deal.tier === "premium" ? (
              <Chip tone="foil">
                <Lock className="size-3" aria-hidden="true" />
                Premium
              </Chip>
            ) : (
              <Chip tone="quiet">Free</Chip>
            )}
            <FreshnessChip
              verifiedAt={deal.verifiedAt}
              expiresAt={deal.expiresAt}
              distinguishes={showNew}
            />
          </div>

          <h3 className="display mt-1 text-2xl group-hover:text-foil-ink">{deal.name}</h3>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-soft">{deal.tagline}</p>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft">
            <span>{DEAL_TYPE_LABELS[deal.dealType]}</span>
            {deal.categories.map((c) => (
              <span key={c}>{CATEGORY_NAMES.get(c) ?? c}</span>
            ))}
          </div>
        </div>

        <div className="col-start-2 sm:col-start-3 sm:text-right">
          <p data-figure className="display text-2xl whitespace-nowrap sm:text-3xl">
            {deal.savingsUsd > 0 ? formatUsdExact(deal.savingsUsd) : "Varies"}
          </p>
          <p className="mt-0.5 text-xs text-ink-soft">stated maximum</p>
        </div>
      </Link>
    </li>
  );
}

export function DealIndex({ deals }: { deals: DealCardData[] }) {
  const showNew = newnessDistinguishes(deals.map((d) => d.verifiedAt));
  return (
    <ul className="divide-y divide-rule border-y border-rule">
      {deals.map((deal) => (
        <DealRow key={deal.slug} deal={deal} showNew={showNew} />
      ))}
    </ul>
  );
}

/** The card variant, for the few places a grid genuinely reads better. */
export function DealCardTile({ deal }: { deal: DealCardData }) {
  return (
    <Link
      href={`/deals/${deal.slug}`}
      className="group flex h-full flex-col gap-4 rounded-[8px] border border-rule bg-paper p-5 transition-[border-color,transform] duration-[160ms] [transition-timing-function:var(--ease-out)] hover:border-rule-strong"
    >
      <div className="flex items-start justify-between gap-3">
        <HexMark label={deal.monogram} />
        {deal.tier === "premium" ? (
          <Chip tone="foil">
            <Lock className="size-3" aria-hidden="true" />
            Premium
          </Chip>
        ) : (
          <Chip tone="quiet">Free</Chip>
        )}
      </div>

      <div className="flex-1">
        <p className="text-sm text-ink-soft">{deal.vendor}</p>
        <h3 className="display mt-0.5 text-xl group-hover:text-foil-ink">{deal.name}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-soft">{deal.tagline}</p>
      </div>

      <div className="flex items-baseline justify-between border-t border-rule pt-3">
        <span className="text-xs text-ink-soft">{DEAL_TYPE_LABELS[deal.dealType]}</span>
        <span data-figure className="display text-xl">
          {deal.savingsUsd > 0 ? formatUsdExact(deal.savingsUsd) : "Varies"}
        </span>
      </div>
    </Link>
  );
}

export function DealGrid({ deals }: { deals: DealCardData[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {deals.map((deal) => (
        <DealCardTile key={deal.slug} deal={deal} />
      ))}
    </div>
  );
}
