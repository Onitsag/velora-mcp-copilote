import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { readPolicy } from "./policies.js";

/** Expose les documents de politique en tant que ressources MCP. */
export function registerResources(server: McpServer) {
  server.registerResource(
    "politique-retours",
    "policy://returns",
    {
      title: "Politique de retours",
      description: "Conditions de retour et d'échange de Velora.",
      mimeType: "text/markdown",
    },
    async (uri) => ({
      contents: [
        { uri: uri.href, mimeType: "text/markdown", text: await readPolicy("returns.md") },
      ],
    }),
  );

  server.registerResource(
    "politique-livraison",
    "policy://shipping",
    {
      title: "Politique de livraison",
      description: "Modes, délais et tarifs de livraison de Velora.",
      mimeType: "text/markdown",
    },
    async (uri) => ({
      contents: [
        { uri: uri.href, mimeType: "text/markdown", text: await readPolicy("shipping.md") },
      ],
    }),
  );
}
