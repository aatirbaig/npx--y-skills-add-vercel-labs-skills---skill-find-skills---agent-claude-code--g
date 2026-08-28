"use client";

import { useState, useTransition } from "react";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import type { Redemption } from "@/lib/content/schema";
import { recordClaim } from "@/app/actions/deals";
import { buttonClass } from "@/components/ui/button";

export function RedemptionPanel({
  dealSlug,
  redemption,
}: {
  dealSlug: string;
  redemption: Redemption;
}) {
  const [copied, setCopied] = useState(false);
  const [, startTransition] = useTransition();

  function markClaimed() {
    startTransition(async () => {
      await recordClaim(dealSlug);
    });
  }

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the code is visible on screen either way.
    }
    markClaimed();
  }

  return (
    <div className="space-y-3">
      {redemption.type === "code" ? (
        <div className="flex flex-wrap items-center gap-2">
          <code className="flex-1 rounded-lg border border-dashed border-accent/50 bg-accent-soft px-4 py-3 font-mono text-sm tracking-wider text-accent-strong">
            {redemption.code}
          </code>
          <button
            type="button"
            onClick={() => copyCode(redemption.code)}
            className={buttonClass("secondary", "md")}
          >
            {copied ? (
              <Check className="size-4 text-accent-strong" aria-hidden="true" />
            ) : (
              <Copy className="size-4" aria-hidden="true" />
            )}
            {copied ? "Copied" : "Copy code"}
          </button>
        </div>
      ) : null}

      <a
        href={redemption.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={markClaimed}
        className={buttonClass("primary", "lg", "w-full sm:w-auto")}
      >
        {redemption.label ?? "Open the program page"}
        <ArrowUpRight className="size-4" aria-hidden="true" />
      </a>

      {redemption.type === "form" && redemption.note ? (
        <p className="text-sm text-muted">{redemption.note}</p>
      ) : null}
    </div>
  );
}
