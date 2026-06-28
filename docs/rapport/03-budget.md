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

**Leviers d'optimisation** : *prompt caching* (-90 % sur l'entrée mise en cache :
le *system prompt* et les définitions d'outils sont réutilisés à chaque requête)
et *Batch API* (-50 %) pour les traitements asynchrones. Avec caching, le coût
gpt-4o-mini devient **négligeable** (quelques euros/mois).

### b) Hébergement & licences
- **Serveur MCP** : petit conteneur (1 vCPU / 1 Go) ≈ **5 à 15 €/mois**, ou
  mutualisé avec l'infra existante ≈ négligeable.
- **Base de données** : Velora dispose déjà de sa base produit/commandes.
- **Licence MCP** : **0 €** (standard open source).
- **Option auto-hébergée** : machine avec GPU 16 Go (~1 500 à 2 500 € *one-shot*)
  pour servir un modèle 8B, ou serveur d'inférence mutualisé.

## 3.3 Coûts indirects

| Poste | Estimation |
|-------|------------|
| Industrialisation POC → prod (auth, connecteurs réels, transport HTTP, observabilité, revue sécu, intégration UI) | **~15 à 25 j/h** |
| Formation des conseillers (outil conversationnel simple) | ~0,5 j × 15 ≈ **7,5 j/h** |
| Montée en compétence MCP des développeurs | **~2 à 3 j/h** |
| Maintenance courante | **~1 à 2 j/mois** |

## 3.4 Analyse d'impact

- **Courbe d'apprentissage** : **faible** côté conseillers (c'est un chat) ;
  **modérée** côté développeurs (MCP récent, mais SDK + Inspector matures).
- **Productivité** : gain attendu sur le **temps de recherche d'information**
  (objectif -30 à -50 % sur ces tâches), **onboarding raccourci** des nouveaux
  conseillers (le copilote sert de mémoire opérationnelle).
- **Risque transitoire** : fiabilité (hallucinations) au démarrage → atténué par
  les garde-fous (anti-invention, lecture seule par défaut, supervision initiale).

## 3.5 Synthèse ROI

À ces volumes, le **coût d'inférence cloud est marginal** (≈ 7,5 €/mois en
gpt-4o-mini, voire ~0 € en local) face au **temps conseiller économisé** (le coût
dominant est salarial). L'investissement réel est l'**industrialisation** (~15 à 25
j/h) et la **conduite du changement**. Le découplage MCP permet en outre de
**commencer en local (0 €, données sur site)** puis de basculer vers une API
managée si besoin, **sans réécrire** le serveur. Décision : **adoption
recommandée**, démarrage en local pour la confidentialité et le coût.
