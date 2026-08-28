import type { Deal } from "@/lib/content/schema";

/**
 * Curated bundles. A collection is a named question a founder actually asks
 * ("where do I get GPU credits?"), expressed as a predicate over the catalog —
 * so a collection can never drift out of sync with the deals it lists.
 */
export const COLLECTIONS = [
  {
    slug: "ai-credits",
    name: "AI & LLM credits",
    headline: "Model and GPU credits for AI-first teams",
    blurb:
      "Inference, training and GPU time are the fastest-growing line on an AI startup's bill. These programs hand over credits rather than a discount.",
    match: (d: Deal) => d.categories.includes("ai-llm") && d.dealType === "credits",
  },
  {
    slug: "cloud-credits",
    name: "Cloud credits",
    headline: "The big cloud programs, side by side",
    blurb:
      "AWS, Google Cloud and Azure all run startup programs with very different eligibility rules. Read the requirements before you apply — most are one-shot.",
    match: (d: Deal) => d.categories.includes("cloud-hosting") && d.dealType === "credits",
  },
  {
    slug: "grants-and-programs",
    name: "Grants & programs",
    headline: "Non-dilutive money and accelerator programs",
    blurb: "Grants, fellowships and accelerator tracks that do not take equity for the credit itself.",
    match: (d: Deal) => d.dealType === "grant" || d.dealType === "program",
  },
  {
    slug: "student-builders",
    name: "Student & first-project",
    headline: "Free tiers for students and first-time builders",
    blurb: "If you have a .edu address or a first side project, these cost nothing at all.",
    match: (d: Deal) => d.dealType === "student",
  },
  {
    slug: "runway-savers",
    name: "Biggest runway savers",
    headline: "The ten largest offers in the catalog",
    blurb: "Ranked purely by the program's own stated maximum value. Eligibility gets stricter as the numbers get bigger.",
    match: () => true,
    limit: 10,
  },
] as const;

export type CollectionSlug = (typeof COLLECTIONS)[number]["slug"];

export function getCollection(slug: string) {
  return COLLECTIONS.find((c) => c.slug === slug);
}
