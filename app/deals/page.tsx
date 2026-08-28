import type { Metadata } from "next";
import { getAllDeals, totalSavingsUsd } from "@/lib/content/deals";
import { toCards } from "@/lib/content/redact";
import { DealsBrowser } from "@/components/deals-browser";
import { Container, Eyebrow } from "@/components/ui/section";
import { formatUsdExact } from "@/lib/utils";

export const metadata: Metadata = {
  title: "The catalog — every startup credit, grant and discount",
  description:
    "Search every startup program FoundersBee tracks — cloud credits, non-dilutive grants, student benefits and negotiated software discounts — filtered by category, type and access.",
  alternates: { canonical: "/deals" },
};

export default function DealsPage() {
  const deals = getAllDeals();

  return (
    <Container className="py-16">
      <header className="mb-12 max-w-3xl">
        <Eyebrow>The catalog</Eyebrow>
        <h1 className="display mt-5 text-5xl sm:text-6xl">
          {deals.length} programs, {formatUsdExact(totalSavingsUsd())} stated.
        </h1>
        <p className="lede mt-6">
          Every listing names who qualifies and links to the vendor&rsquo;s own page, so you can
          rule yourself out before you apply rather than after.
        </p>
      </header>

      <DealsBrowser deals={toCards(deals)} />
    </Container>
  );
}
