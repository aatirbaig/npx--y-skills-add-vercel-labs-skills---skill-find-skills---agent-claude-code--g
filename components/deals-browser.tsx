"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { DealCard as DealCardData } from "@/lib/content/redact";
import { DEAL_TYPE_LABELS, dealTypes, type DealType } from "@/lib/content/schema";
import { CATEGORIES, type CategorySlug } from "@/content/categories";
import { DealGrid } from "@/components/deal-card";
import { cn, formatUsd } from "@/lib/utils";

type TierFilter = "all" | "free" | "premium";

/**
 * The catalog is a few hundred entries, so filtering happens in memory on the
 * client. No search service, no request per keystroke.
 */
export function DealsBrowser({
  deals,
  initialCategory,
}: {
  deals: DealCardData[];
  initialCategory?: CategorySlug;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategorySlug | "all">(initialCategory ?? "all");
  const [dealType, setDealType] = useState<DealType | "all">("all");
  const [tier, setTier] = useState<TierFilter>("all");

  const deferredQuery = useDeferredValue(query);

  const results = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    return deals.filter((deal) => {
      if (category !== "all" && !deal.categories.includes(category)) return false;
      if (dealType !== "all" && deal.dealType !== dealType) return false;
      if (tier !== "all" && deal.tier !== tier) return false;
      if (!needle) return true;
      return (
        deal.name.toLowerCase().includes(needle) ||
        deal.vendor.toLowerCase().includes(needle) ||
        deal.tagline.toLowerCase().includes(needle) ||
        deal.value.toLowerCase().includes(needle)
      );
    });
  }, [deals, deferredQuery, category, dealType, tier]);

  const totalValue = results.reduce((sum, d) => sum + d.savingsUsd, 0);
  const filtered = category !== "all" || dealType !== "all" || tier !== "all" || query !== "";

  function reset() {
    setQuery("");
    setCategory("all");
    setDealType("all");
    setTier("all");
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Search ${deals.length} programs — AWS, payroll, GPU credits…`}
          aria-label="Search deals"
          className="h-12 w-full rounded-xl border border-border bg-surface pr-4 pl-10 text-sm outline-none placeholder:text-muted focus:border-accent"
        />
      </div>

      <div className="space-y-3">
        <FilterRow label="Category">
          <Chip active={category === "all"} onClick={() => setCategory("all")}>
            All
          </Chip>
          {CATEGORIES.map((c) => (
            <Chip
              key={c.slug}
              active={category === c.slug}
              onClick={() => setCategory(c.slug)}
            >
              {c.name}
            </Chip>
          ))}
        </FilterRow>

        <FilterRow label="Type">
          <Chip active={dealType === "all"} onClick={() => setDealType("all")}>
            All
          </Chip>
          {dealTypes.map((t) => (
            <Chip key={t} active={dealType === t} onClick={() => setDealType(t)}>
              {DEAL_TYPE_LABELS[t]}
            </Chip>
          ))}
        </FilterRow>

        <FilterRow label="Access">
          {(["all", "free", "premium"] as const).map((t) => (
            <Chip key={t} active={tier === t} onClick={() => setTier(t)}>
              {t === "all" ? "All" : t === "free" ? "Free" : "Premium"}
            </Chip>
          ))}
        </FilterRow>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-y border-border py-3 text-sm text-muted">
        <span aria-live="polite">
          <strong className="font-semibold text-fg">{results.length}</strong>{" "}
          {results.length === 1 ? "program" : "programs"}
          {totalValue > 0 ? (
            <>
              {" · "}
              <strong className="font-semibold text-fg">{formatUsd(totalValue)}</strong> in
              stated value
            </>
          ) : null}
        </span>
        {filtered ? (
          <button
            type="button"
            onClick={reset}
            className="ml-auto inline-flex items-center gap-1 text-muted hover:text-fg"
          >
            <X className="size-3.5" aria-hidden="true" />
            Clear filters
          </button>
        ) : null}
      </div>

      {results.length > 0 ? (
        <DealGrid deals={results} />
      ) : (
        <div className="honeycomb rounded-xl border border-dashed border-border bg-surface/40 px-6 py-20 text-center">
          <p className="font-medium">Nothing matches that yet.</p>
          <p className="mt-1 text-sm text-muted">
            Try a broader category, or{" "}
            <button type="button" onClick={reset} className="underline underline-offset-2">
              clear the filters
            </button>
            .
          </p>
        </div>
      )}
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 w-16 shrink-0 font-mono text-xs tracking-wider text-muted uppercase">
        {label}
      </span>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-accent bg-accent text-accent-fg"
          : "border-border bg-surface text-muted hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}
