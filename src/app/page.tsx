"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasCompany } from "@/lib/store/company";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(hasCompany() ? "/rechnungen" : "/onboarding");
  }, [router]);

  return null;
}
