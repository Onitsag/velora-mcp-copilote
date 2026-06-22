// KATA — squelette. Copier ce fichier vers src/tools/getShippingEstimate.ts,
// puis l'enregistrer dans src/tools/index.ts (cf. docs/atelier/kata.md).
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "./util.js";

export function registerGetShippingEstimate(server: McpServer) {
  server.registerTool(
    "get_shipping_estimate",
    {
      title: "Estimer la livraison",
      description: "Estime le délai et le tarif de livraison selon le pays et le poids.",
      inputSchema: {
        country: z.string().describe("Pays, ex: FR, France, DE"),
        weightKg: z.number().positive().describe("Poids du colis en kg"),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ country, weightKg }) => {
      // TODO (kata) :
      // 1. Déterminer la zone : "FR", "EU" ou hors UE.
      // 2. Hors UE  -> return errorResult("Livraison indisponible hors UE.").
      // 3. Calculer etaDays et priceEur (surcharge +2 € si weightKg > 2).
      // 4. return jsonResult({ zone, etaDays, priceEur });
      void country;
      void weightKg;
      void jsonResult;
      void errorResult;
      throw new Error("Kata : à implémenter");
    },
  );
}
