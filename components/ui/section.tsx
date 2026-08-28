import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("mx-auto w-full max-w-6xl px-6", className)}>{children}</div>;
}

export function Eyebrow({
  children,
  as: Tag = "p",
}: {
  children: ReactNode;
  as?: "p" | "h2" | "h3";
}) {
  return <Tag className="eyebrow">{children}</Tag>;
}

/** The hairline that carries most of the structure on this site. */
export function Rule({ className, strong }: { className?: string; strong?: boolean }) {
  return (
    <hr
      className={cn("border-0 border-t", strong ? "border-rule-strong" : "border-rule", className)}
    />
  );
}

export function SectionHeading({
  eyebrow,
  title,
  blurb,
  action,
  size = "md",
}: {
  eyebrow?: string;
  title: ReactNode;
  blurb?: ReactNode;
  action?: ReactNode;
  size?: "md" | "lg";
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
      <div className="max-w-2xl">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h2
          className={cn(
            "display mt-3",
            size === "lg" ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl",
          )}
        >
          {title}
        </h2>
        {blurb ? <p className="lede mt-4 text-base">{blurb}</p> : null}
      </div>
      {action}
    </div>
  );
}

/** A figure with its label — the site's basic unit of evidence. */
export function Stat({
  label,
  value,
  hint,
  size = "md",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div>
      <dt className="eyebrow text-ink-soft">{label}</dt>
      <dd
        data-figure
        className={cn(
          "display mt-2",
          size === "sm" && "text-2xl",
          size === "md" && "text-4xl",
          size === "lg" && "text-5xl sm:text-6xl",
        )}
      >
        {value}
      </dd>
      {hint ? <p className="mt-1.5 text-sm text-ink-soft">{hint}</p> : null}
    </div>
  );
}
