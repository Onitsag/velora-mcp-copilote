# Atelier : Découvrir MCP en construisant un outil

**Public** : développeurs (pairs). **Durée** : ~1 h 30. **Format** : machine + IDE.

## Prérequis participants
- Node 20+, le dépôt cloné, `npm install` puis `npm run db:setup` exécutés.
- (Optionnel pour la démo agent) Ollama installé avec `llama3.1`, ou une clé OpenAI.

## Objectifs
À la fin, chacun sait expliquer MCP, lire/tester un serveur MCP, **écrire un
nouvel outil** et le tester, en autonomie.

## Déroulé minuté

### 0 à 20 min : Théorie (pourquoi MCP ?)
- Le problème Velora : l'information éclatée, le copilote comme réponse.
- MCP = standard ouvert ; les 3 primitives (tools, resources, prompts).
- « Un serveur, plusieurs clients » (Inspector, agent custom, Claude Desktop).
- Sécurité : injection de prompt, *tool poisoning*, principe de moindre privilège.

### 20 à 35 min : Démonstration
- `npm run inspect` → explorer les outils, appeler `search_products`,
  `get_order_status` depuis l'Inspector.
- `npm run showcase` → montrer les résultats réels (sans LLM).
- (Si LLM dispo) `npm run agent -- "Où en est la commande VEL-1003 ?"`.

### 35 min à 1 h 20 : Coding Kata (pratique)
- Énoncé : ajouter l'outil `get_shipping_estimate` (voir `kata.md`).
- Étapes guidées ; vérification à l'Inspector puis via le test fourni.
- L'animateur circule, débloque, fait verbaliser les choix de schéma.

### 1 h 20 à 1 h 30 : Débrief & projection
- Comparaison des solutions ; pièges rencontrés (schémas, casse, erreurs).
- Limites et industrialisation : transport HTTP distant, RAG, durcissement sécu.
- Projection : agents multi-serveurs, registre interne d'outils.

## Critères de réussite de l'atelier
- Chaque participant a un `get_shipping_estimate` **fonctionnel** visible dans
  l'Inspector et **vert** au test.
- Chacun sait articuler en une phrase l'intérêt de MCP pour Velora.
