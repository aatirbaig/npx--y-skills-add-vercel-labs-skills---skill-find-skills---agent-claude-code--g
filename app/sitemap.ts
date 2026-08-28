import type { MetadataRoute } from "next";
import { getAllDeals } from "@/lib/content/deals";
import { CATEGORIES } from "@/content/categories";
import { COLLECTIONS } from "@/content/collections";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const deals = getAllDeals();
  const lastModified = new Date();

  return [
    { url: siteUrl("/"), changeFrequency: "daily", priority: 1, lastModified },
    { url: siteUrl("/deals"), changeFrequency: "daily", priority: 0.9, lastModified },
    { url: siteUrl("/pricing"), changeFrequency: "monthly", priority: 0.7, lastModified },
    { url: siteUrl("/partners"), changeFrequency: "monthly", priority: 0.5, lastModified },
    { url: siteUrl("/about"), changeFrequency: "monthly", priority: 0.4, lastModified },
    {
      url: siteUrl("/editorial-policy"),
      changeFrequency: "monthly",
      priority: 0.4,
      lastModified,
    },
    ...CATEGORIES.map((category) => ({
      url: siteUrl(`/category/${category.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.7,
      lastModified,
    })),
    ...COLLECTIONS.map((collection) => ({
      url: siteUrl(`/collections/${collection.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.6,
      lastModified,
    })),
    ...deals.map((deal) => ({
      url: siteUrl(`/deals/${deal.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.8,
      lastModified: new Date(`${deal.verifiedAt}T00:00:00Z`),
    })),
  ];
}
