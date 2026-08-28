import Link from "next/link";
import { Container } from "@/components/ui/section";
import { HexMark } from "@/components/ui/hex-mark";
import { CATEGORIES } from "@/content/categories";
import { COLLECTIONS } from "@/content/collections";

const COMPANY = [
  { href: "/about", label: "About" },
  { href: "/editorial-policy", label: "Editorial policy" },
  { href: "/partners", label: "For partners" },
  { href: "/pricing", label: "Membership" },
] as const;

const LEGAL = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-28 border-t border-rule bg-paper">
      <Container className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <HexMark label="FB" size="sm" tone="foil" />
            <span className="display text-xl">FoundersBee</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">
            Verified startup credits, grants and discounts — with the eligibility rules stated
            before you spend the afternoon on an application.
          </p>
        </div>

        <FooterColumn title="Categories">
          {CATEGORIES.slice(0, 6).map((c) => (
            <FooterLink key={c.slug} href={`/category/${c.slug}`}>
              {c.name}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Collections">
          {COLLECTIONS.map((c) => (
            <FooterLink key={c.slug} href={`/collections/${c.slug}`}>
              {c.name}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="FoundersBee">
          {COMPANY.map((l) => (
            <FooterLink key={l.href} href={l.href}>
              {l.label}
            </FooterLink>
          ))}
        </FooterColumn>
      </Container>

      <Container className="flex flex-wrap items-center justify-between gap-4 border-t border-rule py-6 text-xs text-ink-soft">
        <p>
          © {new Date().getFullYear()} FoundersBee. Vendor names identify the programs those
          vendors run; no partnership is implied.
        </p>
        <div className="flex gap-5">
          {LEGAL.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-ink">
              {l.label}
            </Link>
          ))}
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow">{title}</p>
      <ul className="mt-4 space-y-2.5 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-ink-soft transition-colors duration-[160ms] [transition-timing-function:var(--ease-out)] hover:text-ink"
      >
        {children}
      </Link>
    </li>
  );
}
