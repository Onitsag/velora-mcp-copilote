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
  const text = (res as any)?.content?.[0]?.text;
  return JSON.parse(text);
}

describe("Serveur MCP Velora : outils", () => {
  it("expose les 6 outils attendus", async () => {
    const { tools } = await conn.client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual(
      [
        "check_stock",
        "create_return_request",
        "get_order_status",
        "get_product",
        "get_return_policy",
        "search_products",
      ].sort(),
    );
  });

  it("search_products filtre par catégorie", async () => {
    const res = await conn.client.callTool({
      name: "search_products",
      arguments: { category: "Robes" },
    });
    const data = dataOf(res);
    expect(data.count).toBeGreaterThanOrEqual(2);
    expect(data.products.every((p: any) => p.category === "Robes")).toBe(true);
  });

  it("get_product renvoie les variantes et le stock", async () => {
    const res = await conn.client.callTool({
      name: "get_product",
      arguments: { sku: "VEL-ROBE-001" },
    });
    const data = dataOf(res);
    expect(data.sku).toBe("VEL-ROBE-001");
    expect(Array.isArray(data.variants)).toBe(true);
  });

  it("check_stock signale une taille en rupture", async () => {
    const res = await conn.client.callTool({
      name: "check_stock",
      arguments: { sku: "VEL-ROBE-001", size: "S" },
    });
    const data = dataOf(res);
    expect(data.available).toBe(false);
  });

  it("get_order_status renvoie le statut d'une commande connue", async () => {
    const res = await conn.client.callTool({
      name: "get_order_status",
      arguments: { reference: "VEL-1003" },
    });
    const data = dataOf(res);
    expect(data.status).toBe("preparing");
  });

  it("get_order_status échoue proprement pour une commande inconnue", async () => {
    const res = await conn.client.callTool({
      name: "get_order_status",
      arguments: { reference: "VEL-9999" },
    });
    expect((res as any).isError).toBe(true);
  });

  it("create_return_request refuse une commande non livrée", async () => {
    const res = await conn.client.callTool({
      name: "create_return_request",
      arguments: { reference: "VEL-1003", sku: "VEL-PULL-001", reason: "test" },
    });
    expect((res as any).isError).toBe(true);
  });

  it("create_return_request accepte une commande livrée", async () => {
    const res = await conn.client.callTool({
      name: "create_return_request",
      arguments: { reference: "VEL-1001", sku: "VEL-ROBE-001", reason: "Taille trop grande" },
    });
    const data = dataOf(res);
    expect(typeof data.rmaId).toBe("number");
    expect(data.status).toBe("requested");
  });
});
