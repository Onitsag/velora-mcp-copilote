// Assemble les 5 blocs du rapport en un seul Markdown (docs/rapport/RAPPORT.md),
// prêt à exporter en PDF. Usage : npm run report:build
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const dir = path.resolve(process.cwd(), "docs/rapport");
const FILES = [
  "01-cadrage.md",
  "02-rnd-poc.md",
  "03-budget.md",
  "04-pedagogie.md",
  "05-posture.md",
];

const cover = `---
title: "Learning Lab M2DFS : MCP (Model Context Protocol)"
subtitle: "Étude d'adoption pour le copilote conseiller de Velora (e-commerce)"
date: "2026"
---

# Learning Lab M2DFS : MCP (Model Context Protocol)
## Étude d'adoption : copilote conseiller de Velora (e-commerce fictif)

**Rendu écrit** : rapport + POC (dépôt GitHub).
**POC** : serveur MCP (TypeScript) + agent compatible OpenAI (cloud ou local).

---

`;

let out = cover;
for (const f of FILES) {
  out += await readFile(path.join(dir, f), "utf8");
  out += "\n\n---\n\n";
}

const target = path.join(dir, "RAPPORT.md");
await writeFile(target, out, "utf8");
console.error("Rapport assemblé :", target);
