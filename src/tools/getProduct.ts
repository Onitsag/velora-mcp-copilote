import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { formatPrice } from "../db.js";
import { errorResult, findProductBySku, jsonResult } from "./util.js";

export function registerGetProduct(server: McpServer) {
  server.registerTool(
    "get_product",
    {
      title: "Détail d'un produit",
      description:
        "Renvoie la fiche complète d'un produit (description, prix, stock par taille) à partir de son SKU.",
      inputSchema: {
        sku: z.string().describe("SKU exact du produit, ex: VEL-ROBE-001"),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ sku }) => {
      const p = await findProductBySku(sku);
      if (!p) return errorResult(`Aucun produit trouvé pour le SKU "${sku}".`);
      return jsonResult({
        sku: p.sku,
        name: p.name,
        description: p.description,
        category: p.category,
        color: p.color,
        price: formatPrice(p.priceCents),
        available: p.variants.some((v) => v.stockQty > 0),
        variants: p.variants.map((v) => ({
          size: v.size,
          stockQty: v.stockQty,
          available: v.stockQty > 0,
        })),
      });
    },
  );
}
