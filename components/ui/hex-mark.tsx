import { cn } from "@/lib/utils";

const HEX = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

/**
 * The one piece of brand continuity carried over: vendor identity as a monogram
 * in the house hexagon, so we host nobody's logo file.
 */
export function HexMark({
  label,
  size = "md",
  tone = "paper",
  className,
}: {
  label: string;
  size?: "sm" | "md" | "lg";
  tone?: "paper" | "foil" | "ink";
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      style={{ clipPath: HEX }}
      className={cn(
        "flex shrink-0 items-center justify-center font-medium tracking-tight",
        tone === "paper" && "bg-foil-wash text-foil-ink",
        tone === "foil" && "bg-foil text-white",
        tone === "ink" && "bg-ink text-foil-glow",
        size === "sm" && "size-7 text-[8px]",
        size === "md" && "size-11 text-[11px]",
        size === "lg" && "size-16 text-sm",
        className,
      )}
    >
      {label}
    </span>
  );
}
