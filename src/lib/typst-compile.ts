import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { NodeCompiler } from "@myriaddreamin/typst-ts-node-compiler";
import type { Client, Company, Invoice, Offer } from "@/lib/store/types";

const TYPST_ROOT = path.join(process.cwd(), "src/typst");
const TEMPLATES_DIR = path.join(TYPST_ROOT, "templates");
const VENDORED_PACKAGES_DIR = path.join(TYPST_ROOT, "packages");
const FONTS_DIR = path.join(TYPST_ROOT, "fonts");
const CACHE_ROOT = path.join(os.tmpdir(), "astra-typst-cache");

let compiler: NodeCompiler | undefined;

/**
 * Typst resolves `@preview/*` imports from its package cache directory
 * (`$XDG_CACHE_HOME/typst/packages/preview/<name>/<version>`), fetching from
 * packages.typst.org on a miss. We vendor payqr-swiss and its own
 * dependency (tiaoma) in the repo and copy them into that exact cache
 * layout once per cold start, so compilation never depends on outbound
 * network access.
 */
function ensurePackageCache() {
  const cachedPackagesDir = path.join(CACHE_ROOT, "typst", "packages");
  if (fs.existsSync(cachedPackagesDir)) return;
  fs.mkdirSync(path.dirname(cachedPackagesDir), { recursive: true });
  fs.cpSync(VENDORED_PACKAGES_DIR, cachedPackagesDir, { recursive: true });
}

function getCompiler(): NodeCompiler {
  if (!compiler) {
    ensurePackageCache();
    process.env.XDG_CACHE_HOME = CACHE_ROOT;
    compiler = NodeCompiler.create({
      workspace: TEMPLATES_DIR,
      // Vendored variable fonts (Inter, Source Serif 4, Space Grotesk) — see
      // src/typst/fonts/*/OFL.txt. Without this, Typst falls back to
      // whatever font happens to be installed on the host (fine in this dev
      // sandbox, not guaranteed on the actual deploy target), which is why
      // the documents used to render in a generic system font.
      fontArgs: [
        {
          fontPaths: [
            path.join(FONTS_DIR, "inter"),
            path.join(FONTS_DIR, "source-serif-4"),
            path.join(FONTS_DIR, "space-grotesk"),
          ],
        },
      ],
    });
  }
  return compiler;
}

export function compileDocumentPdf(
  kind: "invoice" | "offer",
  document: Invoice | Offer,
  company: Company,
  client: Client,
): Buffer {
  const mainFilePath = path.join(TEMPLATES_DIR, document.templateId, `${kind}.typ`);
  const result = getCompiler().compile({
    mainFilePath,
    inputs: { data: JSON.stringify({ document, company, client }) },
  });
  if (result.hasError()) {
    const diagnostics = result.takeError()?.shortDiagnostics ?? [];
    throw new Error(`Typst-Kompilierung fehlgeschlagen: ${JSON.stringify(diagnostics)}`);
  }
  return getCompiler().pdf(result.result!);
}
