import { PLANS } from "@/lib/stripe/plans";
import { formatUsdExact } from "@/lib/utils";

/**
 * The commercial argument, in one line: what the catalog states it is worth,
 * against what it costs to unlock. Repeated at every decision point.
 */
export function ValueAnchor({
  available,
  className,
}: {
  available: number;
  className?: string;
}) {
  const price = PLANS.annual.price;
  const multiple = Math.round(available / price);

  return (
    <div className={className}>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span data-figure className="display text-4xl sm:text-5xl">
          {formatUsdExact(available)}
        </span>
        <span className="text-ink-soft">stated across the catalog</span>
      </div>
      <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
        <span className="text-ink-soft">Unlocking it costs</span>
        <span data-figure className="text-base font-semibold">
          ${price}
        </span>
        <span className="text-ink-soft">a year —</span>
        <span data-figure className="font-semibold text-foil-ink">
          {multiple.toLocaleString("en-US")}× that
        </span>
      </div>
    </div>
  );
}

/**
 * The per-deal version, shown where someone actually hits the paywall.
 *
 * `tone` is required rather than defaulted: this renders on the inverted ink
 * panel, and taking the emphasis colour from the light token set there would
 * paint near-black figures onto a near-black ground.
 */
export function DealAnchor({
  statedValue,
  tone = "light",
}: {
  statedValue: number;
  tone?: "light" | "inverted";
}) {
  const price = PLANS.annual.price;
  if (statedValue <= price) return null;

  const emphasis = tone === "inverted" ? "text-ivory" : "text-ink";

  return (
    <p className="text-sm">
      This program alone states up to{" "}
      <span data-figure className={`font-semibold ${emphasis}`}>
        {formatUsdExact(statedValue)}
      </span>
      . Membership is{" "}
      <span data-figure className={`font-semibold ${emphasis}`}>
        ${price}
      </span>
      .
    </p>
  );
}
