# Preuves de démonstration

Ce dossier rassemble les preuves d'exécution **en conditions réelles** du POC.

## 1. `outils-demo.md` : appels réels des outils MCP (sans LLM)
Généré par `npm run showcase`. Contient des appels réels du client MCP vers le
serveur Velora et les **résultats bruts** : recherche catalogue, fiche produit,
stock par taille, statut de commande, et le garde-fou du retour (refus si la
commande n'est pas livrée, acceptation sinon). **Aucune clé API requise.**

## 2. Transcripts de l'agent (avec un LLM)
Générés par `npm run demo` une fois un fournisseur LLM configuré dans `.env`
(OpenAI **ou** un modèle local Ollama/LM Studio, voir le README racine).
Sortie : `docs/demo/transcripts/agent-demo.md`.

> La boucle *tool-use* de l'agent est par ailleurs validée **automatiquement et
> sans clé** par `tests/agent.test.ts` (LLM déterministe simulé) : l'agent appelle
> réellement l'outil `get_order_status` et fonde sa réponse sur le résultat.

## 3. Captures MCP Inspector (optionnel)
`npm run inspect` ouvre l'inspecteur sur `http://localhost:6274`. Placez ici les
captures (`img/`) montrant la liste des outils et un appel `tools/call`.
