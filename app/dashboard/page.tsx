import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/session";
import { getDb, schema } from "@/lib/db/client";
import { getDeal } from "@/lib/content/deals";
import { toCards } from "@/lib/content/redact";
import { signOut } from "@/lib/auth";
import { DealGrid } from "@/components/deal-card";
import { Container, SectionHeading } from "@/components/ui/section";
import { ButtonLink, Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ManageBillingButton } from "@/components/manage-billing-button";
import { formatUsd } from "@/lib/utils";
import { PLANS } from "@/lib/stripe/plans";

export const metadata: Metadata = {
  title: "Your dashboard",
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
    <Container className="py-12">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Your dashboard</h1>
          <p className="mt-2 text-muted">{user.email}</p>
        </div>
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
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-xs tracking-wider text-muted uppercase">Membership</p>
          <p className="mt-2 flex items-center gap-2 text-xl font-semibold tracking-tight">
            {MEMBERSHIP_LABEL[user.membership]}
            {isMember ? <Badge tone="accent">Active</Badge> : null}
          </p>
          <div className="mt-4">
            {isMember ? (
              <ManageBillingButton />
            ) : (
              <ButtonLink href="/pricing" size="sm">
                Unlock premium — ${PLANS.annual.price}/yr
              </ButtonLink>
            )}
          </div>
        </div>

        <Stat label="Saved" value={String(savedDeals.length)} hint="programs bookmarked" />
        <Stat
          label="Claimed"
          value={String(claimedDeals.length)}
          hint={
            unlockedValue > 0
              ? `${formatUsd(unlockedValue)} in stated value`
              : "nothing claimed yet"
          }
        />
      </div>

      <section className="mt-14">
        <SectionHeading
          title="Saved programs"
          blurb="Bookmarked from a deal page. Nothing is applied for on your behalf."
          action={
            <ButtonLink href="/deals" variant="secondary" size="sm">
              Find more
            </ButtonLink>
          }
        />
        <div className="mt-6">
          {savedDeals.length > 0 ? (
            <DealGrid deals={toCards(savedDeals)} />
          ) : (
            <EmptyState
              title="Nothing saved yet"
              body="Open any program and hit Save to keep it here."
            />
          )}
        </div>
      </section>

      {claimedDeals.length > 0 ? (
        <section className="mt-14">
          <SectionHeading
            title="Claimed"
            blurb="Recorded when you opened a program's claim route from FoundersBee."
          />
          <div className="mt-6">
            <DealGrid deals={toCards(claimedDeals)} />
          </div>
        </section>
      ) : null}
    </Container>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-xs tracking-wider text-muted uppercase">{label}</p>
      <p className="mt-2 font-mono text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-muted">{hint}</p>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="honeycomb rounded-xl border border-dashed border-border bg-surface/40 px-6 py-16 text-center">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted">{body}</p>
    </div>
  );
}
