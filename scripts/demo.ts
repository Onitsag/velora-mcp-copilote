// Démo de bout en bout AVEC un vrai LLM (OpenAI, Ollama, LM Studio... selon .env).
// Rejoue des questions de conseiller et écrit les transcripts dans
// docs/demo/transcripts/agent-demo.md. Usage : npm run demo
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { connectMcp } from "../src/agent/mcpClient.js";
import { runAgent } from "../src/agent/agent.js";
import { loadConfig } from "../src/agent/config.js";

const QUESTIONS = [
  "Avez-vous la robe portefeuille Lila (VEL-ROBE-001) en taille S ? Si non, quelles tailles sont dispo ?",
  "Où en est la commande VEL-1003 et que contient-elle ?",
  "Quelles baskets blanches avez-vous en stock, et à quel prix ?",
  "La cliente alice.martin@example.com veut retourner la robe de sa commande VEL-1001. Est-ce possible et comment ?",
];

const cfg = loadConfig();
console.error(`[demo] Fournisseur : ${cfg.baseUrl} | Modèle : ${cfg.model}`);

const { client, close } = await connectMcp();

let md = `# Transcripts de démo : Copilote conseiller Velora\n\n`;
md += `> Généré par \`npm run demo\`.\n>\n`;
md += `> Fournisseur : \`${cfg.baseUrl}\`, Modèle : \`${cfg.model}\`\n\n`;
md += `Chaque réponse est produite par l'agent via la boucle *tool-use* sur le serveur MCP.\n\n---\n\n`;

for (const question of QUESTIONS) {
  console.error("[demo] Q:", question);
  const { answer, steps } = await runAgent({
    client,
    question,
    onEvent: (e) => {
      if (e.type === "tool_call") console.error("   ↳ outil", e.name);
    },
  });

  md += `## ❓ ${question}\n\n`;
  const toolSteps = steps.filter((s) => s.type === "tool_call") as Array<{
    name: string;
    args: unknown;
  }>;
  if (toolSteps.length > 0) {
    md += `**Outils appelés :**\n\n`;
    md += toolSteps.map((s) => `- \`${s.name}(${JSON.stringify(s.args)})\``).join("\n") + "\n\n";
  }
  md += `**Réponse du copilote :**\n\n${answer}\n\n---\n\n`;
}

await close();

const out = path.resolve(process.cwd(), "docs/demo/transcripts/agent-demo.md");
await mkdir(path.dirname(out), { recursive: true });
await writeFile(out, md, "utf8");
console.error("[demo] Transcript écrit dans :", out);
process.exit(0);
