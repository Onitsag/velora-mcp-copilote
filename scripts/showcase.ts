// Démonstration des outils MCP SANS LLM : appels réels du client vers le serveur,
// résultats bruts écrits dans docs/demo/outils-demo.md (preuve "conditions réelles").
// Usage : npm run showcase
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { connectMcp } from "../src/agent/mcpClient.js";

const { client, close } = await connectMcp();

let md = `# Démonstration des outils MCP (sans LLM)\n\n`;
md += `Ce document est généré par \`npm run showcase\` : il contient des **appels réels**\n`;
md += `du client MCP vers le serveur Velora et les **résultats bruts** renvoyés.\n\n`;

const { tools } = await client.listTools();
md += `## Outils disponibles\n\n`;
md += tools.map((t) => `- \`${t.name}\` — ${t.description ?? ""}`).join("\n") + "\n\n";

const { resources } = await client.listResources();
md += `## Ressources disponibles\n\n`;
md += resources.map((r) => `- \`${r.uri}\` — ${r.name}`).join("\n") + "\n\n";

const demos: Array<[string, string, Record<string, unknown>]> = [
  ["Rechercher les robes en stock", "search_products", { category: "Robes", inStockOnly: true }],
  ["Fiche produit — bottines Chelsea", "get_product", { sku: "VEL-CHAUS-001" }],
  ["Vérifier le stock de la taille 39", "check_stock", { sku: "VEL-CHAUS-001", size: "39" }],
  ["Statut de la commande VEL-1003", "get_order_status", { reference: "VEL-1003" }],
  ["Commandes du client alice.martin", "get_order_status", { email: "alice.martin@example.com" }],
  [
    "Retour refusé (commande non livrée)",
    "create_return_request",
    { reference: "VEL-1003", sku: "VEL-PULL-001", reason: "Trop grand" },
  ],
  [
    "Retour accepté (commande livrée VEL-1001)",
    "create_return_request",
    { reference: "VEL-1001", sku: "VEL-ROBE-001", reason: "Taille trop grande" },
  ],
];

for (const [title, name, args] of demos) {
  const res: any = await client.callTool({ name, arguments: args });
  const text = res?.content?.[0]?.text ?? JSON.stringify(res);
  const flag = res?.isError ? "  ⚠️ _(isError)_" : "";
  md += `## ${title}${flag}\n\n`;
  md += `**Appel :** \`${name}(${JSON.stringify(args)})\`\n\n`;
  md += "```json\n" + text + "\n```\n\n";
}

await close();

const out = path.resolve(process.cwd(), "docs/demo/outils-demo.md");
await mkdir(path.dirname(out), { recursive: true });
await writeFile(out, md, "utf8");
console.error("Showcase écrit dans :", out);
process.exit(0);
