"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { Client, Company, Invoice, Offer } from "@/lib/store/types";

export type DocumentPreviewPayload = {
  kind: "invoice" | "offer";
  document: Invoice | Offer;
  company: Company;
  client: Client;
};

type DocumentPreviewContextValue = {
  preview: DocumentPreviewPayload | null;
  showPreview: (payload: DocumentPreviewPayload) => void;
  clearPreview: () => void;
};

const DocumentPreviewContext = createContext<DocumentPreviewContextValue | null>(null);

/**
 * Lives above the docked chat panel in the service layout so a save inside
 * DocumentForm (several route segments below) can swap the persistent chat
 * card into a live PDF preview of what was just created/updated.
 */
export function DocumentPreviewProvider({ children }: { children: React.ReactNode }) {
  const [preview, setPreview] = useState<DocumentPreviewPayload | null>(null);
  const showPreview = useCallback((payload: DocumentPreviewPayload) => setPreview(payload), []);
  const clearPreview = useCallback(() => setPreview(null), []);

  return (
    <DocumentPreviewContext.Provider value={{ preview, showPreview, clearPreview }}>
      {children}
    </DocumentPreviewContext.Provider>
  );
}

export function useDocumentPreview() {
  const ctx = useContext(DocumentPreviewContext);
  if (!ctx) throw new Error("useDocumentPreview must be used within DocumentPreviewProvider");
  return ctx;
}
