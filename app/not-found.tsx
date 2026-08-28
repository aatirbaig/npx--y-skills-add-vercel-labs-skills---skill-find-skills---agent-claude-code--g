import { Container } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <div className="honeycomb w-full max-w-md rounded-xl border border-dashed border-border bg-surface/40 px-6 py-16 text-center">
        <p className="font-mono text-xs tracking-widest text-accent-strong uppercase">404</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">
          That program isn&rsquo;t here
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          It may have been renamed, or the vendor may have ended the program and we removed it.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <ButtonLink href="/deals">Browse the catalog</ButtonLink>
          <ButtonLink href="/" variant="secondary">
            Home
          </ButtonLink>
        </div>
      </div>
    </Container>
  );
}
