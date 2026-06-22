import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Gabarit de prompt réutilisable, exposé via MCP. Un client (Claude Desktop,
 * agent custom...) peut le récupérer pour cadrer la réponse d'un conseiller.
 */
export function registerConseillerPrompt(server: McpServer) {
  server.registerPrompt(
    "conseiller_reply",
    {
      title: "Réponse conseiller Velora",
      description:
        "Cadre une réponse de conseiller client en s'appuyant sur les outils Velora (catalogue, stock, commandes, politiques).",
      argsSchema: {
        question: z.string().describe("La question du client"),
        customerEmail: z.string().optional().describe("Email du client, si connu"),
      },
    },
    ({ question, customerEmail }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text:
              `Tu es un conseiller du service client de Velora (e-commerce mode). ` +
              `Réponds en français, de manière concise et professionnelle. ` +
              `Appuie-toi UNIQUEMENT sur les outils (search_products, get_product, check_stock, ` +
              `get_order_status, get_return_policy) pour les faits : n'invente jamais un prix, ` +
              `un stock ou un statut de commande. Cite les références (SKU, n° de commande).\n\n` +
              `Question du client : « ${question} »` +
              (customerEmail ? `\nEmail du client : ${customerEmail}` : ""),
          },
        },
      ],
    }),
  );
}
