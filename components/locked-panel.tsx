import { Lock } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { PLANS } from "@/lib/stripe/plans";

/**
 * What an anonymous visitor and a free member see in place of the redemption.
 * There is nothing to un-blur: the payload was never sent.
 */
export function LockedPanel({ signedIn }: { signedIn: boolean }) {
  return (
    <div className="honeycomb rounded-xl border border-dashed border-accent/40 bg-surface/60 p-6">
      <div className="flex items-center gap-2 text-accent-strong">
        <Lock className="size-4" aria-hidden="true" />
        <span className="font-mono text-xs tracking-widest uppercase">Premium</span>
      </div>

      <h2 className="mt-3 text-lg font-semibold tracking-tight">
        The claim steps for this one are for members
      </h2>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
        This program is claimed through a partner route rather than a public sign-up page.
        Premium members get the exact steps and the code. Everything above — the value, who
        qualifies, the catch — stays free to read.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <ButtonLink href="/pricing">Unlock for ${PLANS.annual.price}/year</ButtonLink>
        {signedIn ? null : (
          <ButtonLink href="/login" variant="secondary">
            Already a member? Sign in
          </ButtonLink>
        )}
      </div>
    </div>
  );
}
