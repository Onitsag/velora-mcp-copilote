import { prisma } from "../db.js";

/** Résultat de tool MCP : un bloc texte JSON. */
export function jsonResult(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

/** Résultat d'erreur (isError=true) pour signaler un échec métier au modèle. */
export function errorResult(message: string) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify({ error: message }) }],
    isError: true as const,
  };
}

/** Recherche un produit par SKU (exact, puis insensible à la casse). */
export async function findProductBySku(sku: string) {
  const exact = await prisma.product.findUnique({
    where: { sku },
    include: { variants: true },
  });
  if (exact) return exact;
  const all = await prisma.product.findMany({ include: { variants: true } });
  return all.find((p) => p.sku.toLowerCase() === sku.toLowerCase()) ?? null;
}
