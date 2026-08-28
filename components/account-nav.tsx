"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buttonClass } from "@/components/ui/button";

type SessionShape = { user?: { email?: string | null } } | null;

/**
 * Kept on the client on purpose. Reading the session in the root layout would
 * opt every route — including the catalog and every deal page — out of static
 * rendering for the sake of one link in the header.
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
      <Link href="/dashboard" className={buttonClass("secondary", "sm")}>
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
          // Avoid flashing "Sign in" at a member before the session resolves.
          style={{ visibility: loaded ? "visible" : "hidden" }}
        >
          Sign in
        </Link>
      ) : null}
      <Link href="/pricing" className={buttonClass("primary", "sm")}>
        Get premium
      </Link>
    </>
  );
}
