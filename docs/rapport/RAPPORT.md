---
title: "Learning Lab M2DFS — MCP (Model Context Protocol)"
subtitle: "Étude d'adoption pour le copilote conseiller de Velora (e-commerce)"
date: "2026"
---

# Learning Lab M2DFS — MCP (Model Context Protocol)
## Étude d'adoption — copilote conseiller de Velora (e-commerce fictif)

**Rendu écrit** : rapport + POC (dépôt GitHub).
**POC** : serveur MCP (TypeScript) + agent compatible OpenAI (cloud ou local).

---

# 1. Note de cadrage stratégique

## 1.1 Contexte et entreprise

**Velora** est un pure-player e-commerce de mode et lifestyle (entreprise fictive
support de cette étude) : ~110 salariés, ~35 M€ de CA, un catalogue d'environ
**12 000 références** et une équipe de **~15 conseillers** au service client
(chat + e-mail).

**Problème observé.** Pour répondre à un client, un conseiller doit aujourd'hui
jongler entre plusieurs outils : back-office (stock, commandes), fiches produit,
documents de politique (retours, livraison). Conséquences : temps de réponse
élevé, réponses parfois incohérentes d'un conseiller à l'autre, et
**onboarding long** des nouvelles recrues.

**Besoin métier.** Un **copilote conseiller** : un assistant IA capable de
répondre en langage naturel en s'appuyant **uniquement** sur les données internes
(catalogue, stock, commandes, politiques), de façon **fiable et sourcée**, pour
réduire le temps de réponse et homogénéiser la qualité.

## 1.2 La technologie étudiée : MCP (Model Context Protocol)

MCP est un **standard ouvert** qui normalise la façon dont un modèle de langage
se connecte à des **outils** et des **données** externes. Image courante : le
« **port USB-C des applications d'IA** » — au lieu d'écrire une intégration
sur-mesure par modèle, on expose ses capacités **une seule fois** via un
**serveur MCP**, que n'importe quel client compatible peut consommer.

- **Origine & gouvernance** : introduit par Anthropic (fin 2024), il est
  désormais **gouverné de façon neutre** par l'*Agentic AI Foundation* (sous
  l'égide de la Linux Foundation, depuis décembre 2025).
- **Primitives** (3) : **Tools** (actions appelables), **Resources** (données en
  lecture), **Prompts** (gabarits réutilisables).
- **Transport** : `stdio` (serveur local) ou *Streamable HTTP* (serveur distant).
  Protocole **JSON-RPC**, révision **2025-11-25**.

## 1.3 Argumentaire décisionnel — gains attendus

| Axe | Gain apporté par MCP |
|-----|----------------------|
| **Maintenabilité** | Outils centralisés dans un serveur, schémas typés (Zod / JSON Schema). Une seule source de vérité, testable isolément. |
| **Réutilisabilité** | *Un* serveur, *plusieurs* clients : Claude Desktop, agent custom, IDE, futur agent vocal… sans réécriture. |
| **Découplage / pas de lock-in** | Le serveur est indépendant du modèle. On change de LLM (cloud ↔ local) sans toucher à l'intégration — démontré dans notre POC (bascule via `.env`). |
| **Sécurité / gouvernance** | Annotations d'outils (`readOnly`, `destructive`), périmètre d'accès maîtrisé, journalisation centralisable, *allow-list* via registre. |
| **Scalabilité (organisationnelle)** | Chaque équipe publie ses serveurs ; l'écosystème se compose au lieu de se dupliquer. |
| **Time-to-market** | SDK officiels (TS/Python), *MCP Inspector*, nombreux serveurs prêts à l'emploi. |

## 1.4 Analyse comparative de l'écosystème

**Maturité & communauté (chiffres, 2026).**
- Gouvernance neutre (Linux Foundation / Agentic AI Foundation).
- **Registre officiel** de serveurs MCP : ~**9 600** serveurs, ~29 000 versions.
- ~**15 900** dépôts GitHub avec le topic `mcp-server` ; dépôt de référence
  `modelcontextprotocol/servers` ~**86 k** étoiles.
