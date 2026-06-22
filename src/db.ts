import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "./generated/prisma/client.js";

// Prisma 7 : connexion via un *driver adapter* (ici better-sqlite3).
// L'URL provient de DATABASE_URL (.env), résolue par rapport au dossier courant.
const url = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url });

export const prisma = new PrismaClient({ adapter });

/** Formate un prix (centimes) en euros lisibles, ex: 7900 -> "79,00 €". */
export function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",") + " €";
}
