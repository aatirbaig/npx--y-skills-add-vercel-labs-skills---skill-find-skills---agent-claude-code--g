import { cn } from "@/lib/utils";

const HEX = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

/**
 * Vendor identity without hosting anybody's logo file: a monogram in the
 * house hexagon. Honest, consistent, and one less licensing question.
 */
export function HexMark({
  label,
  size = "md",
  className,
}: {
  label: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      style={{ clipPath: HEX }}
      className={cn(
        "flex shrink-0 items-center justify-center bg-surface-2 font-mono font-semibold tracking-tight text-accent-strong ring-1 ring-border",
        size === "sm" && "size-8 text-[9px]",
        size === "md" && "size-11 text-[11px]",
        size === "lg" && "size-16 text-sm",
        className,
      )}
    >
      {label}
    </span>
  );
}
