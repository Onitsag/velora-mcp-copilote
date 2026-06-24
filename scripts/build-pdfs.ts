// Génère TOUS les rendus en PDF dans rendus/ , via un navigateur Chromium
// (Edge/Chrome) en mode headless. Aucune dépendance lourde.
// Usage : npm run pdf
import { execFile } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { marked } from "marked";

const execFileAsync = promisify(execFile);
const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "rendus");
const TMP_DIR = path.join(os.tmpdir(), "velora-pdf-build");

// Diagramme d'architecture en SVG inline (rendu fiable dans le PDF, sans JS/CDN).
const ARCHITECTURE_SVG = `
<svg viewBox="0 0 720 440" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Arial, sans-serif" font-size="13">
  <defs>
    <marker id="a" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L8,3 L0,6 Z" fill="#4f46e5"/>
    </marker>
    <marker id="g" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L8,3 L0,6 Z" fill="#059669"/>
    </marker>
    <marker id="v" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L8,3 L0,6 Z" fill="#7c3aed"/>
    </marker>
  </defs>
  <rect x="40" y="20" width="220" height="48" rx="8" fill="#eef2ff" stroke="#4f46e5"/>
  <text x="150" y="40" text-anchor="middle">Conseiller</text>
  <text x="150" y="57" text-anchor="middle" fill="#555">question en langage naturel</text>
  <rect x="40" y="140" width="220" height="56" rx="8" fill="#e0e7ff" stroke="#4f46e5"/>
  <text x="150" y="164" text-anchor="middle" font-weight="bold">Agent CLI (TypeScript)</text>
  <text x="150" y="182" text-anchor="middle" fill="#555">boucle tool-use</text>
  <rect x="380" y="134" width="300" height="64" rx="8" fill="#f5f3ff" stroke="#7c3aed"/>
  <text x="530" y="159" text-anchor="middle" font-weight="bold">LLM compatible OpenAI</text>
  <text x="530" y="179" text-anchor="middle" fill="#555">OpenAI · Ollama · LM Studio</text>
  <rect x="40" y="270" width="280" height="56" rx="8" fill="#e0e7ff" stroke="#4f46e5"/>
  <text x="180" y="294" text-anchor="middle" font-weight="bold">Serveur MCP Velora</text>
  <text x="180" y="312" text-anchor="middle" fill="#555">stdio · JSON-RPC</text>
  <rect x="60" y="372" width="240" height="46" rx="8" fill="#ecfdf5" stroke="#059669"/>
  <text x="180" y="392" text-anchor="middle" font-weight="bold">SQLite</text>
  <text x="180" y="409" text-anchor="middle" fill="#555">catalogue · stock · commandes</text>
  <rect x="380" y="250" width="300" height="40" rx="8" fill="#fff" stroke="#94a3b8"/>
  <text x="530" y="267" text-anchor="middle" font-weight="bold">Outils (6)</text>
  <text x="530" y="283" text-anchor="middle" fill="#555" font-size="11">search_products · get_order_status · …</text>
  <rect x="380" y="300" width="300" height="40" rx="8" fill="#fff" stroke="#94a3b8"/>
  <text x="530" y="317" text-anchor="middle" font-weight="bold">Ressources (2)</text>
  <text x="530" y="333" text-anchor="middle" fill="#555" font-size="11">policy://returns · policy://shipping</text>
  <line x1="150" y1="68" x2="150" y2="138" stroke="#4f46e5" stroke-width="1.5" marker-end="url(#a)"/>
  <line x1="260" y1="160" x2="378" y2="160" stroke="#4f46e5" stroke-width="1.5" marker-end="url(#a)"/>
  <text x="320" y="152" text-anchor="middle" font-size="11" fill="#4f46e5">tool calling</text>
  <line x1="378" y1="186" x2="262" y2="186" stroke="#7c3aed" stroke-width="1.2" stroke-dasharray="4 3" marker-end="url(#v)"/>
  <text x="320" y="202" text-anchor="middle" font-size="10" fill="#7c3aed">choisit les outils</text>
  <line x1="150" y1="196" x2="150" y2="268" stroke="#4f46e5" stroke-width="1.5" marker-end="url(#a)"/>
  <text x="168" y="236" text-anchor="middle" font-size="11" fill="#4f46e5">MCP</text>
  <line x1="180" y1="326" x2="180" y2="370" stroke="#059669" stroke-width="1.5" marker-end="url(#g)"/>
  <text x="210" y="352" text-anchor="middle" font-size="11" fill="#059669">Prisma</text>
  <line x1="320" y1="284" x2="378" y2="276" stroke="#94a3b8" stroke-width="1.2"/>
  <line x1="320" y1="302" x2="378" y2="316" stroke="#94a3b8" stroke-width="1.2"/>
</svg>`;

