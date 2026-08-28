"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import type { DealCard } from "@/lib/content/redact";
import { PLANS } from "@/lib/stripe/plans";
import { buttonClass } from "@/components/ui/button";
import { formatUsdExact } from "@/lib/utils";
import { cn } from "@/lib/utils";

/**
 * Turns the catalog into a personal number.
 *
 * Honesty rules this component enforces:
 *  - It sums the vendors' own *stated maxima*, and says so in those words.
 *  - Programs whose value genuinely varies (savingsUsd 0) are counted
 *    separately rather than scored as zero or given an invented figure.
 *  - It only claims the membership pays for itself when the selection actually
 *    exceeds the price.
 */
export function SavingsCalculator({ deals }: { deals: DealCard[] }) {
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const options = useMemo(() => {
    const perVendor = new Map<string, number>();
    for (const deal of deals) {
      perVendor.set(deal.vendor, (perVendor.get(deal.vendor) ?? 0) + 1);
    }
    // Two Microsoft programs as two chips both reading "Microsoft" is a puzzle,
    // not a choice — name the program where the vendor alone is ambiguous.
    return [...deals]
      .sort((a, b) => b.savingsUsd - a.savingsUsd || a.vendor.localeCompare(b.vendor))
      .map((deal) => ({
        ...deal,
        label: (perVendor.get(deal.vendor) ?? 0) > 1 ? deal.name : deal.vendor,
      }));
  }, [deals]);

  const { total, varies } = useMemo(() => {
    let total = 0;
    let varies = 0;
    for (const deal of options) {
      if (!picked.has(deal.slug)) continue;
      if (deal.savingsUsd > 0) total += deal.savingsUsd;
      else varies += 1;
    }
    return { total, varies };
  }, [options, picked]);

  const price = PLANS.annual.price;
  const covered = total > price;
  const multiple = covered ? Math.round(total / price) : 0;

  function toggle(slug: string) {
    setPicked((current) => {
      const next = new Set(current);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  return (
    <div className="grid gap-px overflow-hidden rounded-[8px] border border-[#2b2519] bg-[#2b2519] lg:grid-cols-[1fr_20rem]">
      <div className="bg-ink p-6 sm:p-8">
        <p className="eyebrow text-foil-glow">Which of these do you already pay for?</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {options.map((deal) => {
            const on = picked.has(deal.slug);
            return (
              <button
                key={deal.slug}
                type="button"
                onClick={() => toggle(deal.slug)}
                aria-pressed={on}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm",
                  "transition-[background-color,border-color,color,transform] duration-[160ms]",
                  "[transition-timing-function:var(--ease-out)] active:scale-[0.97]",
                  on
                    ? "border-foil-glow bg-foil-glow text-ink"
                    : "border-[#3a3323] text-[#c9c1ae] hover:border-[#584d34] hover:text-ivory",
                )}
              >
                {on ? <Check className="size-3.5" aria-hidden="true" /> : null}
                {deal.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col justify-between gap-6 bg-[#1b1710] p-6 sm:p-8">
        <div>
          <p className="eyebrow text-[#8d8471]">Combined stated maximum</p>
          <p
            data-figure
            aria-live="polite"
            className="display mt-2 text-5xl text-ivory"
          >
            {formatUsdExact(total)}
          </p>
          {varies > 0 ? (
            <p className="mt-2 text-sm text-[#a89e88]">
              plus {varies} {varies === 1 ? "program" : "programs"} whose value varies
            </p>
          ) : null}
        </div>

        <div className="border-t border-[#332c1e] pt-5">
          {picked.size === 0 ? (
            <p className="text-sm text-[#a89e88]">
              Pick the tools you use to see what the catalog states they are worth.
            </p>
          ) : covered ? (
            <p className="text-sm text-[#c9c1ae]">
              Membership is{" "}
              <span data-figure className="font-semibold text-ivory">
                ${price}
              </span>
              . Your selection states{" "}
              <span data-figure className="font-semibold text-foil-glow">
                {multiple.toLocaleString("en-US")}×
              </span>{" "}
              that.
            </p>
          ) : (
            <p className="text-sm text-[#a89e88]">
              Membership is{" "}
              <span data-figure className="font-semibold text-ivory">
                ${price}
              </span>
              . Add a cloud or AI program — that is where the large numbers are.
            </p>
          )}

          <Link href="/pricing" className={buttonClass("inverted", "md", "mt-4 w-full")}>
            See what premium unlocks
          </Link>
        </div>
      </div>
    </div>
  );
}
