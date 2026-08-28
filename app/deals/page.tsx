import type { Metadata } from "next";
import { getAllDeals, totalSavingsUsd } from "@/lib/content/deals";
import { toCards } from "@/lib/content/redact";
import { DealsBrowser } from "@/components/deals-browser";
import { Container } from "@/components/ui/section";
import { formatUsd } from "@/lib/utils";

export const metadata: Metadata = {
  title: "All startup deals, credits and grants",
  description:
    "Search every startup program FoundersBee tracks — cloud credits, non-dilutive grants, student benefits and negotiated software discounts — filtered by category, type and access.",
  alternates: { canonical: "/deals" },
};

export default function DealsPage() {
  const deals = getAllDeals();

  return (
    <Container className="py-12">
      <header className="mb-10 max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          The catalog
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-muted text-pretty">
          {deals.length} programs worth a stated {formatUsd(totalSavingsUsd())}. Every
          listing names who qualifies and links to the vendor&rsquo;s own page, so you can
          check before you apply.
        </p>
      </header>

      <DealsBrowser deals={toCards(deals)} />
    </Container>
  );
}
