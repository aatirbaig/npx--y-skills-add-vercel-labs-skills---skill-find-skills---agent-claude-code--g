import Link from "next/link";
import { Container } from "@/components/ui/section";
import { CATEGORIES } from "@/content/categories";
import { COLLECTIONS } from "@/content/collections";

const COMPANY = [
  { href: "/about", label: "About" },
  { href: "/editorial-policy", label: "Editorial policy" },
  { href: "/partners", label: "For partners" },
  { href: "/pricing", label: "Pricing" },
] as const;

const LEGAL = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-semibold tracking-tight">FoundersBee</p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
            Verified startup credits, grants and discounts — with the eligibility rules
            stated before you spend an afternoon on an application.
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

      <Container className="flex flex-wrap items-center justify-between gap-3 border-t border-border py-6 text-xs text-muted">
        <p>
          © {new Date().getFullYear()} FoundersBee. Vendor names are used to identify the
          programs they run; no partnership is implied.
        </p>
        <div className="flex gap-4">
          {LEGAL.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-fg">
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
      <p className="mb-3 text-xs font-semibold tracking-widest text-fg uppercase">{title}</p>
      <ul className="space-y-2 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-muted transition-colors hover:text-fg">
        {children}
      </Link>
    </li>
  );
}
