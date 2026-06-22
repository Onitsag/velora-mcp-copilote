// Test de fumée : connecte le client MCP au serveur et appelle quelques outils.
// Usage : npm run build && tsx scripts/smoke.ts
import { connectMcp } from "../src/agent/mcpClient.js";

const { client, close } = await connectMcp();

const { tools } = await client.listTools();
console.log("Outils exposés :", tools.map((t) => t.name).join(", "));

const search = await client.callTool({
  name: "search_products",
  arguments: { category: "Robes", inStockOnly: true },
});
console.log("\n[search_products Robes en stock]");
console.log((search as any).content?.[0]?.text);

const order = await client.callTool({
  name: "get_order_status",
  arguments: { reference: "VEL-1003" },
});
console.log("\n[get_order_status VEL-1003]");
console.log((order as any).content?.[0]?.text);

const { resources } = await client.listResources();
console.log("\nRessources :", resources.map((r) => r.uri).join(", "));

await close();
process.exit(0);
