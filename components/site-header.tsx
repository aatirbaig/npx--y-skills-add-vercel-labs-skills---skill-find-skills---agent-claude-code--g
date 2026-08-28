import Link from "next/link";
import { authConfigured } from "@/lib/auth";
import { Container } from "@/components/ui/section";
import { HexMark } from "@/components/ui/hex-mark";
import { AccountNav } from "@/components/account-nav";

const NAV = [
  { href: "/deals", label: "Deals" },
  { href: "/collections/cloud-credits", label: "Collections" },
  { href: "/pricing", label: "Pricing" },
  { href: "/partners", label: "For partners" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur">
      <Container className="flex h-16 items-center gap-6">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <HexMark label="FB" size="sm" />
          FoundersBee
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-muted md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-fg">
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
