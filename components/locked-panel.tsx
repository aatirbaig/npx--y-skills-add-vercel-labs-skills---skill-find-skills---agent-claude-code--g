import { Lock } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { DealAnchor } from "@/components/value-anchor";
import { PLANS } from "@/lib/stripe/plans";

/**
 * The paywall, and the highest-leverage copy on the site — this is the moment
 * someone decides. Nothing here is blurred: the payload was never sent, so
 * there is nothing to reveal in devtools.
 */
export function LockedPanel({
  signedIn,
  statedValue,
}: {
  signedIn: boolean;
  statedValue: number;
}) {
  return (
    <section className="rounded-[8px] bg-ink p-7 text-ivory sm:p-9">
      <p className="eyebrow flex items-center gap-2 text-foil-glow">
        <Lock className="size-3.5" aria-hidden="true" />
        Members only
      </p>

      <h2 className="display mt-4 text-3xl">The claim route for this one is negotiated</h2>

      <p className="mt-4 max-w-prose leading-relaxed text-[#c9c1ae]">
        This program is claimed through a partner code or referral rather than a public sign-up
        page. Members get the exact steps and the code. Everything above — the value, who
        qualifies, the catch — stays free to read.
      </p>

      {statedValue > PLANS.annual.price ? (
        <div className="mt-6 border-t border-[#332c1e] pt-5 text-[#c9c1ae]">
          <DealAnchor statedValue={statedValue} tone="inverted" />
        </div>
      ) : null}

      <div className="mt-7 flex flex-wrap gap-3">
        <ButtonLink href="/pricing" variant="inverted" size="lg">
          Unlock for ${PLANS.annual.price}/year
        </ButtonLink>
        {signedIn ? null : (
          <ButtonLink
            href="/login"
            size="lg"
            className="border border-[#3a3323] bg-transparent text-ivory hover:bg-[#241f14]"
          >
            Already a member? Sign in
          </ButtonLink>
        )}
      </div>
    </section>
  );
}
