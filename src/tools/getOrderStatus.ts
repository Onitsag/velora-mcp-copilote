import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { prisma, formatPrice } from "../db.js";
import { errorResult, jsonResult } from "./util.js";

const STATUS_FR: Record<string, string> = {
  pending: "En attente de paiement/validation",
  preparing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  returned: "Retournée",
  cancelled: "Annulée",
};

export function registerGetOrderStatus(server: McpServer) {
  server.registerTool(
    "get_order_status",
    {
      title: "Statut d'une commande",
      description:
        "Renvoie le statut d'une commande à partir de sa référence (ex: VEL-1003), ou la liste des commandes d'un client à partir de son email.",
      inputSchema: {
        reference: z.string().optional().describe("Référence de commande, ex: VEL-1003"),
        email: z.string().optional().describe("Email du client"),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ reference, email }) => {
      if (!reference && !email) {
        return errorResult("Veuillez fournir une 'reference' (ex: VEL-1003) ou un 'email'.");
      }

      if (reference) {
        const orders = await prisma.order.findMany({ include: { items: true, customer: true } });
        const o = orders.find((x) => x.reference.toLowerCase() === reference.toLowerCase());
        if (!o) return errorResult(`Commande "${reference}" introuvable.`);
        const total = o.items.reduce((s, it) => s + it.priceCents * it.qty, 0);
        return jsonResult({
          reference: o.reference,
          status: o.status,
          statusLabel: STATUS_FR[o.status] ?? o.status,
          carrier: o.carrier,
          trackingNumber: o.trackingNumber,
          createdAt: o.createdAt,
          customer: { name: o.customer.name, email: o.customer.email },
          items: o.items.map((it) => ({
            sku: it.sku,
            size: it.size,
            qty: it.qty,
            unitPrice: formatPrice(it.priceCents),
          })),
          total: formatPrice(total),
        });
      }

      // Recherche par email
      const customers = await prisma.customer.findMany({
        include: { orders: { include: { items: true } } },
      });
      const c = customers.find((x) => x.email.toLowerCase() === email!.toLowerCase());
      if (!c) return errorResult(`Aucun client trouvé pour l'email "${email}".`);
      return jsonResult({
        customer: c.name,
        email: c.email,
        orders: c.orders.map((o) => ({
          reference: o.reference,
          status: o.status,
          statusLabel: STATUS_FR[o.status] ?? o.status,
          createdAt: o.createdAt,
          itemsCount: o.items.length,
        })),
      });
    },
  );
}
