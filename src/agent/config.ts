import "dotenv/config";
import process from "node:process";

export type AgentConfig = {
  baseUrl: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxSteps: number;
};

/**
 * Charge la configuration du fournisseur LLM depuis .env.
 * Compatible OpenAI : fonctionne avec OpenAI, Ollama, LM Studio, etc.
 */
export function loadConfig(): AgentConfig {
  const baseUrl = process.env.LLM_BASE_URL;
  const model = process.env.LLM_MODEL;
  // Beaucoup de serveurs locaux (Ollama) ignorent la clé : on tolère une valeur factice.
  const apiKey = process.env.LLM_API_KEY ?? "not-needed";

  if (!baseUrl) {
    throw new Error(
      "LLM_BASE_URL manquant. Copiez .env.example en .env et choisissez un profil (voir README).",
    );
  }
  if (!model) {
    throw new Error("LLM_MODEL manquant dans .env (voir .env.example).");
  }

  return {
    baseUrl,
    apiKey,
    model,
    temperature: Number(process.env.LLM_TEMPERATURE ?? "0.2"),
    maxSteps: Number(process.env.AGENT_MAX_STEPS ?? "6"),
  };
}
