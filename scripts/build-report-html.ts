// Convertit docs/rapport/RAPPORT.md en un HTML autonome, prêt à imprimer en PDF
// (Imprimer → Enregistrer en PDF). Le diagramme mermaid est rendu via CDN.
// Usage : npm run report:html
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { marked } from "marked";

marked.use({
  renderer: {
    code({ text, lang }: { text: string; lang?: string }) {
      if (lang === "mermaid") {
        return `<pre class="mermaid">${text}</pre>`;
      }
      const escaped = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return `<pre><code>${escaped}</code></pre>`;
    },
  },
});

const dir = path.resolve(process.cwd(), "docs/rapport");
const md = await readFile(path.join(dir, "RAPPORT.md"), "utf8");
const body = md.replace(/^---\n[\s\S]*?\n---\n/, ""); // retire le front-matter YAML
const content = (await marked.parse(body)) as string;

const css = `
  :root { --fg:#1a1a2e; --muted:#555; --accent:#4f46e5; --border:#ddd; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
    color: var(--fg); line-height: 1.55; margin: 0; }
  main { max-width: 820px; margin: 0 auto; padding: 48px 32px; }
  h1 { font-size: 1.9rem; color: var(--accent); border-bottom: 3px solid var(--accent);
    padding-bottom: .3rem; margin-top: 2.2rem; }
  h2 { font-size: 1.35rem; margin-top: 1.8rem; border-bottom: 1px solid var(--border);
    padding-bottom: .2rem; }
  h3 { font-size: 1.1rem; margin-top: 1.3rem; }
  table { border-collapse: collapse; width: 100%; margin: 1rem 0; font-size: .92rem; }
  th, td { border: 1px solid var(--border); padding: .45rem .6rem; text-align: left;
    vertical-align: top; }
  th { background: #f3f3fb; }
  code { background: #f3f3f6; padding: .1rem .3rem; border-radius: 4px; font-size: .88em; }
  pre { background: #f7f7fb; border: 1px solid var(--border); border-radius: 8px;
    padding: .8rem 1rem; overflow-x: auto; }
  pre code { background: none; padding: 0; }
  pre.mermaid { background: #fff; border: none; text-align: center; }
  blockquote { border-left: 4px solid var(--accent); margin: 1rem 0; padding: .2rem 1rem;
    color: var(--muted); background: #fafaff; }
  a { color: var(--accent); }
  @media print {
    main { max-width: none; padding: 0; }
    h1 { page-break-before: always; }
    h1:first-of-type { page-break-before: avoid; }
    table, pre, blockquote { page-break-inside: avoid; }
  }
`;

const doc = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Rapport — MCP / Velora</title>
<style>${css}</style>
</head>
<body>
<main>${content}</main>
<script type="module">
  import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
  mermaid.initialize({ startOnLoad: true, theme: "neutral" });
</script>
</body>
</html>`;

const out = path.join(dir, "RAPPORT.html");
await writeFile(out, doc, "utf8");
console.error("HTML écrit :", out, "\n→ Ouvrez-le puis Imprimer → Enregistrer en PDF.");
