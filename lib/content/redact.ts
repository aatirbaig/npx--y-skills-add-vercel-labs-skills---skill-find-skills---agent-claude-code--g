import "server-only";
import type { Deal, DealFrontmatter, PublicDeal } from "./schema";
import { isPlaceholder, resolveRedemption } from "./redemptions";

export type Viewer = { membership: "free" | "premium" | "lifetime" } | null;

/** A member is anyone whose Stripe state currently entitles them to premium. */
export function isMember(viewer: Viewer): boolean {
  return viewer?.membership === "premium" || viewer?.membership === "lifetime";
}

export function canUnlock(deal: Pick<Deal, "tier">, viewer: Viewer): boolean {
  return deal.tier === "free" || isMember(viewer);
}

/**
 * The ONLY path from the catalog to a rendered page.
 *
 * Everything public — vendor, name, headline value, category — stays public so
 * the page is indexable and honest about what is on offer. The redemption
 * payload and the step-by-step claim instructions are stripped server-side for
 * anyone who has not earned them, so they are absent from the HTML and from the
 * React flight data, not merely hidden with CSS.
 */
export function publicDeal(deal: Deal, viewer: Viewer): PublicDeal {
  const { redemption, howToClaim, ...rest } = deal;
  const unlocked = canUnlock(deal, viewer);

  if (!unlocked) {
    return { ...rest, locked: true, howToClaim: null, redemption: null };
  }

  const resolved = resolveRedemption(deal.slug, redemption);
  return {
    ...rest,
    locked: false,
    howToClaim,
    // An unresolved placeholder is not a working code: show the claim steps and
    // the official source instead of handing over a string that will not work.
    redemption: isPlaceholder(resolved) ? null : resolved,
  };
}

export type DealCard = Pick<
  DealFrontmatter,
  | "slug"
  | "vendor"
  | "name"
  | "tagline"
  | "monogram"
  | "categories"
  | "dealType"
  | "tier"
  | "value"
  | "savingsUsd"
  | "verifiedAt"
  | "unverifiedSeed"
  | "expiresAt"
  | "featured"
>;

/** The slim shape lists and the client-side search index are allowed to hold. */
export function toCard(deal: Deal): DealCard {
  return {
    slug: deal.slug,
    vendor: deal.vendor,
    name: deal.name,
    tagline: deal.tagline,
    monogram: deal.monogram,
    categories: deal.categories,
    dealType: deal.dealType,
    tier: deal.tier,
    value: deal.value,
    savingsUsd: deal.savingsUsd,
    verifiedAt: deal.verifiedAt,
    unverifiedSeed: deal.unverifiedSeed,
    expiresAt: deal.expiresAt,
    featured: deal.featured,
  };
}

export function toCards(deals: Deal[]): DealCard[] {
  return deals.map(toCard);
}
