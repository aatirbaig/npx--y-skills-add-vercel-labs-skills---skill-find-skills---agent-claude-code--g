"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PlanId } from "@/lib/stripe/plans";
import { buttonClass } from "@/components/ui/button";

export function CheckoutButton({
  plan,
  children,
  variant = "primary",
}: {
  plan: PlanId;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function start() {
    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ plan }),
        });
        if (response.status === 401) {
          router.push(`/login?next=/pricing`);
          return;
        }
        const data: { url?: string; error?: string } = await response.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
        setError(data.error ?? "Could not start checkout.");
      } catch {
        setError("Could not reach checkout. Try again in a moment.");
      }
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={start}
        disabled={pending}
        className={buttonClass(variant, "lg", "w-full")}
      >
        {pending ? "Starting checkout…" : children}
      </button>
      {error ? (
        <p role="alert" className="text-sm text-muted">
          {error}
        </p>
      ) : null}
    </div>
  );
}
