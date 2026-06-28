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
« **port USB-C des applications d'IA** » : au lieu d'écrire une intégration
sur-mesure par modèle, on expose ses capacités **une seule fois** via un
**serveur MCP**, que n'importe quel client compatible peut consommer.

- **Origine & gouvernance** : introduit par Anthropic (fin 2024), il est
  désormais **gouverné de façon neutre** par l'*Agentic AI Foundation* (sous
  l'égide de la Linux Foundation, depuis décembre 2025).
- **Primitives** (3) : **Tools** (actions appelables), **Resources** (données en
  lecture), **Prompts** (gabarits réutilisables).
- **Transport** : `stdio` (serveur local) ou *Streamable HTTP* (serveur distant).
  Protocole **JSON-RPC**, révision **2025-11-25**.

## 1.3 Argumentaire décisionnel : gains attendus

| Axe | Gain apporté par MCP |
|-----|----------------------|
| **Maintenabilité** | Outils centralisés dans un serveur, schémas typés (Zod / JSON Schema). Une seule source de vérité, testable isolément. |
| **Réutilisabilité** | *Un* serveur, *plusieurs* clients : Claude Desktop, agent custom, IDE, futur agent vocal… sans réécriture. |
| **Découplage / pas de lock-in** | Le serveur est indépendant du modèle. On change de LLM (cloud ↔ local) sans toucher à l'intégration, comme démontré dans notre POC (bascule via `.env`). |
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
> **multi-éditeurs** en adoption rapide, ce qui réduit le risque de pari
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
