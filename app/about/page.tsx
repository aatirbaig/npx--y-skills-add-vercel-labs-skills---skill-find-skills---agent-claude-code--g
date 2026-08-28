import type { Metadata } from "next";
import { getAllDeals, totalSavingsUsd } from "@/lib/content/deals";
import { Container } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { formatUsd } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why FoundersBee exists: startup credits and grants are scattered, inconsistently documented, and mostly gated on rules nobody states up front.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const deals = getAllDeals();

  return (
    <Container className="py-16">
      <article className="prose-deal mx-auto max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">About FoundersBee</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          There is a lot of money available to early-stage companies that never gets claimed,
          mostly because finding it is tedious and the eligibility rules are buried.
        </p>

        <h2>The actual problem</h2>
        <p>
          Every large vendor runs a startup program. The terms sit on different pages, in
          different formats, with the disqualifying detail — pre-Series A only, referral
          required, one activation per company — usually in the last paragraph. Founders discover
          it after the application, not before.
        </p>

        <h2>What we do about it</h2>
        <p>
          We track {deals.length} programs worth a stated {formatUsd(totalSavingsUsd())}, and we
          lead every listing with who qualifies rather than with the headline number. The catch
          goes above the fold. That is the entire product.
        </p>

        <h2>How we make money</h2>
        <p>
          Public programs are free to read here and always will be. Premium covers the programs
          that run through a partner code or referral route rather than a public sign-up page.
          Some outbound links may earn a referral fee, which never affects what we list — see the{" "}
          <a href="/editorial-policy">editorial policy</a>.
        </p>
      </article>

      <div className="mt-12 flex justify-center">
        <ButtonLink href="/deals" size="lg">
          Browse the catalog
        </ButtonLink>
      </div>
    </Container>
  );
}
