import type { Metadata } from "next";
import { getAllDeals } from "@/lib/content/deals";
import { Container } from "@/components/ui/section";
import { PartnerForm } from "@/components/partner-form";

export const metadata: Metadata = {
  title: "List your program on FoundersBee",
  description:
    "Put your startup program in front of founders who are actively looking for credits, grants and discounts. Submit the offer and we check the program page before listing it.",
  alternates: { canonical: "/partners" },
};

export default function PartnersPage() {
  const deals = getAllDeals();

  return (
    <Container className="py-16">
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <p className="mb-2 font-mono text-xs tracking-widest text-accent-strong uppercase">
            For partners
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Reach founders at the moment they are choosing a vendor
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted text-pretty">
            People arrive here having already decided to solve a problem and are comparing who
            to solve it with. That is a better moment than an ad impression, and it is the only
            moment we sell.
          </p>

          <dl className="mt-10 space-y-6">
            <Point title="We check before we list">
              Every one of the {deals.length} programs in the catalog links to the vendor&rsquo;s
              own page, and the eligibility rules are quoted rather than paraphrased. Nothing
              gets listed because someone paid for it.
            </Point>
            <Point title="Two ways to appear">
              A public program is listed free — that is the whole catalog. A negotiated code or
              referral route sits behind premium, which is what members pay for.
            </Point>
            <Point title="What we need from you">
              The offer, who qualifies, how it is claimed, and a page we can check it against.
              If the terms change, tell us and we will update the listing.
            </Point>
          </dl>
        </div>

        <div>
          <PartnerForm />
          <p className="mt-4 text-xs leading-relaxed text-muted">
            Submissions go to our inbox, not into the catalog. A person reads every one and
            checks the program page before anything is published.
          </p>
        </div>
      </div>
    </Container>
  );
}

function Point({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="font-semibold tracking-tight">{title}</dt>
      <dd className="mt-1.5 text-sm leading-relaxed text-muted">{children}</dd>
    </div>
  );
}
