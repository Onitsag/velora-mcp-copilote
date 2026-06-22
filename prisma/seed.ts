// Seed des données fictives Velora. Idempotent : purge puis recrée.
// Exécution : `npm run db:seed` (ou via `npm run db:setup`).
import { prisma } from "../src/db.js";

type SeedProduct = {
  sku: string;
  name: string;
  description: string;
  category: string;
  color: string;
  priceCents: number;
  variants: { size: string; stockQty: number }[];
};

const PRODUCTS: SeedProduct[] = [
  { sku: "VEL-ROBE-001", name: "Robe portefeuille Lila", description: "Robe portefeuille en viscose, coupe fluide.", category: "Robes", color: "Violet", priceCents: 7900,
    variants: [{ size: "XS", stockQty: 3 }, { size: "S", stockQty: 0 }, { size: "M", stockQty: 5 }, { size: "L", stockQty: 2 }] },
  { sku: "VEL-ROBE-002", name: "Robe chemise Origan", description: "Robe chemise en coton bio, manches longues.", category: "Robes", color: "Kaki", priceCents: 6500,
    variants: [{ size: "S", stockQty: 4 }, { size: "M", stockQty: 2 }, { size: "L", stockQty: 0 }] },
  { sku: "VEL-TSHIRT-001", name: "T-shirt col rond Basalte", description: "T-shirt en coton peigné, coupe regular.", category: "T-shirts", color: "Noir", priceCents: 2500,
    variants: [{ size: "S", stockQty: 10 }, { size: "M", stockQty: 8 }, { size: "L", stockQty: 6 }, { size: "XL", stockQty: 0 }] },
  { sku: "VEL-TSHIRT-002", name: "T-shirt rayé Marin", description: "T-shirt rayé manches longues, jersey.", category: "T-shirts", color: "Bleu", priceCents: 2900,
    variants: [{ size: "S", stockQty: 5 }, { size: "M", stockQty: 5 }, { size: "L", stockQty: 5 }] },
  { sku: "VEL-JEAN-001", name: "Jean droit Indigo", description: "Jean coupe droite, denim brut.", category: "Jeans", color: "Bleu", priceCents: 8900,
    variants: [{ size: "36", stockQty: 2 }, { size: "38", stockQty: 4 }, { size: "40", stockQty: 3 }, { size: "42", stockQty: 1 }] },
  { sku: "VEL-VESTE-001", name: "Veste matelassée Brume", description: "Veste légère matelassée, idéale mi-saison.", category: "Vestes", color: "Gris", priceCents: 12900,
    variants: [{ size: "S", stockQty: 1 }, { size: "M", stockQty: 0 }, { size: "L", stockQty: 2 }] },
  { sku: "VEL-VESTE-002", name: "Trench Cottage", description: "Trench coat ceinturé, gabardine.", category: "Vestes", color: "Beige", priceCents: 15900,
    variants: [{ size: "S", stockQty: 0 }, { size: "M", stockQty: 1 }, { size: "L", stockQty: 1 }] },
  { sku: "VEL-CHAUS-001", name: "Bottines Chelsea Ardoise", description: "Bottines en cuir, élastiques latéraux.", category: "Chaussures", color: "Noir", priceCents: 11900,
    variants: [{ size: "38", stockQty: 2 }, { size: "39", stockQty: 3 }, { size: "40", stockQty: 0 }, { size: "41", stockQty: 1 }, { size: "42", stockQty: 2 }] },
  { sku: "VEL-CHAUS-002", name: "Baskets rétro Nuage", description: "Baskets basses en cuir, semelle gomme.", category: "Chaussures", color: "Blanc", priceCents: 8900,
    variants: [{ size: "38", stockQty: 4 }, { size: "39", stockQty: 0 }, { size: "40", stockQty: 2 }, { size: "41", stockQty: 3 }] },
  { sku: "VEL-ACC-001", name: "Écharpe laine Bruyère", description: "Écharpe 100% laine, tissage souple.", category: "Accessoires", color: "Violet", priceCents: 3900,
    variants: [{ size: "TU", stockQty: 12 }] },
  { sku: "VEL-ACC-002", name: "Ceinture cuir Tan", description: "Ceinture en cuir pleine fleur, boucle laiton.", category: "Accessoires", color: "Marron", priceCents: 4500,
    variants: [{ size: "85", stockQty: 3 }, { size: "90", stockQty: 2 }, { size: "95", stockQty: 0 }] },
  { sku: "VEL-PULL-001", name: "Pull col rond Avoine", description: "Pull en maille douce, col rond.", category: "Pulls", color: "Beige", priceCents: 6900,
    variants: [{ size: "S", stockQty: 3 }, { size: "M", stockQty: 4 }, { size: "L", stockQty: 2 }, { size: "XL", stockQty: 1 }] },
  { sku: "VEL-PULL-002", name: "Gilet zippé Mousse", description: "Gilet zippé en molleton gratté.", category: "Pulls", color: "Vert", priceCents: 5900,
    variants: [{ size: "S", stockQty: 0 }, { size: "M", stockQty: 0 }, { size: "L", stockQty: 0 }] },
  { sku: "VEL-JUPE-001", name: "Jupe plissée Pétale", description: "Jupe midi plissée, taille élastiquée.", category: "Jupes", color: "Rose", priceCents: 5500,
    variants: [{ size: "XS", stockQty: 2 }, { size: "S", stockQty: 3 }, { size: "M", stockQty: 4 }, { size: "L", stockQty: 1 }] },
  { sku: "VEL-CHEM-001", name: "Chemise lin Sable", description: "Chemise en lin lavé, coupe droite.", category: "Chemises", color: "Beige", priceCents: 5900,
    variants: [{ size: "S", stockQty: 5 }, { size: "M", stockQty: 3 }, { size: "L", stockQty: 2 }, { size: "XL", stockQty: 2 }] },
  { sku: "VEL-SAC-001", name: "Sac cabas Toile", description: "Sac cabas en toile et cuir, grande contenance.", category: "Accessoires", color: "Beige", priceCents: 7900,
    variants: [{ size: "TU", stockQty: 6 }] },
];

