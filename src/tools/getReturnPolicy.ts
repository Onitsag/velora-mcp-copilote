import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { readPolicy } from "../resources/policies.js";

export function registerGetReturnPolicy(server: McpServer) {
  server.registerTool(
    "get_return_policy",
    {
      title: "Politique de retours",
      description:
        "Renvoie la politique de retours et d'échanges de Velora (délais, conditions, remboursement).",
      inputSchema: {
        category: z
          .string()
          .optional()
          .describe("Catégorie concernée (optionnel, pour contextualiser la réponse)"),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ category }) => {
      const policy = await readPolicy("returns.md");
      const note = category
        ? `\n\n> Contexte demandé : catégorie « ${category} ». Vérifiez les exceptions ci-dessus.`
        : "";
      return { content: [{ type: "text" as const, text: policy + note }] };
    },
  );
}
