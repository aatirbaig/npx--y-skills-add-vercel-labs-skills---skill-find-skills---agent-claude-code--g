import type { Metadata } from "next";
import { MailCheck } from "lucide-react";
import { Container } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Check your email",
  robots: { index: false },
};

export default function CheckEmailPage() {
  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <div className="max-w-sm text-center">
        <MailCheck className="mx-auto size-8 text-accent-strong" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">Check your email</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          We sent you a sign-in link. It expires in a few minutes — open it on this device if
          you can.
        </p>
      </div>
    </Container>
  );
}