const CUSTOMERS = [
  { email: "alice.martin@example.com", name: "Alice Martin" },
  { email: "bruno.lefevre@example.com", name: "Bruno Lefèvre" },
  { email: "chloe.nguyen@example.com", name: "Chloé Nguyen" },
  { email: "david.rossi@example.com", name: "David Rossi" },
];

type SeedOrder = {
  reference: string;
  customerEmail: string;
  status: string;
  carrier?: string;
  trackingNumber?: string;
  items: { sku: string; size?: string; qty: number; priceCents: number }[];
};

const ORDERS: SeedOrder[] = [
  { reference: "VEL-1001", customerEmail: "alice.martin@example.com", status: "delivered", carrier: "Colissimo", trackingNumber: "6A11111111111",
    items: [{ sku: "VEL-ROBE-001", size: "M", qty: 1, priceCents: 7900 }, { sku: "VEL-ACC-001", size: "TU", qty: 1, priceCents: 3900 }] },
  { reference: "VEL-1002", customerEmail: "bruno.lefevre@example.com", status: "shipped", carrier: "Chronopost", trackingNumber: "XY222222222FR",
    items: [{ sku: "VEL-JEAN-001", size: "40", qty: 1, priceCents: 8900 }, { sku: "VEL-TSHIRT-001", size: "L", qty: 2, priceCents: 2500 }] },
  { reference: "VEL-1003", customerEmail: "chloe.nguyen@example.com", status: "preparing",
    items: [{ sku: "VEL-CHAUS-001", size: "39", qty: 1, priceCents: 11900 }, { sku: "VEL-PULL-001", size: "M", qty: 1, priceCents: 6900 }] },
  { reference: "VEL-1004", customerEmail: "david.rossi@example.com", status: "pending",
    items: [{ sku: "VEL-VESTE-002", size: "M", qty: 1, priceCents: 15900 }] },
  { reference: "VEL-1005", customerEmail: "alice.martin@example.com", status: "returned", carrier: "Colissimo", trackingNumber: "6A33333333333",
    items: [{ sku: "VEL-ROBE-002", size: "S", qty: 1, priceCents: 6500 }] },
  { reference: "VEL-1006", customerEmail: "bruno.lefevre@example.com", status: "cancelled",
    items: [{ sku: "VEL-CHAUS-002", size: "41", qty: 1, priceCents: 8900 }] },
];

async function main() {
  // Purge (ordre dépendances FK)
  await prisma.return.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();

  // Produits + variantes
  for (const p of PRODUCTS) {
    await prisma.product.create({
      data: {
        sku: p.sku,
        name: p.name,
        description: p.description,
        category: p.category,
        color: p.color,
        priceCents: p.priceCents,
        variants: { create: p.variants },
      },
    });
  }

  // Clients
  const customerIdByEmail = new Map<string, number>();
  for (const c of CUSTOMERS) {
    const created = await prisma.customer.create({ data: c });
    customerIdByEmail.set(c.email, created.id);
  }

  // Commandes + lignes
  for (const o of ORDERS) {
    const customerId = customerIdByEmail.get(o.customerEmail)!;
    await prisma.order.create({
      data: {
        reference: o.reference,
        customerId,
        status: o.status,
        carrier: o.carrier ?? null,
        trackingNumber: o.trackingNumber ?? null,
        items: {
          create: o.items.map((it) => ({
            sku: it.sku,
            size: it.size ?? null,
            qty: it.qty,
            priceCents: it.priceCents,
          })),
        },
      },
    });
  }

  // Un retour existant (commande VEL-1005)
  const returnedOrder = await prisma.order.findUnique({ where: { reference: "VEL-1005" } });
  if (returnedOrder) {
    await prisma.return.create({
      data: {
        orderId: returnedOrder.id,
        sku: "VEL-ROBE-002",
        size: "S",
        reason: "Taille trop petite",
        status: "approved",
      },
    });
  }

  const counts = {
    products: await prisma.product.count(),
    variants: await prisma.variant.count(),
    customers: await prisma.customer.count(),
    orders: await prisma.order.count(),
    returns: await prisma.return.count(),
  };
  console.error("[seed] OK", counts);
}

main()
  .catch((e) => {
    console.error("[seed] échec :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
