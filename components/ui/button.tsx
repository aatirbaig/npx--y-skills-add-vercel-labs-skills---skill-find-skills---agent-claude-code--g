import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/* Pressable things scale on :active — 160ms, transform only, so the interface
   answers immediately. Hover is gated to real pointers so a tap does not
   trigger a stuck hover state. */
const base =
  "inline-flex items-center justify-center gap-2 rounded-[6px] font-medium " +
  "transition-[transform,background-color,border-color,color] duration-[160ms] " +
  "[transition-timing-function:var(--ease-out)] active:scale-[0.97] " +
  "disabled:pointer-events-none disabled:opacity-50";

const variants = {
  foil: "bg-ink text-ivory hover:bg-[#241f14]",
  gold: "bg-foil text-white hover:bg-[#a2760a]",
  quiet: "border border-rule-strong bg-transparent text-ink hover:bg-foil-wash",
  ghost: "text-ink-soft hover:text-ink",
  inverted: "bg-ivory text-ink hover:bg-white",
} as const;

const sizes = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
} as const;

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

export function buttonClass(variant: Variant = "foil", size: Size = "md", extra?: string) {
  return cn(base, variants[variant], sizes[size], extra);
}

export function Button({
  variant = "foil",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({
  variant = "foil",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}
