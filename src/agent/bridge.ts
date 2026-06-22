import type OpenAI from "openai";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";

/**
 * Pont MCP → OpenAI : transforme les outils MCP (tools/list) en "functions"
 * au format Chat Completions. L'inputSchema MCP (JSON Schema) est repris tel
 * quel comme `parameters`.
 */
export async function mcpToolsToOpenAI(
  client: Client,
): Promise<OpenAI.Chat.Completions.ChatCompletionTool[]> {
  const { tools } = await client.listTools();
  return tools.map((t) => ({
    type: "function",
    function: {
      name: t.name,
      description: t.description ?? "",
      parameters: (t.inputSchema as Record<string, unknown>) ?? {
        type: "object",
        properties: {},
      },
    },
  }));
}

/** Normalise un résultat d'appel d'outil MCP en texte pour le message `role:"tool"`. */
export function mcpResultToText(result: unknown): string {
  const content = (result as { content?: unknown })?.content;
  if (!Array.isArray(content)) return JSON.stringify(result ?? {});
  const text = content
    .filter((c: { type?: string }) => c?.type === "text")
    .map((c: { text?: string }) => c.text ?? "")
    .join("\n");
  return text || JSON.stringify(content);
}
