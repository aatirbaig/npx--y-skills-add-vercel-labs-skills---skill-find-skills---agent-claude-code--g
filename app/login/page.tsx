import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Mail } from "lucide-react";
import { auth, authConfigured, signIn } from "@/lib/auth";
import { Container } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to FoundersBee with a magic link — no password to remember.",
  robots: { index: false },
};

export default async function LoginPage(props: PageProps<"/login">) {
  const session = await auth().catch(() => null);
  if (session?.user) redirect("/dashboard");

  const params = await props.searchParams;
  const next = typeof params.next === "string" ? params.next : "/dashboard";
  const sendFailed = params.error === "send";

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in to FoundersBee</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          We email you a link. No password, no setup.
        </p>

        {sendFailed ? (
          <p
            role="alert"
            className="mt-6 rounded-lg border border-accent/40 bg-accent-soft px-4 py-3 text-sm text-muted"
          >
            We could not send that link. Try again in a moment — if it keeps
            failing, the email provider is misconfigured on this deployment.
          </p>
        ) : null}

        {authConfigured ? (
          <form
            action={async (formData: FormData) => {
              "use server";
              // `redirect: false` keeps Auth.js from bouncing through its own
              // verify-request route; we send people straight to our page.
              let destination = "/login/check-email";
              try {
                const result = await signIn("resend", {
                  email: String(formData.get("email") ?? ""),
                  redirectTo: next,
                  redirect: false,
                });
                // Auth.js reports a failed send by handing back an error URL
                // rather than throwing. Telling someone to check an inbox that
                // will stay empty is worse than telling them it broke.
                if (typeof result === "string" && result.includes("error=")) {
                  destination = "/login?error=send";
                }
              } catch {
                destination = "/login?error=send";
              }
              redirect(destination);
            }}
            className="mt-6 space-y-3"
          >
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@company.com"
              className="h-11 w-full rounded-lg border border-border bg-surface px-3.5 text-sm outline-none placeholder:text-muted focus:border-accent"
            />
            <Button type="submit" size="lg" className="w-full">
              <Mail className="size-4" aria-hidden="true" />
              Email me a link
            </Button>
          </form>
        ) : (
          <p className="mt-6 rounded-lg border border-dashed border-border bg-surface px-4 py-3 text-sm text-muted">
            Sign-in is not configured on this deployment. Set <code>AUTH_SECRET</code> in the
            environment to enable it.
          </p>
        )}

        <p className="mt-6 text-xs leading-relaxed text-muted">
          By signing in you agree to the{" "}
          <a href="/terms" className="underline underline-offset-2">
            terms
          </a>{" "}
          and{" "}
          <a href="/privacy" className="underline underline-offset-2">
            privacy policy
          </a>
          .
        </p>
      </div>
    </Container>
  );
}
