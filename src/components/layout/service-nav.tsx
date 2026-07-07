"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/rechnungen", label: "Rechnungen" },
  { href: "/offerten", label: "Offerten" },
  { href: "/kunden", label: "Kunden" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ServiceNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex gap-1 border-b border-line">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "-mb-px border-b-2 px-3 py-2.5 text-sm font-medium tracking-tight transition-colors",
            isActive(pathname, tab.href)
              ? "border-accent text-accent"
              : "border-transparent text-ink-soft hover:text-ink",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
