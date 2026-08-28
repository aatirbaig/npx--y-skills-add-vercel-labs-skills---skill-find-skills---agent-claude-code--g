import type { Metadata } from "next";
import { getAllDeals, totalSavingsUsd } from "@/lib/content/deals";
import { Container, Eyebrow } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { formatUsdExact } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why FoundersBee exists: startup credits and grants are scattered, inconsistently documented, and mostly gated on rules nobody states up front.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const deals = getAllDeals();

  return (
    <Container className="py-20">
      <div className="mx-auto max-w-2xl">
        <Eyebrow>About</Eyebrow>
        <h1 className="display mt-5 text-5xl">
          The money is available. Finding it is the problem.
        </h1>
        <p className="lede mt-6">
          There is a great deal of money available to early-stage companies that never gets claimed,
          mostly because finding it is tedious and the eligibility rules are buried.
        </p>

        <article className="prose-deal mt-10">
          <h2>The actual problem</h2>
          <p>
            Every large vendor runs a startup program. The terms sit on different pages, in different
            formats, with the disqualifying detail — pre-Series A only, referral required, one
            activation per company — usually in the last paragraph. Founders discover it after the
            application, not before.
          </p>

          <h2>What we do about it</h2>
          <p>
            We track {deals.length} programs worth a stated {formatUsdExact(totalSavingsUsd())}, and
            we lead every listing with who qualifies rather than with the headline number. The catch
            goes above the fold. That is the entire product.
          </p>

          <h2>How we make money</h2>
          <p>
            Public programs are free to read here and always will be. Membership covers the programs
            that run through a partner code or referral route rather than a public sign-up page. Some
            outbound links may earn a referral fee, which never affects what we list — see the{" "}
            <a href="/editorial-policy">editorial policy</a>.
          </p>
        </article>

        <div className="mt-12">
          <ButtonLink href="/deals" size="lg">
            Browse the catalog
          </ButtonLink>
        </div>
      </div>
    </Container>
  );
}
