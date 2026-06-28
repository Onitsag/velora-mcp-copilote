import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "./generated/prisma/client.js";

// Résout l'URL SQLite. Un chemin relatif (file:./dev.db) est résolu par rapport
// à la RACINE du projet (et non au dossier courant), pour que le serveur trouve
// sa base quel que soit l'endroit d'où il est lancé (ex: Claude Desktop).
function resolveDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL ?? "file:./dev.db";
  if (!raw.startsWith("file:")) return raw;
  const rest = raw.slice("file:".length);
  if (rest === ":memory:" || path.isAbsolute(rest)) return raw;
  const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  return "file:" + path.resolve(projectRoot, rest);
}

const adapter = new PrismaBetterSqlite3({ url: resolveDatabaseUrl() });

export const prisma = new PrismaClient({ adapter });

/** Formate un prix (centimes) en euros lisibles, ex: 7900 -> "79,00 €". */
export function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",") + " €";
}
