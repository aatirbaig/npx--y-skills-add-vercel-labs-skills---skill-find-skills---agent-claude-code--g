import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { COLLECTIONS, getCollection } from "@/content/collections";
import { getCollectionDeals } from "@/lib/content/deals";
import { toCards } from "@/lib/content/redact";
import { DealIndex } from "@/components/deal-card";
import { Container, Eyebrow } from "@/components/ui/section";
import { formatUsdExact } from "@/lib/utils";

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
    <Container className="py-16">
      <header className="mb-12 max-w-3xl">
        <Eyebrow>Collection</Eyebrow>
        <h1 className="display mt-5 text-5xl sm:text-6xl">{collection.headline}</h1>
        <p className="lede mt-6">{collection.blurb}</p>
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

      <DealIndex deals={toCards(deals)} />
    </Container>
  );
}
