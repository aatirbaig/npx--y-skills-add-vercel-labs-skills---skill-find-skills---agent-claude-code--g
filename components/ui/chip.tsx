import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Chip({
  children,
  tone = "quiet",
  className,
}: {
  children: ReactNode;
  tone?: "quiet" | "foil" | "ink" | "bare";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium",
        tone === "quiet" && "border border-rule bg-paper text-ink-soft",
        tone === "foil" && "border border-foil/35 bg-foil-wash text-foil-ink",
        tone === "ink" && "bg-ink text-ivory",
        tone === "bare" && "px-0 text-ink-soft",
        className,
      )}
    >
      {children}
    </span>
  );
}