marked.use({
  renderer: {
    code({ text, lang }: { text: string; lang?: string }) {
      if (lang === "mermaid") return `<div class="diagram">${ARCHITECTURE_SVG}</div>`;
      const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return `<pre><code>${escaped}</code></pre>`;
    },
  },
});

const CSS = `
  @page { size: A4; margin: 18mm 15mm; }
  :root { --fg:#1a1a2e; --muted:#555; --accent:#4f46e5; --border:#ccc; }
  * { box-sizing: border-box; }
  body { font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: var(--fg);
    line-height: 1.5; font-size: 11.5pt; margin: 0; }
  h1 { font-size: 1.7rem; color: var(--accent); border-bottom: 3px solid var(--accent);
    padding-bottom: .25rem; margin: 1.6rem 0 .8rem; page-break-after: avoid; }
  h2 { font-size: 1.25rem; margin: 1.3rem 0 .5rem; border-bottom: 1px solid var(--border);
    padding-bottom: .15rem; page-break-after: avoid; }
  h3 { font-size: 1.05rem; margin: 1rem 0 .4rem; page-break-after: avoid; }
  p, li { orphans: 2; widows: 2; }
  table { border-collapse: collapse; width: 100%; margin: .8rem 0; font-size: .85rem; }
  th, td { border: 1px solid var(--border); padding: .4rem .55rem; text-align: left; vertical-align: top; }
  th { background: #f3f3fb; }
  code { background: #f3f3f6; padding: .08rem .28rem; border-radius: 4px; font-size: .85em; }
  pre { background: #f7f7fb; border: 1px solid var(--border); border-radius: 6px;
    padding: .7rem .9rem; overflow-x: auto; font-size: .78rem; page-break-inside: avoid; }
  pre code { background: none; padding: 0; }
  blockquote { border-left: 4px solid var(--accent); margin: .8rem 0; padding: .2rem 1rem;
    color: var(--muted); background: #fafaff; }
  a { color: var(--accent); text-decoration: none; }
  table, pre, blockquote, .diagram { page-break-inside: avoid; }
  .diagram { text-align: center; margin: 1.2rem 0; }
  .diagram svg { max-width: 100%; height: auto; }
  .cover { text-align: center; padding-top: 28vh; page-break-after: always; }
  .cover h1 { border: none; font-size: 2rem; }
  .cover .sub { font-size: 1.15rem; color: var(--muted); margin-top: .4rem; }
  .cover .meta { margin-top: 2rem; font-size: .95rem; color: var(--muted); }
`;

