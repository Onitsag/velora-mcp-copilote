import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // On ne lance que les tests du dossier tests/ (le squelette du kata est exclu).
    include: ["tests/**/*.test.ts"],
    testTimeout: 20000,
    hookTimeout: 20000,
  },
});
