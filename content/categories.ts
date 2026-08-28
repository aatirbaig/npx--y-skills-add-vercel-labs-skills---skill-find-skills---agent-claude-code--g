export const CATEGORIES = [
  {
    slug: "cloud-hosting",
    name: "Cloud & Hosting",
    blurb: "Compute, storage and deploy targets — usually the biggest single line on an early bill.",
  },
  {
    slug: "ai-llm",
    name: "AI & LLM",
    blurb: "Model APIs, GPUs and AI tooling credits for teams building on top of models.",
  },
  {
    slug: "dev-tools",
    name: "Dev Tools",
    blurb: "Source control, CI, observability and the rest of the engineering stack.",
  },
  {
    slug: "marketing-growth",
    name: "Marketing & Growth",
    blurb: "Email, analytics, SEO and the tools that get the first thousand users.",
  },
  {
    slug: "finance-banking",
    name: "Finance & Banking",
    blurb: "Banking, payments, spend management and bookkeeping.",
  },
  {
    slug: "hr-payroll",
    name: "HR & Payroll",
    blurb: "Hiring, payroll, contractors and global employment.",
  },
  {
    slug: "design",
    name: "Design",
    blurb: "Product design, brand, prototyping and asset libraries.",
  },
  {
    slug: "productivity",
    name: "Productivity",
    blurb: "Docs, wikis, project tracking and everything the team lives in daily.",
  },
  {
    slug: "sales-crm",
    name: "Sales & CRM",
    blurb: "Pipeline, outbound, support desks and revenue tooling.",
  },
  {
    slug: "legal-ops",
    name: "Legal & Ops",
    blurb: "Incorporation, cap table, contracts and compliance.",
  },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug) as [CategorySlug, ...CategorySlug[]];

export function getCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}
