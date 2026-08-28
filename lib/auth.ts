import NextAuth, { type DefaultSession } from "next-auth";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { getDb, schema } from "@/lib/db/client";
import type { Membership } from "@/lib/db/schema";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      membership: Membership;
    } & DefaultSession["user"];
  }
}

/** Sign-in is only wired up once a secret exists. */
export const authConfigured = Boolean(process.env.AUTH_SECRET);

/**
 * Without a Resend key — local development, CI, preview — the magic link is
 * written to disk and logged instead of emailed, so the flow stays testable
 * without an email provider.
 */
async function devSendVerificationRequest({
  identifier,
  url,
}: {
  identifier: string;
  url: string;
}) {
  const { writeFile, mkdir } = await import("node:fs/promises");
  await mkdir(".data", { recursive: true });
  await writeFile(".data/last-magic-link.txt", url, "utf8");
  console.info(`\n  Magic link for ${identifier}:\n  ${url}\n`);
}

const emailProvider = Resend({
  apiKey: process.env.RESEND_API_KEY ?? "dev-no-key",
  from: process.env.EMAIL_FROM ?? "FoundersBee <onboarding@resend.dev>",
  ...(process.env.RESEND_API_KEY
    ? {}
    : { sendVerificationRequest: devSendVerificationRequest }),
});

export const { handlers, signIn, signOut, auth } = NextAuth(() => ({
  adapter: DrizzleAdapter(getDb(), {
    usersTable: schema.users,
    accountsTable: schema.accounts,
    sessionsTable: schema.sessions,
    verificationTokensTable: schema.verificationTokens,
  }),
  providers: [emailProvider],
  pages: { signIn: "/login", verifyRequest: "/login/check-email" },
  session: { strategy: "database" },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      session.user.membership =
        (user as typeof user & { membership?: Membership }).membership ?? "free";
      return session;
    },
  },
}));
