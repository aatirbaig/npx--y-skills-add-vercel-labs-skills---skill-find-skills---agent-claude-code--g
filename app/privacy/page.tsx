import type { Metadata } from "next";
import { Container, Eyebrow } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Privacy policy",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <Container className="py-20">
      <div className="mx-auto max-w-2xl">
        <Eyebrow>Legal</Eyebrow>
        <h1 className="display mt-5 text-5xl">Privacy policy</h1>

        <p className="mt-8 rounded-[6px] border border-dashed border-rule-strong bg-paper px-4 py-3 text-sm text-ink-soft">
          <strong>Draft — not legal advice.</strong> This describes what the software actually
          stores, so it is accurate as a starting point. Have a lawyer review it before launch,
          and check it against GDPR and CCPA obligations for your users.
        </p>

        <article className="prose-deal mt-10">
        <h2>What we store</h2>
        <ul>
          <li>
            <strong>Your email address</strong>, because sign-in is a magic link and there is
            nothing else to identify an account by.
          </li>
          <li>
            <strong>Which programs you save and claim</strong>, so the dashboard can show them
            back to you.
          </li>
          <li>
            <strong>Your billing state</strong> — a Stripe customer ID and whether the membership
            is active. Card details are handled by Stripe and never reach our servers.
          </li>
        </ul>

        <h2>What we do not store</h2>
        <p>
          No passwords, because there are none. No payment details. We do not sell personal data,
          and we do not share the fact that you viewed or claimed a particular program with the
          vendor of that program.
        </p>

        <h2>Processors</h2>
        <p>
          Stripe processes payments, Resend delivers sign-in emails, and the site and its database
          run on our hosting provider. Each receives only what it needs to do that job.
        </p>

        <h2>Deleting your account</h2>
        <p>
          Email <a href="mailto:privacy@foundersbee.com">privacy@foundersbee.com</a> and we delete
          the account and everything attached to it. Billing records are kept only as long as tax
          rules require.
        </p>
        </article>
      </div>
    </Container>
  );
}
