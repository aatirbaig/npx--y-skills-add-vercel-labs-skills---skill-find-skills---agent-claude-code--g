import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { COLLECTIONS, getCollection } from "@/content/collections";
import { getCollectionDeals } from "@/lib/content/deals";
import { toCards } from "@/lib/content/redact";
import { DealGrid } from "@/components/deal-card";
import { Container } from "@/components/ui/section";
import { formatUsd } from "@/lib/utils";

export function generateStaticParams() {
  return COLLECTIONS.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata(
  props: PageProps<"/collections/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const collection = getCollection(slug);
  if (!collection) return {};

  return {
    title: collection.headline,
    description: collection.blurb,
    alternates: { canonical: `/collections/${collection.slug}` },
  };
}

export default async function CollectionPage(props: PageProps<"/collections/[slug]">) {
  const { slug } = await props.params;
  const collection = getCollection(slug);
  if (!collection) notFound();

  const deals = getCollectionDeals(collection.slug);
  const total = deals.reduce((sum, d) => sum + d.savingsUsd, 0);

  return (
    <Container className="py-12">
      <header className="mb-10 max-w-3xl">
        <p className="mb-2 font-mono text-xs tracking-widest text-accent-strong uppercase">
          Collection
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {collection.headline}
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-muted text-pretty">
          {collection.blurb}
        </p>
        <p className="mt-3 text-sm text-muted">
          {deals.length} programs
          {total > 0 ? ` · ${formatUsd(total)} in stated value` : ""}
        </p>
      </header>

      <DealGrid deals={toCards(deals)} />
    </Container>
  );
}
