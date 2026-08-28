"use client";

import { useActionState } from "react";
import { submitPartnerDeal, type PartnerFormState } from "@/app/actions/partners";
import { Button } from "@/components/ui/button";

const initial: PartnerFormState = { status: "idle" };

export function PartnerForm() {
  const [state, action, pending] = useActionState(submitPartnerDeal, initial);

  if (state.status === "sent") {
    return (
      <div className="rounded-[8px] border border-foil/40 bg-foil-wash p-7">
        <p className="display text-2xl text-foil-ink">Submission received</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5 rounded-[8px] border border-rule bg-paper p-7">
      <Field name="company" label="Company" error={state.fieldErrors?.company}>
        <input
          id="company"
          name="company"
          required
          maxLength={120}
          className="h-12 w-full rounded-[6px] border border-rule-strong bg-ivory px-4 text-sm outline-none transition-colors duration-[160ms] [transition-timing-function:var(--ease-out)] focus:border-foil"
        />
      </Field>

      <Field name="email" label="Your email" error={state.fieldErrors?.email}>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="h-12 w-full rounded-[6px] border border-rule-strong bg-ivory px-4 text-sm outline-none transition-colors duration-[160ms] [transition-timing-function:var(--ease-out)] focus:border-foil"
        />
      </Field>

      <Field name="url" label="Official program page" error={state.fieldErrors?.url}>
        <input
          id="url"
          name="url"
          type="url"
          required
          placeholder="https://"
          className="h-12 w-full rounded-[6px] border border-rule-strong bg-ivory px-4 text-sm outline-none transition-colors duration-[160ms] [transition-timing-function:var(--ease-out)] placeholder:text-ink-soft focus:border-foil"
        />
      </Field>

      <Field name="offer" label="What's the offer?" error={state.fieldErrors?.offer}>
        <textarea
          id="offer"
          name="offer"
          required
          rows={4}
          placeholder="What founders get, who qualifies, and how it's claimed."
          className="w-full rounded-[6px] border border-rule-strong bg-ivory px-4 py-3 text-sm outline-none transition-colors duration-[160ms] [transition-timing-function:var(--ease-out)] placeholder:text-ink-soft focus:border-foil"
        />
      </Field>

      {state.status === "error" && !state.fieldErrors ? (
        <p role="alert" className="text-sm text-ink-soft">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Sending…" : "Submit the offer"}
      </Button>
    </form>
  );
}

function Field({
  name,
  label,
  error,
  children,
}: {
  name: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 text-xs text-foil-ink">
          {error}
        </p>
      ) : null}
    </div>
  );
}
