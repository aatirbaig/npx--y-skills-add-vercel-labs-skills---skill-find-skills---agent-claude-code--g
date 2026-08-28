import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("mx-auto w-full max-w-6xl px-5", className)}>{children}</div>;
}

export function SectionHeading({
  eyebrow,
  title,
  blurb,
  action,
}: {
  eyebrow?: string;
  title: string;
  blurb?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-2 font-mono text-xs tracking-widest text-accent-strong uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          {title}
        </h2>
        {blurb ? <p className="mt-2 text-muted text-pretty">{blurb}</p> : null}
      </div>
      {action}
    </div>
  );
}
