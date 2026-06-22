import process from "node:process";
import { connectMcp } from "./mcpClient.js";
import { runAgent } from "./agent.js";
import { loadConfig } from "./config.js";

async function main() {
  const question = process.argv.slice(2).join(" ").trim();
  if (!question) {
    console.error('Usage : npm run agent -- "votre question"');
    process.exit(1);
  }

  const cfg = loadConfig();
  console.error(`[agent] Fournisseur : ${cfg.baseUrl} | Modèle : ${cfg.model}`);
  console.error(`[agent] Question : ${question}\n`);

  const { client, close } = await connectMcp();
  try {
    const { answer } = await runAgent({
      client,
      question,
      onEvent: (e) => {
        if (e.type === "tool_call") {
          console.error(`  ↳ outil ${e.name}(${JSON.stringify(e.args)})`);
        }
      },
    });
    // La réponse finale va sur stdout (le reste sur stderr).
    console.log("\n=== Réponse du copilote ===\n");
    console.log(answer);
    console.log();
  } finally {
    await close();
  }
}

main().catch((err) => {
  console.error("[agent] Erreur :", err instanceof Error ? err.message : err);
  process.exit(1);
});
