import path from "node:path";
import process from "node:process";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export type McpConnection = {
  client: Client;
  close: () => Promise<void>;
};

/**
 * Démarre le serveur MCP Velora (dist/server.js) en sous-processus stdio
 * et s'y connecte. Le serveur est totalement indépendant du LLM.
 */
export async function connectMcp(): Promise<McpConnection> {
  const serverPath = path.resolve(process.cwd(), "dist/server.js");

  // On transmet l'environnement courant (dont DATABASE_URL) au serveur.
  const env: Record<string, string> = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (typeof v === "string") env[k] = v;
  }

  const transport = new StdioClientTransport({
    command: process.execPath, // binaire node courant
    args: [serverPath],
    cwd: process.cwd(),
    env,
    stderr: "inherit", // les logs serveur (stderr) restent visibles
  });

  const client = new Client({ name: "velora-agent", version: "1.0.0" }, { capabilities: {} });
  await client.connect(transport);
  return { client, close: () => client.close() };
}
