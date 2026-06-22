import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { connectMcp, type McpConnection } from "../src/agent/mcpClient.js";
import { runAgent, type ChatModel } from "../src/agent/agent.js";

/**
 * Stub LLM déterministe (compatible OpenAI) : valide la boucle "tool use"
 * de l'agent SANS dépendre d'un vrai modèle.
 *   1er appel  -> demande l'outil get_order_status(VEL-1003)
 *   2e appel   -> rédige la réponse finale à partir du résultat de l'outil
 */
function makeStubLLM(): ChatModel {
  let call = 0;
  return {
    chat: {
      completions: {
        create: async (params: any) => {
          call++;
          if (call === 1) {
            return {
              choices: [
                {
                  message: {
                    role: "assistant",
                    content: null,
                    tool_calls: [
                      {
                        id: "call_1",
                        type: "function",
                        function: {
                          name: "get_order_status",
                          arguments: JSON.stringify({ reference: "VEL-1003" }),
                        },
                      },
                    ],
                  },
                },
              ],
            } as any;
          }
          // 2e appel : on lit le résultat de l'outil injecté dans les messages.
          const toolMsg = [...params.messages].reverse().find((m: any) => m.role === "tool");
          const data = JSON.parse(toolMsg.content);
          return {
            choices: [
              {
                message: {
                  role: "assistant",
                  content: `La commande ${data.reference} est au statut « ${data.statusLabel} ».`,
                  tool_calls: [],
                },
              },
            ],
          } as any;
        },
      },
    },
  };
}

describe("Agent — boucle tool-use (stub LLM)", () => {
  let conn: McpConnection;
  beforeAll(async () => {
    conn = await connectMcp();
  });
  afterAll(async () => {
    await conn?.close();
  });

  it("appelle réellement l'outil MCP et fonde sa réponse sur le résultat", async () => {
    const res = await runAgent({
      client: conn.client,
      question: "Où en est la commande VEL-1003 ?",
      llm: makeStubLLM(),
      model: "stub",
    });

    expect(res.steps.some((s) => s.type === "tool_call" && s.name === "get_order_status")).toBe(true);
    expect(res.answer).toContain("préparation");
  });
});
