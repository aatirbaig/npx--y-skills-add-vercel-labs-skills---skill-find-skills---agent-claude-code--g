import type { Metadata } from "next";
import { getAllDeals } from "@/lib/content/deals";
import { Container, Eyebrow } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Editorial policy",
  description:
    "How FoundersBee decides what to list, what 'verified' means, how we handle affiliate links, and how to report a stale deal.",
  alternates: { canonical: "/editorial-policy" },
};

export default function EditorialPolicyPage() {
  const deals = getAllDeals();
  const pending = deals.filter((d) => d.unverifiedSeed).length;

  return (
    <Container className="py-20">
      <div className="mx-auto max-w-2xl">
        <Eyebrow>Editorial policy</Eyebrow>
        <h1 className="display mt-5 text-5xl">What we do, and what we will not do</h1>
        <p className="lede mt-6">
          A deals site is only worth reading if you can trust the numbers on it. Here is exactly how
          this one works.
        </p>

        <article className="prose-deal mt-10">
          <h2>Every listing links to its source</h2>
          <p>
            Each program names the vendor page it was taken from, and that link is on the listing
            itself — not behind a sign-up. If our summary and the vendor page disagree, the vendor
            page is right and we are wrong. Tell us and we will fix it.
          </p>

          <h2>No click-to-reveal on public programs</h2>
          <p>
            If a vendor publishes a program openly, it stays open here: no account, no email wall,
            no redirect chain. We charge for the codes and referral routes we negotiated ourselves,
            and nothing else.
          </p>

          <h2>What &ldquo;verified&rdquo; means, and what it does not</h2>
          <p>
            A verified date means a person opened the vendor&rsquo;s page on that date and confirmed
            the offer, its value and its eligibility rules. It does not mean you will be approved —
            eligibility is decided by the vendor, and the large cloud programs in particular gate on
            funding stage and referral source.
          </p>
          {pending > 0 ? (
            <p>
              <strong>Currently pending re-check:</strong> {pending} of {deals.length} listings were
              written from vendors&rsquo; public documentation and have not yet been re-confirmed
              against the live page. Those listings say so, in place of a verified date. We would
              rather show you that than a date we have not earned.
            </p>
          ) : null}

          <h2>Stated values are ceilings, not offers</h2>
          <p>
            Every dollar figure is the program&rsquo;s own stated maximum. Most applicants receive
            less. We use those figures for totals because they are the only number vendors publish
            consistently — treat them as an upper bound, never as an expectation.
          </p>

          <h2>Affiliate links</h2>
          <p>
            Some outbound links may earn FoundersBee a referral fee. They never change what we list,
            the order we list it in, or what we say about it — the catalog is ordered by stated value
            and nothing else. A program that pays us nothing is listed on the same terms as one that
            does.
          </p>

          <h2>Reporting something stale</h2>
          <p>
            Programs change terms without notice and some disappear entirely. If a listing is wrong,
            email <a href="mailto:corrections@foundersbee.com">corrections@foundersbee.com</a> with
            the link. Corrections take priority over new listings.
          </p>
        </article>
      </div>
    </Container>
  );
}
