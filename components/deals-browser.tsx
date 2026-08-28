"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { DealCard as DealCardData } from "@/lib/content/redact";
import { DEAL_TYPE_LABELS, dealTypes, type DealType } from "@/lib/content/schema";
import { CATEGORIES, type CategorySlug } from "@/content/categories";
import { DealIndex } from "@/components/deal-card";
import { cn, formatUsdExact } from "@/lib/utils";

type TierFilter = "all" | "free" | "premium";

/** A few hundred entries filter fine in memory — no search service, no request per keystroke. */
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
    <div>
      <div className="relative border-b border-rule pb-6">
        <Search
          className="pointer-events-none absolute top-3.5 left-0 size-4 text-ink-soft"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Search ${deals.length} programs`}
          aria-label="Search deals"
          className="display h-12 w-full border-0 bg-transparent pl-7 text-2xl outline-none placeholder:text-ink-soft/60"
        />
      </div>

      <div className="flex flex-col gap-3 py-6">
        <FilterRow label="Category">
          <Chip active={category === "all"} onClick={() => setCategory("all")}>
            All
          </Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c.slug} active={category === c.slug} onClick={() => setCategory(c.slug)}>
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

      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 border-t border-rule py-4 text-sm">
        <span aria-live="polite" className="text-ink-soft">
          <strong data-figure className="font-semibold text-ink">
            {results.length}
          </strong>{" "}
          {results.length === 1 ? "program" : "programs"}
          {totalValue > 0 ? (
            <>
              {" · "}
              <strong data-figure className="font-semibold text-ink">
                {formatUsdExact(totalValue)}
              </strong>{" "}
              stated
            </>
          ) : null}
        </span>
        {filtered ? (
          <button
            type="button"
            onClick={reset}
            className="ml-auto inline-flex items-center gap-1.5 text-ink-soft transition-colors duration-[160ms] [transition-timing-function:var(--ease-out)] hover:text-ink"
          >
            <X className="size-3.5" aria-hidden="true" />
            Clear
          </button>
        ) : null}
      </div>

      {results.length > 0 ? (
        <DealIndex deals={results} />
      ) : (
        <div className="border-y border-rule px-6 py-24 text-center">
          <p className="display text-2xl">Nothing matches that yet.</p>
          <p className="mt-2 text-sm text-ink-soft">
            Try a broader category, or{" "}
            <button
              type="button"
              onClick={reset}
              className="text-foil-ink underline underline-offset-4"
            >
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
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
      <span className="eyebrow w-20 shrink-0 text-ink-soft">{label}</span>
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
        "rounded-full border px-3 py-1 text-xs font-medium",
        "transition-[background-color,border-color,color,transform] duration-[160ms]",
        "[transition-timing-function:var(--ease-out)] active:scale-[0.97]",
        active
          ? "border-ink bg-ink text-ivory"
          : "border-rule bg-paper text-ink-soft hover:border-rule-strong hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
