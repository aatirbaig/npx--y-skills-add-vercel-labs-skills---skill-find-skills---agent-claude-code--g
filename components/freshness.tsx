import { Chip } from "@/components/ui/chip";

const DAY = 86_400_000;

function daysUntil(iso: string): number {
  return Math.ceil((new Date(`${iso}T00:00:00Z`).getTime() - Date.now()) / DAY);
}

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(`${iso}T00:00:00Z`).getTime()) / DAY);
}

/**
 * Freshness signals, driven entirely by real fields.
 *
 * Both chips are deliberately conditional rather than decorative: "expiring"
 * needs a real `expiresAt` (no seed entry has one yet, so it renders for
 * nothing), and "just added" only fires when it actually distinguishes a deal —
 * a badge every row carries is noise, not urgency.
 */
export function FreshnessChip({
  verifiedAt,
  expiresAt,
  distinguishes = false,
}: {
  verifiedAt: string;
  expiresAt?: string;
  distinguishes?: boolean;
}) {
  if (expiresAt) {
    const left = daysUntil(expiresAt);
    if (left <= 0) return <Chip tone="quiet">Expired</Chip>;
    if (left <= 30) {
      return (
        <Chip tone="foil">
          {left} {left === 1 ? "day" : "days"} left
        </Chip>
      );
    }
  }

  if (distinguishes && daysSince(verifiedAt) <= 7) {
    return <Chip tone="foil">Just added</Chip>;
  }

  return null;
}

/** True only when the flag would separate some deals from others. */
export function newnessDistinguishes(verifiedDates: string[]): boolean {
  const fresh = verifiedDates.filter((d) => daysSince(d) <= 7).length;
  return fresh > 0 && fresh < verifiedDates.length;
}
