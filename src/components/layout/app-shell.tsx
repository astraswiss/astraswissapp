"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { hasCompany } from "@/lib/store/company";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // hasCompany() reads localStorage directly (not via useSyncExternalStore),
    // deliberately: the store hooks resolve to the SSR-safe `null` snapshot
    // during hydration and only correct themselves a tick later, which would
    // make this guard briefly (and wrongly) think no company exists and
    // bounce to /onboarding on every load. A direct, synchronous check here
    // avoids that false redirect.
    if (!hasCompany()) {
      router.replace("/onboarding");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
  }, [router]);

  if (!ready) return null;

  return (
    <div className="flex h-screen flex-col overflow-hidden md:flex-row">
      <Sidebar />
      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