function wrap(title: string, inner: string): string {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"/>
<title>${title}</title><style>${CSS}</style></head><body>${inner}</body></html>`;
}

async function read(rel: string): Promise<string> {
  return readFile(path.join(ROOT, rel), "utf8");
}

function stripFrontMatter(md: string): string {
  return md.replace(/^---\n[\s\S]*?\n---\n/, "");
}

async function buildReportHtml(): Promise<string> {
  const blocs = [
    "docs/rapport/01-cadrage.md",
    "docs/rapport/02-rnd-poc.md",
    "docs/rapport/03-budget.md",
    "docs/rapport/04-pedagogie.md",
    "docs/rapport/05-posture.md",
  ];
  let body = `<div class="cover">
    <h1>Learning Lab M2DFS — MCP (Model Context Protocol)</h1>
    <div class="sub">Étude d'adoption — copilote conseiller de Velora (e-commerce fictif)</div>
    <div class="meta">Rendu écrit : rapport + POC (dépôt GitHub)<br/>
    POC : serveur MCP (TypeScript) + agent compatible OpenAI (cloud ou local)</div>
  </div>`;
  for (const b of blocs) {
    body += (await marked.parse(await read(b))) as string;
    body += '<div style="page-break-after:always"></div>';
  }
  return wrap("Rapport — MCP / Velora", body);
}

async function buildSimpleHtml(title: string, rels: string[]): Promise<string> {
  let body = "";
  for (let i = 0; i < rels.length; i++) {
    body += (await marked.parse(stripFrontMatter(await read(rels[i])))) as string;
    if (i < rels.length - 1) body += '<div style="page-break-after:always"></div>';
  }
  return wrap(title, body);
}

function findBrowser(): string | null {
  if (process.env.BROWSER_PDF && existsSync(process.env.BROWSER_PDF)) return process.env.BROWSER_PDF;
  const candidates =
    process.platform === "win32"
      ? [
          "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
          "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
          "C:/Program Files/Google/Chrome/Application/chrome.exe",
          "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
        ]
      : process.platform === "darwin"
        ? [
            "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            "/Applications/Chromium.app/Contents/MacOS/Chromium",
          ]
        : ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/microsoft-edge"];
  return candidates.find((c) => existsSync(c)) ?? null;
}

async function htmlToPdf(browser: string, htmlPath: string, pdfPath: string) {
  const profile = path.join(TMP_DIR, "profile-" + path.basename(pdfPath, ".pdf"));
  await execFileAsync(
    browser,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-pdf-header-footer",
      "--no-first-run",
      "--no-default-browser-check",
      `--user-data-dir=${profile}`,
      `--print-to-pdf=${pdfPath}`,
      pathToFileURL(htmlPath).href,
    ],
    { timeout: 90000 },
  );
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  await rm(TMP_DIR, { recursive: true, force: true });
  await mkdir(TMP_DIR, { recursive: true });

  const docs: Array<{ name: string; html: string }> = [
    { name: "1-Rapport-MCP-Velora", html: await buildReportHtml() },
    { name: "2-Guide-installation-POC", html: await buildSimpleHtml("Guide d'installation — POC", ["README.md"]) },
    {
      name: "3-Atelier-Coding-Kata",
      html: await buildSimpleHtml("Atelier & Coding Kata", [
        "docs/atelier/scenario.md",
        "docs/atelier/kata.md",
        "docs/atelier/kata-starter/README.md",
      ]),
    },
    { name: "4-Preuves-execution", html: await buildSimpleHtml("Preuves d'exécution", ["docs/demo/outils-demo.md"]) },
  ];

  const browser = findBrowser();
  for (const d of docs) {
    const htmlPath = path.join(TMP_DIR, d.name + ".html");
    await writeFile(htmlPath, d.html, "utf8");
    if (browser) {
      const pdfPath = path.join(OUT_DIR, d.name + ".pdf");
      await htmlToPdf(browser, htmlPath, pdfPath);
      console.error("PDF :", pdfPath);
    } else {
      const htmlOut = path.join(OUT_DIR, d.name + ".html");
      await writeFile(htmlOut, d.html, "utf8");
      console.error("HTML (pas de navigateur trouvé, à imprimer) :", htmlOut);
    }
  }

  if (!browser) {
    console.error("\n⚠️ Aucun navigateur Chromium trouvé : HTML générés dans rendus/.");
    console.error("   Ouvrez-les puis Imprimer → Enregistrer en PDF (ou définissez BROWSER_PDF).");
  } else {
    console.error("\n✅ Rendus PDF générés dans :", OUT_DIR);
  }
}

main().catch((e) => {
  console.error("Erreur build-pdfs :", e);
  process.exit(1);
});
