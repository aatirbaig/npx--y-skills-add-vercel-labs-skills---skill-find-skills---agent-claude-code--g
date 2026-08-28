import type { Metadata } from "next";
import { Container } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Terms of service",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <Container className="py-16">
      <article className="prose-deal mx-auto max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Terms of service</h1>

        <p className="mt-4 rounded-lg border border-dashed border-border bg-surface px-4 py-3 text-sm">
          <strong>Draft — not legal advice.</strong> This page states the intended terms in plain
          language so the product can be built and reviewed. Have a lawyer replace it before
          taking payments from the public.
        </p>

        <h2>What FoundersBee is</h2>
        <p>
          FoundersBee is an information service. We describe programs run by third parties and
          link to their official pages. We do not run those programs, we cannot grant access to
          them, and we are not party to any agreement between you and a vendor.
        </p>

        <h2>No guarantee of eligibility or value</h2>
        <p>
          Every value shown is the vendor&rsquo;s own stated maximum and every eligibility rule is
          set by the vendor. Programs change or end without notice. Nothing here is a promise that
          you will be approved or that you will receive any particular amount.
        </p>

        <h2>Membership and billing</h2>
        <p>
          Premium is billed annually and renews until cancelled; a lifetime purchase is a one-off
          payment. You can cancel a renewal at any time from the billing portal, which stops the
          next charge and returns the account to the free tier at the end of the paid period.
        </p>

        <h2>Acceptable use</h2>
        <p>
          Member-only codes and claim routes are licensed to your company for its own use. Do not
          republish, resell or share them. Accounts that do lose access without a refund.
        </p>

        <h2>Third-party marks</h2>
        <p>
          Vendor names are used to identify the programs those vendors run. No affiliation,
          sponsorship or endorsement is implied by a listing, except where the listing says
          explicitly that FoundersBee negotiated the offer.
        </p>
      </article>
    </Container>
  );
}
