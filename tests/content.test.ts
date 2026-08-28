import { describe, expect, it } from "vitest";
import {
  getAllDeals,
  getDeal,
  getDealsByCategory,
  getCollectionDeals,
  totalSavingsUsd,
} from "@/lib/content/deals";
import { publicDeal, toCard, isMember } from "@/lib/content/redact";
import { CATEGORIES } from "@/content/categories";
import { COLLECTIONS } from "@/content/collections";
import { PLACEHOLDER } from "@/lib/content/redemptions";

const deals = getAllDeals();

describe("catalog", () => {
  it("loads and validates every deal file", () => {
    expect(deals.length).toBeGreaterThan(0);
  });

  it("has unique slugs", () => {
    const slugs = deals.map((d) => d.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("only references categories that exist", () => {
    const known = new Set(CATEGORIES.map((c) => c.slug));
    for (const deal of deals) {
      for (const category of deal.categories) {
        expect(known, `${deal.slug} references ${category}`).toContain(category);
      }
    }
  });

  it("has no expired deals in the catalog", () => {
    const today = new Date().toISOString().slice(0, 10);
    for (const deal of deals) {
      if (deal.expiresAt) {
        expect(deal.expiresAt >= today, `${deal.slug} expired on ${deal.expiresAt}`).toBe(true);
      }
    }
  });

  it("points every deal at an https source URL", () => {
    for (const deal of deals) {
      expect(deal.sourceUrl.startsWith("https://"), deal.slug).toBe(true);
    }
  });

  it("resolves each category and collection to at least one deal", () => {
    for (const category of CATEGORIES) {
      expect(getDealsByCategory(category.slug).length, category.slug).toBeGreaterThan(0);
    }
    for (const collection of COLLECTIONS) {
      expect(getCollectionDeals(collection.slug).length, collection.slug).toBeGreaterThan(0);
    }
  });

  it("computes the savings total from the catalog", () => {
    const expected = deals.reduce((sum, d) => sum + d.savingsUsd, 0);
    expect(totalSavingsUsd()).toBe(expected);
  });
});

describe("gating", () => {
  const anonymous = null;
  const freeUser = { membership: "free" } as const;
  const premiumUser = { membership: "premium" } as const;
  const lifetimeUser = { membership: "lifetime" } as const;

  it("treats premium and lifetime as members, free and anonymous as not", () => {
    expect(isMember(anonymous)).toBe(false);
    expect(isMember(freeUser)).toBe(false);
    expect(isMember(premiumUser)).toBe(true);
    expect(isMember(lifetimeUser)).toBe(true);
  });

  it("never leaks a premium deal's redemption to a non-member", () => {
    const premiumDeals = deals.filter((d) => d.tier === "premium");
    expect(premiumDeals.length).toBeGreaterThan(0);

    for (const deal of premiumDeals) {
      for (const viewer of [anonymous, freeUser]) {
        const dto = publicDeal(deal, viewer);
        const serialized = JSON.stringify(dto);

        expect(dto.locked).toBe(true);
        expect(dto.redemption).toBeNull();
        expect(dto.howToClaim).toBeNull();

        // The exact strings a non-member must never receive. `sourceUrl` is
        // deliberately public — the secret is the code, the claim steps, and
        // any partner-specific link that differs from the public source.
        if (deal.redemption.type === "code") {
          expect(serialized, deal.slug).not.toContain(deal.redemption.code);
        }
        if (deal.redemption.url !== deal.sourceUrl) {
          expect(serialized, deal.slug).not.toContain(deal.redemption.url);
        }
        for (const step of deal.howToClaim) {
          expect(serialized, deal.slug).not.toContain(step);
        }
      }
    }
  });

  it("unlocks free deals for anonymous visitors", () => {
    for (const deal of deals.filter((d) => d.tier === "free")) {
      const dto = publicDeal(deal, anonymous);
      expect(dto.locked, deal.slug).toBe(false);
      expect(dto.howToClaim, deal.slug).not.toBeNull();
    }
  });

  it("unlocks premium deals for members", () => {
    for (const deal of deals.filter((d) => d.tier === "premium")) {
      const dto = publicDeal(deal, premiumUser);
      expect(dto.locked, deal.slug).toBe(false);
      expect(dto.howToClaim, deal.slug).toEqual(deal.howToClaim);
    }
  });

  it("never hands out an unresolved placeholder code as if it worked", () => {
    for (const deal of deals) {
      const dto = publicDeal(deal, premiumUser);
      expect(JSON.stringify(dto.redemption ?? {})).not.toContain(PLACEHOLDER);
    }
  });

  it("keeps redemption data out of list cards entirely", () => {
    for (const deal of deals) {
      const serialized = JSON.stringify(toCard(deal));
      if (deal.redemption.url !== deal.sourceUrl) {
        expect(serialized, deal.slug).not.toContain(deal.redemption.url);
      }
      if (deal.redemption.type === "code") {
        expect(serialized, deal.slug).not.toContain(deal.redemption.code);
      }
      expect(serialized, deal.slug).not.toContain("redemption");
    }
  });

  it("keeps claim steps out of the public long-form body", () => {
    // The body is public on every deal page, so it must not restate the steps
    // that gating removes.
    for (const deal of deals.filter((d) => d.tier === "premium")) {
      for (const step of deal.howToClaim) {
        expect(deal.body, `${deal.slug} body repeats a gated claim step`).not.toContain(step);
      }
    }
  });
});

describe("lookup helpers", () => {
  it("finds a deal by slug and returns undefined otherwise", () => {
    expect(getDeal(deals[0].slug)?.slug).toBe(deals[0].slug);
    expect(getDeal("no-such-deal")).toBeUndefined();
  });
});
