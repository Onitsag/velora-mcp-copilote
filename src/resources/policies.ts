import { readFile } from "node:fs/promises";
import path from "node:path";

// Les fichiers .md ne sont pas compilés : on les lit depuis les sources,
// relativement au dossier d'exécution (racine du projet).
const POLICIES_DIR = path.resolve(process.cwd(), "src/resources/policies");

export type PolicyFile = "returns.md" | "shipping.md";

export async function readPolicy(file: PolicyFile): Promise<string> {
  return readFile(path.join(POLICIES_DIR, file), "utf8");
}
