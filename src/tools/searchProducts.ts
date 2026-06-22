import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { prisma, formatPrice } from "../db.js";
import { jsonResult } from "./util.js";

export function registerSearchProducts(server: McpServer) {
  server.registerTool(
    "search_products",
    {
      title: "Rechercher des produits",
      description:
        "Recherche dans le catalogue Velora par mots-clés, catégorie, couleur et prix maximum. Renvoie pour chaque produit son SKU, son prix et sa disponibilité.",
      inputSchema: {
        query: z.string().optional().describe("Mots-clés recherchés dans le nom et la description"),
        category: z.string().optional().describe("Catégorie, ex: Robes, Chaussures, Accessoires"),
        color: z.string().optional().describe("Couleur, ex: Noir, Bleu, Beige"),
        maxPriceEur: z.number().positive().optional().describe("Prix maximum en euros"),
        inStockOnly: z.boolean().optional().describe("Ne renvoyer que les produits ayant du stock"),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ query, category, color, maxPriceEur, inStockOnly }) => {
      const products = await prisma.product.findMany({ include: { variants: true } });
      const q = query?.toLowerCase();
      const results = products
        .filter((p) => (category ? p.category.toLowerCase() === category.toLowerCase() : true))
        .filter((p) => (color ? p.color.toLowerCase() === color.toLowerCase() : true))
        .filter((p) =>
          typeof maxPriceEur === "number" ? p.priceCents <= Math.round(maxPriceEur * 100) : true,
        )
        .filter((p) =>
          q ? `${p.name} ${p.description} ${p.category} ${p.color}`.toLowerCase().includes(q) : true,
        )
        .map((p) => {
          const totalStock = p.variants.reduce((s, v) => s + v.stockQty, 0);
          return {
            sku: p.sku,
            name: p.name,
            category: p.category,
            color: p.color,
            price: formatPrice(p.priceCents),
            available: totalStock > 0,
            totalStock,
          };
        })
        .filter((r) => (inStockOnly ? r.available : true));

      return jsonResult({ count: results.length, products: results });
    },
  );
}
