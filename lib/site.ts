export const SITE = {
  name: "FoundersBee",
  tagline: "Every startup credit, grant and discount worth claiming — in one place.",
  description:
    "FoundersBee tracks verified startup credits, grants and software discounts, with the eligibility rules and the fine print stated up front. Free to browse; premium unlocks the negotiated codes.",
};

export function siteUrl(path = ""): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000");
  return `${base.replace(/\/$/, "")}${path}`;
}
