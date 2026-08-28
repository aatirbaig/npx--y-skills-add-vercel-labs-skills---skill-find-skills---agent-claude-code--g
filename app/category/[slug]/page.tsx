import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORIES, getCategory } from "@/content/categories";
import { getDealsByCategory } from "@/lib/content/deals";
import { toCards } from "@/lib/content/redact";
import { DealsBrowser } from "@/components/deals-browser";
import { Container, Eyebrow } from "@/components/ui/section";
import { formatUsdExact } from "@/lib/utils";

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata(
  props: PageProps<"/category/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const category = getCategory(slug);
  if (!category) return {};

  return {
    title: `${category.name} deals, credits and discounts for startups`,
    description: category.blurb,
    alternates: { canonical: `/category/${category.slug}` },
  };
}

export default async function CategoryPage(props: PageProps<"/category/[slug]">) {
  const { slug } = await props.params;
  const category = getCategory(slug);
  if (!category) notFound();

  const deals = getDealsByCategory(category.slug);
  const total = deals.reduce((sum, d) => sum + d.savingsUsd, 0);

  return (
    <Container className="py-16">
      <header className="mb-12 max-w-3xl">
        <Eyebrow>Category</Eyebrow>
        <h1 className="display mt-5 text-5xl sm:text-6xl">{category.name}</h1>
        <p className="lede mt-6">{category.blurb}</p>
        <p className="mt-5 text-sm text-ink-soft">
          <span data-figure className="font-semibold text-ink">
            {deals.length}
          </span>{" "}
          programs
          {total > 0 ? (
            <>
              {" · "}
              <span data-figure className="font-semibold text-ink">
                {formatUsdExact(total)}
              </span>{" "}
              stated
            </>
          ) : null}
        </p>
      </header>

      <DealsBrowser deals={toCards(deals)} />
    </Container>
  );
}