- ~**97 M** de téléchargements/mois des SDK (Python + TypeScript).
- **Adoption transverse** : Anthropic, **OpenAI**, Google, Microsoft, AWS,
  Cloudflare, GitHub… ~**41 %** des organisations interrogées déclarent un usage
  en production (rapport Stacklok 2026).

> Lecture critique : MCP n'est plus une curiosité de 2024 mais un standard
> **multi-éditeurs** en adoption rapide — ce qui réduit le risque de pari
> technologique. Sa jeunesse (spec qui évolue vite) reste à surveiller.

**Comparaison des approches d'outillage d'un LLM.**

| Approche | Avantages | Inconvénients |
|----------|-----------|---------------|
| **Function calling « maison »** (format propre à chaque API) | Démarrage immédiat, zéro dépendance | Couplé au fournisseur, **non réutilisable**, à re-maintenir à chaque LLM |
| **Framework d'orchestration** (LangChain, LlamaIndex) | Riche, nombreux connecteurs | Abstractions lourdes, **lock-in framework**, montée en version coûteuse |
| **MCP** (notre choix) | **Standard ouvert**, réutilisable, **découplé du modèle**, outillage (Inspector, registre) | Jeune (spec mouvante), **sécurité à durcir** (cf. menaces) |

## 1.5 Matrice SWOT

| **Forces** | **Faiblesses** |
|------------|----------------|
| Standard ouvert, gouvernance neutre | Spécification jeune, encore en évolution rapide |
| Découplage modèle/données (pas de lock-in) | Outillage de debug/observabilité encore vert |
| Réutilisable par plusieurs clients | Courbe d'apprentissage côté développeurs |
| SDK officiels + Inspector + large écosystème | Qualité du *tool calling* variable selon les modèles (surtout locaux) |

| **Opportunités** | **Menaces** |
|------------------|-------------|
| Écosystème de serveurs réutilisables (registre) | **Sécurité** : injection de prompt, *tool poisoning* |
| Vers des agents multi-outils plus autonomes | *Confused deputy* / gestion des jetons OAuth |
| Standard adopté par les principaux éditeurs | Agents sur-privilégiés → surface d'attaque élargie |
| Mutualisation entre équipes internes | Dépendance à la trajectoire de la spec (versions) |

**Mitigations retenues pour le POC** : outils en lecture seule par défaut
(annotation `readOnlyHint`), unique action d'écriture restreinte (retour possible
uniquement sur commande livrée) avec mention *human-in-the-loop*, *system prompt*
anti-invention, schémas d'entrée plats et validés (Zod), journaux sur `stderr`.

## 1.6 Décision

Le POC (bloc 2) démontre la **viabilité technique** et la **valeur** de MCP pour
le copilote conseiller de Velora. **Recommandation : adoption**, sous conditions
de durcissement sécurité (revue des actions d'écriture, *allow-list* de serveurs,
journalisation) et de choix de modèle (cf. budget, bloc 3).


---

# 2. Démarche R&D et preuve de concept

## 2.1 Objectif du POC

Démontrer, sur le cas Velora, qu'un **serveur MCP** peut exposer les données
métier (catalogue, stock, commandes, politiques) et qu'un **agent IA** les
exploite pour répondre à un conseiller — le tout **testable sans clé payante**.

## 2.2 Architecture

```mermaid
flowchart TD
  U["Conseiller<br/>(question en langage naturel)"] --> CLI["Agent CLI<br/>(TypeScript)"]
  CLI -->|"API compatible OpenAI<br/>(tool calling)"| LLM["LLM compatible OpenAI<br/>OpenAI · Ollama · LM Studio"]
  LLM -. "décide quels outils appeler" .-> CLI
  CLI <-->|"MCP — JSON-RPC sur stdio"| SRV["Serveur MCP Velora"]
  SRV -->|"Prisma 7 + adapter"| DB[("SQLite<br/>catalogue · stock · commandes")]
  SRV --- TOOLS["Outils (6)"]
  SRV --- RES["Ressources (2)"]
```

