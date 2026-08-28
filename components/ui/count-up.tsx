"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts to the anchor figure once, when it scrolls into view.
 *
 * Initial state is the *final* value, so server render and no-JS both show the
 * real number; the animation only rewinds and plays where motion is welcome.
 */
export function CountUp({
  to,
  prefix = "",
  suffix = "",
  duration = 1100,
}: {
  to: number;
  /** Strings, not a formatter — a function cannot cross the server boundary. */
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const [value, setValue] = useState(to);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();

        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          // Same decelerating curve as the CSS easing, so motion feels of a piece.
          const eased = 1 - Math.pow(1 - t, 3);
          setValue(Math.round(to * eased));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        setValue(0);
        frame = requestAnimationFrame(tick);
      },
      { rootMargin: "-40px" },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [to, duration]);

  return (
    <span ref={ref} data-figure>
      {prefix}
      {value.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}
