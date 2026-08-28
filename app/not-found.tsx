import { Container } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-20">
      <div className="max-w-md text-center">
        <p className="eyebrow" data-figure>
          404
        </p>
        <h1 className="display mt-4 text-4xl">That program isn&rsquo;t here</h1>
        <p className="mt-3 leading-relaxed text-ink-soft">
          It may have been renamed, or the vendor may have ended the program and we removed it.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <ButtonLink href="/deals">Browse the catalog</ButtonLink>
          <ButtonLink href="/" variant="quiet">
            Home
          </ButtonLink>
        </div>
      </div>
    </Container>
  );
}
