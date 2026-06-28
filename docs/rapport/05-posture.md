# 5. Posture de Lead Developer (démarche & synthèse)

## 5.1 Démarche de veille

La veille a combiné sources **primaires** (spécification MCP, documentation des
SDK officiels, pages de tarification éditeurs) et **secondaires** (registre
officiel, retours d'adoption, littérature sécurité). Les chiffres et faits
techniques du rapport ont été **vérifiés à la source** (juin 2026) plutôt que
repris de mémoire, la technologie évoluant vite.

## 5.2 Esprit critique

MCP a été évalué **sans complaisance** : au-delà de la « hype », le rapport
identifie des **faiblesses** (spec jeune, *tool calling* inégal selon les modèles)
et des **menaces** réelles (injection de prompt, *tool poisoning*,
sur-privilèges). Le choix d'architecture **découplée** (serveur indépendant du
LLM) est lui-même une réponse critique au risque de *lock-in*.

## 5.3 Décisions d'ingénierie notables

- **Agent compatible OpenAI** plutôt que lié à un seul fournisseur → le projet
  est **testable gratuitement** (modèle local) et **portable** (cloud ou local
  via `.env`). Décision motivée par la contrainte « le correcteur doit pouvoir
  tester sans clé payante ».
- **Prisma 7 + adapter** : prise en compte des évolutions récentes (driver
  adapters, `prisma.config.ts`) constatées **pendant** le build, et adaptation en
  conséquence.
- **Testabilité** : l'agent accepte un LLM **injecté**, ce qui permet de valider
  la boucle *tool-use* **sans clé** (test déterministe).

## 5.4 Vulgarisation

Le rapport s'adresse à une **direction technique** : analogies (« USB-C de l'IA »),
tableaux de synthèse, SWOT, exemple budgétaire chiffré, et un POC **exécutable**
documenté pas à pas. L'objectif est qu'un décideur comme un développeur puissent
se forger une opinion **et** reproduire la démonstration.

## 5.5 Bilan

Le Learning Lab a permis de passer de la **veille** (comprendre MCP et son
écosystème) à la **preuve** (un POC fonctionnel, testé, documenté) puis au
**transfert** (un atelier et un kata prêts à l'emploi). La recommandation
d'adoption est **étayée** par des faits, un code opérationnel et une analyse
économique, tout en restant lucide sur les conditions de mise en production.
