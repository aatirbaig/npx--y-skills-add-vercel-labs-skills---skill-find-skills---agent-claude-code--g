import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/session";
import { getDb, schema } from "@/lib/db/client";
import { getDeal } from "@/lib/content/deals";
import { toCards } from "@/lib/content/redact";
import { signOut } from "@/lib/auth";
import { DealIndex } from "@/components/deal-card";
import { Container, Eyebrow, SectionHeading, Stat } from "@/components/ui/section";
import { ButtonLink, Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { ManageBillingButton } from "@/components/manage-billing-button";
import { formatUsdExact } from "@/lib/utils";
import { PLANS } from "@/lib/stripe/plans";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false },
};

const MEMBERSHIP_LABEL = {
  free: "Free",
  premium: "Premium",
  lifetime: "Lifetime",
} as const;

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  const db = getDb();
  const [saved, claimed] = await Promise.all([
    db
      .select()
      .from(schema.savedDeals)
      .where(eq(schema.savedDeals.userId, user.id))
      .orderBy(desc(schema.savedDeals.createdAt)),
    db
      .select()
      .from(schema.claims)
      .where(eq(schema.claims.userId, user.id))
      .orderBy(desc(schema.claims.createdAt)),
  ]);

  const savedDeals = saved.map((row) => getDeal(row.dealSlug)).filter((d) => d !== undefined);
  const claimedDeals = claimed.map((row) => getDeal(row.dealSlug)).filter((d) => d !== undefined);
  const unlockedValue = claimedDeals.reduce((sum, d) => sum + d.savingsUsd, 0);
  const isMember = user.membership !== "free";

  return (
    <Container className="py-16">
      <header className="flex flex-wrap items-start justify-between gap-6 border-b border-rule pb-10">
        <div>
          <Eyebrow>Your account</Eyebrow>
          <h1 className="display mt-4 text-5xl">{MEMBERSHIP_LABEL[user.membership]}</h1>
          <p className="mt-2 text-ink-soft">{user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          {isMember ? <Chip tone="foil">Active</Chip> : null}
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button type="submit" variant="ghost" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </header>

      <dl className="grid gap-10 border-b border-rule py-10 sm:grid-cols-3">
        <Stat label="Saved" value={savedDeals.length} hint="programs bookmarked" />
        <Stat
          label="Claimed"
          value={claimedDeals.length}
          hint={
            unlockedValue > 0
              ? `${formatUsdExact(unlockedValue)} in stated value`
              : "nothing claimed yet"
          }
        />
        <div>
          <dt className="eyebrow text-ink-soft">Membership</dt>
          <dd className="display mt-2 text-4xl">{MEMBERSHIP_LABEL[user.membership]}</dd>
          <div className="mt-4">
            {isMember ? (
              <ManageBillingButton />
            ) : (
              <ButtonLink href="/pricing" size="sm">
                Unlock — ${PLANS.annual.price}/year
              </ButtonLink>
            )}
          </div>
        </div>
      </dl>

      <section className="mt-14">
        <SectionHeading
          title="Saved programs"
          blurb="Bookmarked from a listing. Nothing is applied for on your behalf."
          action={
            <ButtonLink href="/deals" variant="quiet" size="sm">
              Find more
            </ButtonLink>
          }
        />
        <div className="mt-8">
          {savedDeals.length > 0 ? (
            <DealIndex deals={toCards(savedDeals)} />
          ) : (
            <EmptyState
              title="Nothing saved yet"
              body="Open any program and hit Save to keep it here."
            />
          )}
        </div>
      </section>

      {claimedDeals.length > 0 ? (
        <section className="mt-16">
          <SectionHeading
            title="Claimed"
            blurb="Recorded when you opened a program's claim route from FoundersBee."
          />
          <div className="mt-8">
            <DealIndex deals={toCards(claimedDeals)} />
          </div>
        </section>
      ) : null}
    </Container>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-y border-rule px-6 py-20 text-center">
      <p className="display text-2xl">{title}</p>
      <p className="mt-2 text-sm text-ink-soft">{body}</p>
    </div>
  );
}
