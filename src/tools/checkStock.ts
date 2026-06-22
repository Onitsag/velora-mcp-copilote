import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, findProductBySku, jsonResult } from "./util.js";

export function registerCheckStock(server: McpServer) {
  server.registerTool(
    "check_stock",
    {
      title: "Vérifier le stock",
      description:
        "Vérifie la disponibilité d'un produit, globalement ou pour une taille précise.",
      inputSchema: {
        sku: z.string().describe("SKU exact du produit, ex: VEL-CHAUS-001"),
        size: z.string().optional().describe("Taille précise, ex: 39, M, TU"),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ sku, size }) => {
      const p = await findProductBySku(sku);
      if (!p) return errorResult(`Aucun produit trouvé pour le SKU "${sku}".`);

      if (size) {
        const v = p.variants.find((v) => v.size.toLowerCase() === size.toLowerCase());
        if (!v) {
          return errorResult(
            `Taille "${size}" inconnue pour ${p.sku}. Tailles disponibles : ${p.variants
              .map((v) => v.size)
              .join(", ")}.`,
          );
        }
        return jsonResult({ sku: p.sku, size: v.size, stockQty: v.stockQty, available: v.stockQty > 0 });
      }

      return jsonResult({
        sku: p.sku,
        name: p.name,
        stockBySize: p.variants.map((v) => ({
          size: v.size,
          stockQty: v.stockQty,
          available: v.stockQty > 0,
        })),
      });
    },
  );
}
