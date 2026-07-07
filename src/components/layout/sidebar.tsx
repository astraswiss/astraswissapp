"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/rechnungen", label: "Rechnungen & Offerten", serviceRoots: ["/rechnungen", "/offerten", "/kunden"] },
  { href: "/einstellungen", label: "Einstellungen", serviceRoots: ["/einstellungen"] },
];

function isActive(pathname: string, roots: string[]) {
  return roots.some((root) => pathname === root || pathname.startsWith(`${root}/`));
}

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop: vertical sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-line bg-paper px-4 py-6 md:flex">
        <Link href="/rechnungen" className="px-2 text-lg font-semibold tracking-tight text-ink">
          Astra
        </Link>
        <nav className="mt-8 flex flex-col gap-0.5">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium tracking-tight transition-colors",
                isActive(pathname, link.serviceRoots)
                  ? "bg-accent-soft text-accent"
                  : "text-ink-soft hover:bg-paper-raised hover:text-ink",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile: sticky top bar + hamburger panel */}
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link
            href="/rechnungen"
            className="text-lg font-semibold tracking-tight text-ink"
            onClick={() => setOpen(false)}
          >
            Astra
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menü öffnen"
            aria-expanded={open}
            className="flex h-9 w-9 flex-col items-center justify-center gap-1.5"
          >
            <span
              className={cn(
                "h-px w-6 bg-ink transition-transform",
                open && "translate-y-[3.5px] rotate-45",
              )}
            />
            <span
              className={cn(
                "h-px w-6 bg-ink transition-transform",
                open && "-translate-y-[3.5px] -rotate-45",
              )}
            />
          </button>
        </div>

        {open && (
          <nav className="flex flex-col gap-1 border-t border-line px-4 py-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-base font-medium tracking-tight",
                  isActive(pathname, link.serviceRoots) ? "bg-accent-soft text-accent" : "text-ink",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
    </>
  );
}
