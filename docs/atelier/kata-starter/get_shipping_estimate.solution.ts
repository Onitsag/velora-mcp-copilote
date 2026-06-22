// KATA — solution de référence.
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "./util.js";

const EU = new Set([
  "DE", "BE", "ES", "IT", "NL", "PT", "LU", "IE", "AT", "FI", "GR", "PL", "SE",
  "DK", "CZ", "RO", "HU", "SK", "SI", "HR", "BG", "EE", "LV", "LT", "CY", "MT",
  "ALLEMAGNE", "BELGIQUE", "ESPAGNE", "ITALIE",
]);

function zoneOf(country: string): "FR" | "EU" | "HORS_UE" {
  const c = country.trim().toUpperCase();
  if (c === "FR" || c === "FRANCE") return "FR";
  if (EU.has(c)) return "EU";
  return "HORS_UE";
}

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
      const zone = zoneOf(country);
      if (zone === "HORS_UE") {
        return errorResult("Livraison indisponible hors Union européenne.");
      }
      const surcharge = weightKg > 2 ? 2 : 0;
      const base = zone === "FR" ? 4.9 : 9.9;
      const etaDays = zone === "FR" ? "2 à 3 jours" : "4 à 7 jours";
      const priceEur = Number((base + surcharge).toFixed(2));
      return jsonResult({ zone, etaDays, priceEur });
    },
  );
}
