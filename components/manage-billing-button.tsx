"use client";

import { useState, useTransition } from "react";
import { buttonClass } from "@/components/ui/button";

export function ManageBillingButton() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const response = await fetch("/api/stripe/portal", { method: "POST" });
            const data: { url?: string; error?: string } = await response.json();
            if (data.url) {
              window.location.href = data.url;
              return;
            }
            setError(data.error ?? "Could not open the billing portal.");
          })
        }
        className={buttonClass("secondary", "sm")}
      >
        {pending ? "Opening…" : "Manage billing"}
      </button>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-muted">
          {error}
        </p>
      ) : null}
    </div>
  );
}
