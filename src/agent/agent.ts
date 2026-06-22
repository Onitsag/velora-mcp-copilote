import OpenAI from "openai";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { loadConfig } from "./config.js";
import { mcpResultToText, mcpToolsToOpenAI } from "./bridge.js";

export type AgentEvent =
  | { type: "tool_call"; name: string; args: unknown; result: string }
  | { type: "assistant"; content: string };

export type AgentResult = {
  answer: string;
  steps: AgentEvent[];
};

/**
 * Interface minimale compatible OpenAI Chat Completions.
 * `OpenAI` la satisfait ; un stub déterministe peut aussi l'implémenter (tests).
 */
export type ChatModel = {
  chat: {
    completions: {
      create: (
        params: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming,
      ) => Promise<OpenAI.Chat.Completions.ChatCompletion>;
    };
  };
};

export const SYSTEM_PROMPT = `Tu es l'assistant interne du service client de Velora, un site e-commerce de mode et lifestyle.
Ton rôle : aider les conseillers à répondre vite et juste aux clients.

Règles impératives :
- Réponds en français, de façon concise et professionnelle.
- Pour TOUTE information factuelle (prix, stock, taille, statut de commande, politique),
  utilise les outils fournis. N'invente JAMAIS un prix, un stock ou un statut.
- Cite les références utiles (SKU, numéro de commande).
- Si une information est introuvable via les outils, dis-le clairement.
- N'effectue une action d'écriture (création de retour) que si la demande est explicite.`;

export type RunAgentOptions = {
  client: Client;
  question: string;
  onEvent?: (e: AgentEvent) => void;
  /** Client LLM injecté (sinon construit depuis .env). */
  llm?: ChatModel;
  model?: string;
  temperature?: number;
  maxSteps?: number;
};

/**
 * Exécute l'agent : boucle "tool use" compatible OpenAI sur les outils MCP.
 * Fonctionne avec OpenAI, Ollama, LM Studio... selon la config .env,
 * ou avec un `llm` injecté (tests déterministes).
 */
export async function runAgent(opts: RunAgentOptions): Promise<AgentResult> {
  let llm = opts.llm;
  let model = opts.model;
  let temperature = opts.temperature;
  let maxSteps = opts.maxSteps;

  if (!llm) {
    const cfg = loadConfig();
    llm = new OpenAI({ baseURL: cfg.baseUrl, apiKey: cfg.apiKey }) as unknown as ChatModel;
    model ??= cfg.model;
    temperature ??= cfg.temperature;
    maxSteps ??= cfg.maxSteps;
  }
  model ??= "gpt-4o-mini";
  temperature ??= 0.2;
  maxSteps ??= 6;

  const tools = await mcpToolsToOpenAI(opts.client);
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: opts.question },
  ];
  const steps: AgentEvent[] = [];

  for (let i = 0; i < maxSteps; i++) {
    const response = await llm.chat.completions.create({
      model,
      temperature,
      messages,
      tools,
      tool_choice: "auto",
    });

    const message = response.choices[0]?.message;
    if (!message) break;
    messages.push(message as OpenAI.Chat.Completions.ChatCompletionMessageParam);

    const toolCalls = message.tool_calls ?? [];
    if (toolCalls.length === 0) {
      const content = message.content ?? "";
      const event: AgentEvent = { type: "assistant", content };
      steps.push(event);
      opts.onEvent?.(event);
      return { answer: content, steps };
    }

    for (const call of toolCalls) {
      if (call.type !== "function") continue;
      const name = call.function.name;
      let args: Record<string, unknown> = {};
      try {
        args = call.function.arguments ? JSON.parse(call.function.arguments) : {};
      } catch {
        args = {};
      }

      let resultText: string;
      try {
        const result = await opts.client.callTool({ name, arguments: args });
        resultText = mcpResultToText(result);
      } catch (err) {
        resultText = JSON.stringify({ error: err instanceof Error ? err.message : String(err) });
      }

      const event: AgentEvent = { type: "tool_call", name, args, result: resultText };
      steps.push(event);
      opts.onEvent?.(event);

      messages.push({ role: "tool", tool_call_id: call.id, content: resultText });
    }
  }

  const fallback =
    "Je n'ai pas pu finaliser la réponse dans le nombre d'étapes imparti (AGENT_MAX_STEPS).";
  steps.push({ type: "assistant", content: fallback });
  return { answer: fallback, steps };
}
