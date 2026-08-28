import { z } from "zod";
import { CATEGORY_SLUGS } from "@/content/categories";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "must be an ISO date (YYYY-MM-DD)");

/**
 * How a member actually redeems the offer. Everything in here is the paid
 * product: it never reaches an anonymous visitor, and the real values never
 * enter git (see lib/content/redemptions.ts).
 */
export const redemptionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("link"),
    url: z.url(),
    label: z.string().optional(),
  }),
  z.object({
    type: z.literal("code"),
    code: z.string().min(1),
    url: z.url(),
    label: z.string().optional(),
  }),
  z.object({
    type: z.literal("form"),
    url: z.url(),
    label: z.string().optional(),
    note: z.string().optional(),
  }),
]);

export const dealTypes = [
  "credits",
  "discount",
  "extended-trial",
  "grant",
  "program",
  "student",
] as const;

export const dealFrontmatterSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be a kebab-case slug"),
  vendor: z.string().min(1),
  name: z.string().min(1),
  tagline: z.string().min(10).max(180),
  /** Short monogram rendered in the hex tile. We do not host vendor logo files. */
  monogram: z.string().min(1).max(4),
  categories: z.array(z.enum(CATEGORY_SLUGS)).min(1),
  dealType: z.enum(dealTypes),
  tier: z.enum(["free", "premium"]),
  /** Display copy for the headline value, e.g. "Up to $25,000 in AWS credits". */
  value: z.string().min(1),
  /** The program's own stated maximum, in USD. Powers every savings total. */
  savingsUsd: z.number().int().nonnegative(),
  eligibility: z.array(z.string().min(1)).min(1),
  howToClaim: z.array(z.string().min(1)).min(1),
  redemption: redemptionSchema,
  /** The official program page. Every deal must be traceable to source. */
  sourceUrl: z.url(),
  verifiedAt: isoDate,
  expiresAt: isoDate.optional(),
  featured: z.boolean().default(false),
  /**
   * Seed entries authored from public documentation but not yet re-checked
   * against the vendor page. The UI says "pending re-check" instead of
   * claiming a verification that has not happened.
   */
  unverifiedSeed: z.boolean().default(false),
});

export type DealFrontmatter = z.infer<typeof dealFrontmatterSchema>;
export type Redemption = z.infer<typeof redemptionSchema>;
export type DealType = (typeof dealTypes)[number];

export type Deal = DealFrontmatter & {
  /** Long-form Markdown body: why it matters, the fine print, what to watch for. */
  body: string;
};

/**
 * What a page is allowed to hand to the client. `redemption` and `howToClaim`
 * are present only when the viewer has earned them — see lib/content/redact.ts.
 */
export type PublicDeal = Omit<DealFrontmatter, "redemption" | "howToClaim"> & {
  body: string;
  locked: boolean;
  howToClaim: string[] | null;
  redemption: Redemption | null;
};

export const DEAL_TYPE_LABELS: Record<DealType, string> = {
  credits: "Credits",
  discount: "Discount",
  "extended-trial": "Extended trial",
  grant: "Grant",
  program: "Program",
  student: "Student",
};
