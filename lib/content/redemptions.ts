import "server-only";
import type { Redemption } from "./schema";

/**
 * This repository is public, and redemption codes and partner links are the
 * paid product. The catalog in content/deals/*.md therefore carries
 * placeholders; the real values are injected at runtime from REDEMPTIONS_JSON,
 * a JSON object keyed by deal slug:
 *
 *   {"vercel-pro-credit":{"code":"REALCODE","url":"https://..."}}
 *
 * A deal whose placeholder is still in place is treated as unresolved and is
 * never presented as a working code.
 */
export const PLACEHOLDER = "__ENV__";

type Override = { code?: string; url?: string };

let cache: Record<string, Override> | null = null;

function overrides(): Record<string, Override> {
  if (cache) return cache;
  const raw = process.env.REDEMPTIONS_JSON;
  if (!raw) return (cache = {});
  try {
    const parsed: unknown = JSON.parse(raw);
    cache =
      parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, Override>)
        : {};
  } catch {
    console.error("[redemptions] REDEMPTIONS_JSON is not valid JSON — ignoring it.");
    cache = {};
  }
  return cache;
}

export function isPlaceholder(redemption: Redemption): boolean {
  if (redemption.type === "code") return redemption.code === PLACEHOLDER;
  return redemption.url.includes(PLACEHOLDER);
}

/** Resolves a deal's redemption against REDEMPTIONS_JSON. */
export function resolveRedemption(slug: string, redemption: Redemption): Redemption {
  const override = overrides()[slug];
  if (!override) return redemption;
  if (redemption.type === "code") {
    return {
      ...redemption,
      code: override.code ?? redemption.code,
      url: override.url ?? redemption.url,
    };
  }
  return { ...redemption, url: override.url ?? redemption.url };
}
