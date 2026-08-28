import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { dealFrontmatterSchema, type Deal } from "./schema";
import { CATEGORIES, type CategorySlug } from "@/content/categories";
import { COLLECTIONS } from "@/content/collections";

const DEALS_DIR = path.join(process.cwd(), "content", "deals");

function load(): Deal[] {
  const files = fs
    .readdirSync(DEALS_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort();

  const deals: Deal[] = [];
  const problems: string[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(DEALS_DIR, file), "utf8");
    const { data, content } = matter(raw);
    const parsed = dealFrontmatterSchema.safeParse(data);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        problems.push(`${file}: ${issue.path.join(".") || "(root)"} — ${issue.message}`);
      }
      continue;
    }
    if (parsed.data.slug !== file.replace(/\.md$/, "")) {
      problems.push(`${file}: slug "${parsed.data.slug}" does not match the filename`);
      continue;
    }
    deals.push({ ...parsed.data, body: content.trim() });
  }

  const seen = new Set<string>();
  for (const deal of deals) {
    if (seen.has(deal.slug)) problems.push(`duplicate slug: ${deal.slug}`);
    seen.add(deal.slug);
  }

  // Fail the build loudly rather than shipping a catalog with holes in it.
  if (problems.length > 0) {
    throw new Error(`Invalid deal content:\n  - ${problems.join("\n  - ")}`);
  }

  return deals.sort(
    (a, b) => b.savingsUsd - a.savingsUsd || a.vendor.localeCompare(b.vendor),
  );
}

let cached: Deal[] | null = null;

export function getAllDeals(): Deal[] {
  return (cached ??= load());
}

export function getDeal(slug: string): Deal | undefined {
  return getAllDeals().find((d) => d.slug === slug);
}

export function getDealsByCategory(category: CategorySlug): Deal[] {
  return getAllDeals().filter((d) => d.categories.includes(category));
}

export function getCollectionDeals(slug: string): Deal[] {
  const collection = COLLECTIONS.find((c) => c.slug === slug);
  if (!collection) return [];
  const matched = getAllDeals().filter(collection.match);
  const limit = "limit" in collection ? collection.limit : undefined;
  return typeof limit === "number" ? matched.slice(0, limit) : matched;
}

export function getRelatedDeals(deal: Deal, count = 3): Deal[] {
  return getAllDeals()
    .filter((d) => d.slug !== deal.slug)
    .map((d) => ({
      deal: d,
      overlap: d.categories.filter((c) => deal.categories.includes(c)).length,
    }))
    .filter((x) => x.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap || b.deal.savingsUsd - a.deal.savingsUsd)
    .slice(0, count)
    .map((x) => x.deal);
}

/**
 * The headline number on the home page. Computed from the catalog — never a
 * hand-typed figure, so it cannot drift away from what the site actually lists.
 */
export function totalSavingsUsd(): number {
  return getAllDeals().reduce((sum, d) => sum + d.savingsUsd, 0);
}

export function categoriesWithCounts() {
  const deals = getAllDeals();
  return CATEGORIES.map((c) => ({
    ...c,
    count: deals.filter((d) => d.categories.includes(c.slug)).length,
  }));
}

export function latestDeals(count = 6): Deal[] {
  return [...getAllDeals()]
    .sort((a, b) => b.verifiedAt.localeCompare(a.verifiedAt))
    .slice(0, count);
}