Deux briques **découplées** :
1. **Serveur MCP** (`src/server.ts`) — indépendant de tout LLM. Expose outils,
   ressources et un prompt ; lit les données via Prisma/SQLite.
2. **Agent** (`src/agent/`) — un **hôte MCP** qui : se connecte au serveur,
   convertit les outils MCP en *functions* OpenAI (`bridge.ts`), puis exécute une
   **boucle *tool-use*** contre un endpoint **compatible OpenAI**.

## 2.3 Choix techniques

| Élément | Choix | Justification |
|--------|-------|---------------|
| Langage | TypeScript (Node 20+) | Cohérent avec la stack full-stack JS de Velora |
| Serveur MCP | `@modelcontextprotocol/sdk` (`McpServer`) | SDK officiel, API haut niveau, transport stdio |
| Validation | Zod | Schémas d'entrée typés + descriptions exposées au LLM |
| Données | **Prisma 7 + SQLite** (adapter better-sqlite3) | Réaliste, zéro serveur à installer, *seed* reproductible |
| Agent | SDK `openai` avec `baseURL` configurable | **Compatible OpenAI, Ollama, LM Studio…** via `.env` |
| Tests | Vitest | Intégration outils (sans LLM) + boucle agent (LLM simulé) |

## 2.4 Portabilité & test **sans clé payante** (note importante)

> L'agent utilise l'**API compatible OpenAI**. Il fonctionne donc avec :
> **OpenAI** (clé payante), **un modèle local** (Ollama / LM Studio → **gratuit,
> sans clé**), ou tout fournisseur compatible (Groq, Together, OpenRouter…).
> On change de fournisseur en modifiant **uniquement** `LLM_BASE_URL`,
> `LLM_API_KEY`, `LLM_MODEL` dans `.env`.
>
> Le **serveur MCP est indépendant du LLM** : il se teste **seul**, sans aucune
> clé, via `npm test` ou le *MCP Inspector*. Il est aussi consommable par
> **Claude Desktop** (configuration fournie) — illustration concrète du
> « un serveur, plusieurs clients ».

Cette note figure aussi dans le `README.md` et le fichier `.env.example`.

## 2.5 Outils et ressources exposés

**Outils** (6) — voir résultats réels dans [`../demo/outils-demo.md`](../demo/outils-demo.md) :
`search_products`, `get_product`, `check_stock`, `get_order_status`,
`get_return_policy`, `create_return_request`.

**Ressources** (2) : `policy://returns`, `policy://shipping` (Markdown).
**Prompt** (1) : `conseiller_reply` (gabarit de réponse conseiller).

## 2.6 Dépôt et installation

Dépôt : `https://github.com/<votre-compte>/velora-mcp-copilote` *(à compléter)*.
Guide complet d'installation **sans friction** dans le `README.md`. En résumé :

```bash
npm install
cp .env.example .env        # profil local Ollama par défaut
npm run db:setup            # crée la base SQLite + données fictives
npm run build
npm test                    # 12 tests, sans clé API
```

## 2.7 Cas d'usage testés **en conditions réelles**

Le fichier [`../demo/outils-demo.md`](../demo/outils-demo.md) (généré par
`npm run showcase`) contient des **appels réels** et leurs **résultats bruts**,
dont des cas limites probants :
- recherche filtrée (robes en stock), fiche produit avec **stock par taille** ;
- statut d'une commande connue (`VEL-1003` → *En préparation*, articles + total) ;
- **garde-fou** : `create_return_request` **refuse** une commande non livrée
  (`VEL-1003`) et **accepte** une commande livrée (`VEL-1001`).

Côté agent, `npm run demo` (avec un LLM configuré) produit des transcripts dans
`docs/demo/transcripts/`. La **boucle tool-use** est par ailleurs validée
**sans clé** par `tests/agent.test.ts` (LLM déterministe simulé) : l'agent appelle
réellement `get_order_status` puis fonde sa réponse sur le résultat.

## 2.8 Tests & qualité

