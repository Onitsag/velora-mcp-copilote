// KATA — test de validation. Copier vers tests/shipping.test.ts une fois l'outil
// implémenté et enregistré, puis lancer `npm test`.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { connectMcp, type McpConnection } from "../src/agent/mcpClient.js";

let conn: McpConnection;
beforeAll(async () => {
  conn = await connectMcp();
});
afterAll(async () => {
  await conn?.close();
});

function dataOf(res: unknown): any {
  return JSON.parse((res as any)?.content?.[0]?.text);
}

describe("Kata — get_shipping_estimate", () => {
  it("France : 4,90 € en 2 à 3 jours", async () => {
    const res = await conn.client.callTool({
      name: "get_shipping_estimate",
      arguments: { country: "FR", weightKg: 1 },
    });
    const d = dataOf(res);
    expect(d.zone).toBe("FR");
    expect(d.priceEur).toBe(4.9);
  });

  it("UE avec surcharge poids : 12,90 €", async () => {
    const res = await conn.client.callTool({
      name: "get_shipping_estimate",
      arguments: { country: "DE", weightKg: 3 },
    });
    expect(dataOf(res).priceEur).toBe(12.9);
  });

  it("Hors UE : erreur", async () => {
    const res = await conn.client.callTool({
      name: "get_shipping_estimate",
      arguments: { country: "US", weightKg: 1 },
    });
    expect((res as any).isError).toBe(true);
  });
});
