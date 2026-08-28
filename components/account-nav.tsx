"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buttonClass } from "@/components/ui/button";

type SessionShape = { user?: { email?: string | null } } | null;

/**
 * Deliberately client-side: reading the session in the root layout would opt
 * every route — the whole catalog included — out of static rendering for the
 * sake of one link.
 */
export function AccountNav({ authEnabled }: { authEnabled: boolean }) {
  const [session, setSession] = useState<SessionShape>(null);
  const [loaded, setLoaded] = useState(!authEnabled);

  useEffect(() => {
    if (!authEnabled) return;
    let active = true;
    fetch("/api/auth/session")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: SessionShape) => {
        if (active) setSession(data?.user ? data : null);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [authEnabled]);

  if (session?.user) {
    return (
      <Link href="/dashboard" className={buttonClass("quiet", "sm")}>
        Dashboard
      </Link>
    );
  }

  return (
    <>
      {authEnabled ? (
        <Link
          href="/login"
          className={buttonClass("ghost", "sm", "hidden sm:inline-flex")}
          style={{ visibility: loaded ? "visible" : "hidden" }}
        >
          Sign in
        </Link>
      ) : null}
      <Link href="/pricing" className={buttonClass("foil", "sm")}>
        Get access
      </Link>
    </>
  );
}
