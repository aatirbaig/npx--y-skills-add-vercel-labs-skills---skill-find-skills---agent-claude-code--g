import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Nothing useful to index, and /dashboard is per-user anyway.
      disallow: ["/api/", "/dashboard", "/login"],
    },
    sitemap: siteUrl("/sitemap.xml"),
  };
}
