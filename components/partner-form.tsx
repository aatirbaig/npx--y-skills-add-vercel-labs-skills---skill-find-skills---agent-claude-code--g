"use client";

import { useActionState } from "react";
import { submitPartnerDeal, type PartnerFormState } from "@/app/actions/partners";
import { Button } from "@/components/ui/button";

const initial: PartnerFormState = { status: "idle" };

export function PartnerForm() {
  const [state, action, pending] = useActionState(submitPartnerDeal, initial);

  if (state.status === "sent") {
    return (
      <div className="rounded-xl border border-accent/40 bg-accent-soft p-6">
        <p className="font-medium text-accent-strong">Submission received</p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4 rounded-xl border border-border bg-surface p-6">
      <Field name="company" label="Company" error={state.fieldErrors?.company}>
        <input
          id="company"
          name="company"
          required
          maxLength={120}
          className="h-11 w-full rounded-lg border border-border bg-bg px-3.5 text-sm outline-none focus:border-accent"
        />
      </Field>

      <Field name="email" label="Your email" error={state.fieldErrors?.email}>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="h-11 w-full rounded-lg border border-border bg-bg px-3.5 text-sm outline-none focus:border-accent"
        />
      </Field>

      <Field name="url" label="Official program page" error={state.fieldErrors?.url}>
        <input
          id="url"
          name="url"
          type="url"
          required
          placeholder="https://"
          className="h-11 w-full rounded-lg border border-border bg-bg px-3.5 text-sm outline-none placeholder:text-muted focus:border-accent"
        />
      </Field>

      <Field name="offer" label="What's the offer?" error={state.fieldErrors?.offer}>
        <textarea
          id="offer"
          name="offer"
          required
          rows={4}
          placeholder="What founders get, who qualifies, and how it's claimed."
          className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-sm outline-none placeholder:text-muted focus:border-accent"
        />
      </Field>

      {state.status === "error" && !state.fieldErrors ? (
        <p role="alert" className="text-sm text-muted">
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
        <p role="alert" className="mt-1.5 text-xs text-accent-strong">
          {error}
        </p>
      ) : null}
    </div>
  );
}
