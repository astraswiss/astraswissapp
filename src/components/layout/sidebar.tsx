"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/rechnungen", label: "Rechnungen" },
  { href: "/offerten", label: "Offerten" },
  { href: "/kunden", label: "Kunden" },
  { href: "/einstellungen", label: "Einstellungen" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-line bg-paper px-4 py-6">
      <Link href="/rechnungen" className="px-2 text-lg font-semibold tracking-tight text-ink">
        Astra
      </Link>
      <nav className="mt-8 flex flex-col gap-0.5">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium tracking-tight transition-colors",
                active ? "bg-accent-soft text-accent" : "text-ink-soft hover:bg-paper-raised hover:text-ink",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
