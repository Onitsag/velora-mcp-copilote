import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { prisma } from "../db.js";
import { errorResult, jsonResult } from "./util.js";

export function registerCreateReturnRequest(server: McpServer) {
  server.registerTool(
    "create_return_request",
    {
      title: "Créer une demande de retour (RMA)",
      description:
        "Enregistre une demande de retour pour un article d'une commande LIVRÉE. Action d'écriture : en production, elle doit être confirmée par un humain (human-in-the-loop).",
      inputSchema: {
        reference: z.string().describe("Référence de la commande, ex: VEL-1001"),
        sku: z.string().describe("SKU de l'article à retourner"),
        reason: z.string().describe("Motif du retour"),
        size: z.string().optional().describe("Taille concernée (optionnel)"),
      },
      // Action d'écriture : non read-only.
      annotations: { readOnlyHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ reference, sku, reason, size }) => {
      const orders = await prisma.order.findMany({ include: { items: true } });
      const order = orders.find((x) => x.reference.toLowerCase() === reference.toLowerCase());
      if (!order) return errorResult(`Commande "${reference}" introuvable.`);

      if (order.status !== "delivered") {
        return errorResult(
          `Un retour n'est possible que pour une commande livrée. Statut actuel de ${order.reference} : ${order.status}.`,
        );
      }

      const item = order.items.find((it) => it.sku.toLowerCase() === sku.toLowerCase());
      if (!item) {
        return errorResult(`L'article ${sku} ne figure pas dans la commande ${order.reference}.`);
      }

      const rma = await prisma.return.create({
        data: {
          orderId: order.id,
          sku: item.sku,
          size: size ?? item.size ?? null,
          reason,
          status: "requested",
        },
      });

      return jsonResult({
        message: "Demande de retour enregistrée (RMA créé).",
        rmaId: rma.id,
        reference: order.reference,
        sku: item.sku,
        size: rma.size,
        status: rma.status,
        note: "En production, cette action nécessite une confirmation humaine avant validation.",
      });
    },
  );
}
