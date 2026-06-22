# Coding Kata — Ajouter l'outil `get_shipping_estimate`

## Objectif
Ajouter au serveur MCP Velora un outil qui **estime le délai et le tarif de
livraison** selon le pays et le poids, en respectant la politique de livraison
(`src/resources/policies/shipping.md`).

## Spécification
- **Nom** : `get_shipping_estimate`
- **Entrée** : `{ country: string, weightKg: number }`
- **Sortie** (JSON) : `{ zone, etaDays, priceEur }`
- **Règles** :
  - France (`FR` / « France ») → zone `FR`, délai « 2 à 3 jours », tarif **4,90 €**.
  - Union européenne (DE, BE, ES, IT, NL, PT, LU…) → zone `EU`, « 4 à 7 jours », **9,90 €**.
  - Hors UE → **erreur** « livraison indisponible ».
  - Surcharge **+2 €** si `weightKg > 2`.

## Étapes guidées
1. Copier `kata-starter/get_shipping_estimate.starter.ts` vers
   `src/tools/getShippingEstimate.ts`.
2. Implémenter le `handler` (calcul `zone` / `etaDays` / `priceEur`) en réutilisant
   `jsonResult` et `errorResult` de `src/tools/util.js`.
3. Enregistrer l'outil dans `src/tools/index.ts` :
   ```ts
   import { registerGetShippingEstimate } from "./getShippingEstimate.js";
   // ...dans registerAllTools(server) :
   registerGetShippingEstimate(server);
   ```
4. Vérifier : `npm run inspect` → l'outil apparaît et répond.
5. Copier `kata-starter/get_shipping_estimate.test.ts` vers
   `tests/shipping.test.ts` puis lancer `npm test` (doit être **vert**).

## Critères de réussite
- L'outil apparaît dans `tools/list` (Inspector).
- `get_shipping_estimate({country:"FR", weightKg:1})` → `4,90 €`, zone `FR`.
- `get_shipping_estimate({country:"DE", weightKg:3})` → `12,90 €` (9,90 + 2).
- `get_shipping_estimate({country:"US", weightKg:1})` → **erreur**.

## Solution
Une implémentation de référence est fournie dans
`kata-starter/get_shipping_estimate.solution.ts` (à ne consulter qu'après essai).
