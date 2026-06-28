# 4. Ingénierie pédagogique

L'objectif du Learning Lab est aussi de **transmettre** la compétence à mon
équipe. En tant que *lead developer*, mon rôle n'est pas de faire une simple
démo, mais de rendre mes collègues **autonomes** sur MCP. Cette section décrit
donc le dispositif de transfert : un **atelier pratique** pour des pairs
développeurs (matériel complet dans [`../atelier/`](../atelier/)), puis un **plan
de déploiement progressif** vers l'équipe (4.4).

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

## 4.4 Plan de transfert à l'équipe (au-delà de l'atelier)

L'atelier amorce la compétence ; son ancrage durable passe par un déploiement
progressif, que je piloterais ainsi :

1. **Pilote** (semaines 1 et 2) : 2 à 3 conseillers volontaires utilisent le
   copilote en conditions réelles, avec un développeur référent MCP pour le
   support et la collecte des retours.
2. **Documentation interne** : ce rapport et le `README` servent de socle ; on y
   ajoute les cas d'usage Velora réellement rencontrés (FAQ, exemples).
3. **Industrialisation** (cf. budget, bloc 3) : connecteurs vers le vrai
   back-office, transport HTTP, authentification, observabilité, revue sécurité.
4. **Généralisation** : ouverture à l'ensemble des conseillers, avec mesure des
   gains (temps de réponse, durée d'onboarding des nouvelles recrues).
5. **Capitalisation** : chaque équipe peut publier ses propres serveurs MCP,
   réutilisables par les autres (logique « un serveur, plusieurs clients »).
