import Link from "next/link";
import { HexMark } from "@/components/ui/hex-mark";

export type WallEntry = { slug: string; vendor: string; monogram: string };

/**
 * Who is actually in here — answered before anyone has to click. Monograms
 * rather than logo files: no third-party marks hosted, and it reads as one
 * designed set instead of twenty-five mismatched brand assets.
 */
export function VendorWall({ entries }: { entries: WallEntry[] }) {
  return (
    <ul className="grid grid-cols-4 overflow-hidden rounded-[6px] border-t border-l border-rule sm:grid-cols-5 lg:grid-cols-7">
      {entries.map((entry) => (
        <li key={entry.slug} className="border-r border-b border-rule bg-ivory">
          <Link
            href={`/deals/${entry.slug}`}
            title={entry.vendor}
            className="flex h-full flex-col items-center justify-center gap-2 px-2 py-5 transition-colors duration-[160ms] [transition-timing-function:var(--ease-out)] hover:bg-foil-wash"
          >
            <HexMark label={entry.monogram} size="md" />
            <span className="w-full truncate text-center text-[11px] text-ink-soft">
              {entry.vendor}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
