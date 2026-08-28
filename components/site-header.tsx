import Link from "next/link";
import { authConfigured } from "@/lib/auth";
import { Container } from "@/components/ui/section";
import { HexMark } from "@/components/ui/hex-mark";
import { AccountNav } from "@/components/account-nav";

const NAV = [
  { href: "/deals", label: "Catalog" },
  { href: "/collections/cloud-credits", label: "Collections" },
  { href: "/pricing", label: "Membership" },
  { href: "/partners", label: "Partners" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-ivory/90 backdrop-blur-sm">
      <Container className="flex h-[4.5rem] items-center gap-8">
        <Link href="/" className="flex items-center gap-2.5">
          <HexMark label="FB" size="sm" tone="foil" />
          <span className="display text-xl">FoundersBee</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-ink-soft md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors duration-[160ms] [transition-timing-function:var(--ease-out)] hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <AccountNav authEnabled={authConfigured} />
        </div>
      </Container>
    </header>
  );
}