`npm test` exécute **12 tests** (3 fichiers) :
- `tests/tools.test.ts` — intégration des 6 outils via un **vrai client MCP**
  (sous-processus serveur), incluant les cas d'erreur et le garde-fou de retour ;
- `tests/bridge.test.ts` — normalisation des résultats MCP → texte ;
- `tests/agent.test.ts` — boucle *tool-use* de l'agent avec LLM simulé.

`pretest` régénère la base et compile, garantissant des tests **déterministes**.

## 2.9 Sécurité (mesures du POC)

- Outils **en lecture seule** par défaut (`readOnlyHint`) ; seule écriture :
  `create_return_request`, **restreinte aux commandes livrées**, avec mention
  explicite *human-in-the-loop*.
- *System prompt* **anti-invention** (le modèle doit s'appuyer sur les outils).
- **Schémas d'entrée plats et validés** (Zod) → compat large + moindre surface.
- Logs serveur sur **stderr** uniquement (stdout réservé au protocole).

## 2.10 Limites assumées du POC

Données **fictives** ; recherche **lexicale simple** (pas de recherche
vectorielle) ; pas d'authentification ni de multi-tenant ; transport **stdio**
local (pas d'exposition HTTP distante). Ces points sont des pistes d'industrialisation,
hors périmètre d'un POC.


---

# 3. Étude budgétaire et d'adoption

> Tarifs éditeurs exprimés en USD ; parité ~1:1 € retenue pour simplifier la
> lecture. Volumes = hypothèses de travail pour Velora (~15 conseillers).

## 3.1 Hypothèse de volume

| Paramètre | Hypothèse |
|-----------|-----------|
| Conseillers | 15 |
| Requêtes copilote / conseiller / jour | ~30 |
| Jours ouvrés / mois | ~21 |
| **Total requêtes / mois** | **~10 000** |
| Tokens / requête (avec aller-retours d'outils) | ~3 000 entrée + ~500 sortie |
| **Volume mensuel** | **~30 M tokens entrée + ~5 M sortie** |

## 3.2 Coûts directs

### a) Inférence LLM (cœur du coût variable)

| Option | Prix (entrée / sortie, /M) | Coût mensuel estimé* |
|--------|----------------------------|----------------------|
| **OpenAI gpt-4o-mini** | 0,15 / 0,60 | **~7,5 €** |
| Claude Haiku 4.5 | 1,00 / 5,00 | ~55 € |
| OpenAI gpt-4o | 2,50 / 10,00 | ~125 € |
| **Modèle local** (Ollama/LM Studio) | **0 / token** | **0 €** (coût = matériel/ops) |

\* 30 M × prix entrée + 5 M × prix sortie.

**Leviers d'optimisation** : *prompt caching* (−90 % sur l'entrée mise en cache —
le *system prompt* et les définitions d'outils sont réutilisés à chaque requête)
et *Batch API* (−50 %) pour les traitements asynchrones. Avec caching, le coût
gpt-4o-mini devient **négligeable** (quelques euros/mois).

### b) Hébergement & licences
- **Serveur MCP** : petit conteneur (1 vCPU / 1 Go) ≈ **5–15 €/mois**, ou
  mutualisé avec l'infra existante ≈ négligeable.
- **Base de données** : Velora dispose déjà de sa base produit/commandes.
- **Licence MCP** : **0 €** (standard open source).
- **Option auto-hébergée** : machine avec GPU 16 Go (~1 500–2 500 € *one-shot*)
  pour servir un modèle 8B, ou serveur d'inférence mutualisé.

## 3.3 Coûts indirects

| Poste | Estimation |
|-------|------------|
| Industrialisation POC → prod (auth, connecteurs réels, transport HTTP, observabilité, revue sécu, intégration UI) | **~15–25 j/h** |
| Formation des conseillers (outil conversationnel simple) | ~0,5 j × 15 ≈ **7,5 j/h** |
| Montée en compétence MCP des développeurs | **~2–3 j/h** |
| Maintenance courante | **~1–2 j/mois** |

## 3.4 Analyse d'impact

- **Courbe d'apprentissage** : **faible** côté conseillers (c'est un chat) ;
  **modérée** côté développeurs (MCP récent, mais SDK + Inspector matures).
- **Productivité** : gain attendu sur le **temps de recherche d'information**
  (objectif −30 à −50 % sur ces tâches), **onboarding raccourci** des nouveaux
  conseillers (le copilote sert de mémoire opérationnelle).
- **Risque transitoire** : fiabilité (hallucinations) au démarrage → atténué par
  les garde-fous (anti-invention, lecture seule par défaut, supervision initiale).

## 3.5 Synthèse ROI

À ces volumes, le **coût d'inférence cloud est marginal** (≈ 7,5 €/mois en
gpt-4o-mini, voire ~0 € en local) face au **temps conseiller économisé** (le coût
dominant est salarial). L'investissement réel est l'**industrialisation** (~15–25
j/h) et la **conduite du changement**. Le découplage MCP permet en outre de
**commencer en local (0 €, données sur site)** puis de basculer vers une API
managée si besoin — **sans réécrire** le serveur. Décision : **adoption
recommandée**, démarrage en local pour la confidentialité et le coût.


---

# 4. Ingénierie pédagogique

L'objectif du Learning Lab est aussi de **transmettre** la compétence. Cette
section décrit l'atelier conçu pour des pairs développeurs. Le matériel complet
est dans [`../atelier/`](../atelier/).

## 4.1 Objectifs pédagogiques

À l'issue de l'atelier (≈ 1 h 30), un participant sait :
1. **Expliquer** ce qu'est MCP et ses 3 primitives (tools, resources, prompts) ;
2. **Lire** un serveur MCP existant et le tester avec le *MCP Inspector* ;
3. **Écrire un nouvel outil** (schéma Zod + handler) et le faire apparaître ;
4. **Comprendre le pont** MCP → agent compatible OpenAI (réutilisation des outils) ;
5. **Tester** son outil (Vitest) sans dépendre d'un LLM.

## 4.2 Scénario / déroulé chronologique

| Durée | Phase | Contenu |
|------:|-------|---------|
| 20 min | **Théorie** | Pourquoi MCP ? Le problème Velora ; primitives ; « un serveur, plusieurs clients » ; sécurité (injection, *tool poisoning*). |
| 15 min | **Démonstration** | Lancer le serveur + Inspector ; appeler `search_products`, `get_order_status` ; lancer l'agent (modèle local) sur une question réelle. |
| 45 min | **Coding Kata** | Chaque participant ajoute l'outil `get_shipping_estimate` (cf. `atelier/kata.md`), le teste à l'Inspector puis via le test fourni. |
| 10 min | **Débrief & futur** | Revue des solutions ; limites & pistes (HTTP distant, RAG, sécurité) ; projection : agents multi-serveurs. |

Détail complet et minutage : [`../atelier/scenario.md`](../atelier/scenario.md).

## 4.3 Support d'exercice pratique (Coding Kata)

**Énoncé** : « Ajouter au serveur l'outil `get_shipping_estimate({ country,
weightKg })` qui renvoie le délai et le tarif estimés selon la politique de
livraison. » Le kata fournit un **squelette à compléter** et un **test rouge**
qui doit passer au vert.

- Énoncé + étapes guidées + solution : [`../atelier/kata.md`](../atelier/kata.md)
- Squelette de départ : [`../atelier/kata-starter/`](../atelier/kata-starter/)

L'exercice est volontairement **isomorphe** aux outils existants : le participant
réutilise le patron `registerXxx(server)` déjà en place, ce qui ancre la
compétence « écrire un outil MCP » de façon autonome.


---

# 5. Posture de Lead Developer (démarche & synthèse)

## 5.1 Démarche de veille

La veille a combiné sources **primaires** (spécification MCP, documentation des
SDK officiels, pages de tarification éditeurs) et **secondaires** (registre
officiel, retours d'adoption, littérature sécurité). Les chiffres et faits
techniques du rapport ont été **vérifiés à la source** (juin 2026) plutôt que
repris de mémoire — la technologie évoluant vite.

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
économique — tout en restant lucide sur les conditions de mise en production.


---

