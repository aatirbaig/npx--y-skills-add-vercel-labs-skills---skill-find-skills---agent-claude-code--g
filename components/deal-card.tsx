import Link from "next/link";
import { Lock } from "lucide-react";
import type { DealCard as DealCardData } from "@/lib/content/redact";
import { DEAL_TYPE_LABELS } from "@/lib/content/schema";
import { CATEGORIES } from "@/content/categories";
import { HexMark } from "@/components/ui/hex-mark";
import { Badge } from "@/components/ui/badge";

const CATEGORY_NAMES = new Map(CATEGORIES.map((c) => [c.slug, c.name]));

export function DealCard({ deal }: { deal: DealCardData }) {
  return (
    <Link
      href={`/deals/${deal.slug}`}
      className="group flex h-full flex-col gap-4 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent/50"
    >
      <div className="flex items-start gap-3">
        <HexMark label={deal.monogram} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-muted">{deal.vendor}</p>
          <h3 className="truncate font-semibold tracking-tight group-hover:text-accent-strong">
            {deal.name}
          </h3>
        </div>
        {deal.tier === "premium" ? (
          <Badge tone="accent">
            <Lock className="size-3" aria-hidden="true" />
            Premium
          </Badge>
        ) : (
          <Badge>Free</Badge>
        )}
      </div>

      <p className="text-sm font-medium text-accent-strong">{deal.value}</p>
      <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted">{deal.tagline}</p>

      <div className="flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
        <Badge>{DEAL_TYPE_LABELS[deal.dealType]}</Badge>
        {deal.categories.slice(0, 2).map((c) => (
          <Badge key={c} tone="muted">
            {CATEGORY_NAMES.get(c) ?? c}
          </Badge>
        ))}
      </div>
    </Link>
  );
}

export function DealGrid({ deals }: { deals: DealCardData[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {deals.map((deal) => (
        <DealCard key={deal.slug} deal={deal} />
      ))}
    </div>
  );
}
