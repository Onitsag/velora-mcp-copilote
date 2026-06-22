import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerSearchProducts } from "./searchProducts.js";
import { registerGetProduct } from "./getProduct.js";
import { registerCheckStock } from "./checkStock.js";
import { registerGetOrderStatus } from "./getOrderStatus.js";
import { registerGetReturnPolicy } from "./getReturnPolicy.js";
import { registerCreateReturnRequest } from "./createReturnRequest.js";

/** Enregistre tous les outils MCP de Velora sur le serveur. */
export function registerAllTools(server: McpServer) {
  registerSearchProducts(server);
  registerGetProduct(server);
  registerCheckStock(server);
  registerGetOrderStatus(server);
  registerGetReturnPolicy(server);
  registerCreateReturnRequest(server);
}
