import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORIES, getCategory } from "@/content/categories";
import { getDealsByCategory } from "@/lib/content/deals";
import { toCards } from "@/lib/content/redact";
import { DealsBrowser } from "@/components/deals-browser";
import { Container } from "@/components/ui/section";
import { formatUsd } from "@/lib/utils";

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
    <Container className="py-12">
      <header className="mb-10 max-w-3xl">
        <p className="mb-2 font-mono text-xs tracking-widest text-accent-strong uppercase">
          Category
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {category.name}
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-muted text-pretty">
          {category.blurb}
        </p>
        <p className="mt-3 text-sm text-muted">
          {deals.length} programs
          {total > 0 ? ` · ${formatUsd(total)} in stated value` : ""}
        </p>
      </header>

      <DealsBrowser deals={toCards(deals)} />
    </Container>
  );
}
