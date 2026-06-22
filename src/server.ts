import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { prisma } from "./db.js";
import { registerAllTools } from "./tools/index.js";
import { registerResources } from "./resources/index.js";
import { registerConseillerPrompt } from "./prompts/conseiller.js";

// ⚠️ En transport stdio, stdout est réservé au protocole JSON-RPC.
//    Tout log applicatif DOIT passer par stderr (console.error).

const server = new McpServer({
  name: "velora-copilote",
  version: "1.0.0",
});

registerAllTools(server);
registerResources(server);
registerConseillerPrompt(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[velora-mcp] Serveur MCP prêt (transport stdio).");
}

async function shutdown() {
  await prisma.$disconnect().catch(() => {});
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

main().catch((err) => {
  console.error("[velora-mcp] Erreur fatale au démarrage :", err);
  process.exit(1);
});
