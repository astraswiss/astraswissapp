export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { compileDocumentPdf } from "@/lib/typst-compile";
import { pdfRequestSchema } from "@/lib/store/schemas";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = pdfRequestSchema.safeParse(body);
  if (!parsed.success || parsed.data.document.kind !== "invoice") {
    return NextResponse.json({ error: "Ungültige Rechnungsdaten." }, { status: 400 });
  }

  const { document, company, client } = parsed.data;
  try {
    const pdf = compileDocumentPdf("invoice", document, company, client);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${document.number}.pdf"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "PDF-Erstellung fehlgeschlagen." }, { status: 500 });
  }
}
