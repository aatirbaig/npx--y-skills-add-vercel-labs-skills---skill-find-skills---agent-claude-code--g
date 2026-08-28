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
      // Clipboard can be blocked; the code is on screen either way.
    }
    markClaimed();
  }

  return (
    <div className="space-y-4">
      {redemption.type === "code" ? (
        <div className="flex flex-wrap items-center gap-3">
          <code
            data-figure
            className="flex-1 rounded-[6px] border border-dashed border-foil/50 bg-foil-wash px-4 py-3 font-mono text-sm tracking-wider text-foil-ink"
          >
            {redemption.code}
          </code>
          <button
            type="button"
            onClick={() => copyCode(redemption.code)}
            className={buttonClass("quiet", "md")}
          >
            {copied ? (
              <Check className="size-4 text-foil-ink" aria-hidden="true" />
            ) : (
              <Copy className="size-4" aria-hidden="true" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      ) : null}

      <a
        href={redemption.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={markClaimed}
        className={buttonClass("foil", "lg", "w-full sm:w-auto")}
      >
        {redemption.label ?? "Open the program page"}
        <ArrowUpRight className="size-4" aria-hidden="true" />
      </a>

      {redemption.type === "form" && redemption.note ? (
        <p className="text-sm text-ink-soft">{redemption.note}</p>
      ) : null}
    </div>
  );
}
