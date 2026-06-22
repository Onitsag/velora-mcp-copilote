import { describe, expect, it } from "vitest";
import { mcpResultToText } from "../src/agent/bridge.js";

describe("Pont MCP → OpenAI", () => {
  it("extrait le texte d'un résultat MCP", () => {
    const out = mcpResultToText({ content: [{ type: "text", text: "bonjour" }] });
    expect(out).toBe("bonjour");
  });

  it("concatène plusieurs blocs texte", () => {
    const out = mcpResultToText({
      content: [
        { type: "text", text: "ligne1" },
        { type: "text", text: "ligne2" },
      ],
    });
    expect(out).toBe("ligne1\nligne2");
  });

  it("se rabat sur du JSON si pas de bloc texte", () => {
    const out = mcpResultToText({ foo: 1 });
    expect(out).toContain("foo");
  });
});
