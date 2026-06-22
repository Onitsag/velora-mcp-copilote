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
