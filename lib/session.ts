import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { auth, authConfigured } from "@/lib/auth";
import { getDb, schema } from "@/lib/db/client";
import type { Viewer } from "@/lib/content/redact";
import type { Membership } from "@/lib/db/schema";

function isFrameworkSignal(error: unknown): boolean {
  const digest = (error as { digest?: unknown } | null)?.digest;
  return (
    typeof digest === "string" &&
    (digest.startsWith("NEXT_") || digest === "DYNAMIC_SERVER_USAGE")
  );
}

export type CurrentUser = {
  id: string;
  email: string | null;
  name: string | null;
  membership: Membership;
  stripeCustomerId: string | null;
};

/**
 * The single place a request's identity is resolved. Cached per request so
 * every server component sees the same answer without threading it through
 * props — which is also what keeps it from being handed to a client component
 * by accident.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  if (!authConfigured) return null;
  try {
    const session = await auth();
    const id = session?.user?.id;
    if (!id) return null;
    const rows = await getDb()
      .select({
        id: schema.users.id,
        email: schema.users.email,
        name: schema.users.name,
        membership: schema.users.membership,
        stripeCustomerId: schema.users.stripeCustomerId,
      })
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);
    return rows[0] ?? null;
  } catch (error) {
    // Next signals control flow (redirects, dynamic-rendering bailouts) by
    // throwing. Swallowing those would break rendering and fill the build log
    // with errors that are not errors.
    if (isFrameworkSignal(error)) throw error;
    // A missing or unreachable database must not take the public catalog down.
    console.error("[session] could not resolve the current user:", error);
    return null;
  }
});

export const getViewer = cache(async (): Promise<Viewer> => {
  const user = await getCurrentUser();
  return user ? { membership: user.membership } : null;
});
