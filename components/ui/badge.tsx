import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "muted";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        tone === "accent" && "border-accent/40 bg-accent-soft text-accent-strong",
        tone === "neutral" && "border-border bg-surface-2 text-muted",
        tone === "muted" && "border-transparent bg-transparent text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
