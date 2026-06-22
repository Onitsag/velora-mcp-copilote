# Démonstration des outils MCP (sans LLM)

Ce document est généré par `npm run showcase` : il contient des **appels réels**
du client MCP vers le serveur Velora et les **résultats bruts** renvoyés.

## Outils disponibles

- `search_products` — Recherche dans le catalogue Velora par mots-clés, catégorie, couleur et prix maximum. Renvoie pour chaque produit son SKU, son prix et sa disponibilité.
- `get_product` — Renvoie la fiche complète d'un produit (description, prix, stock par taille) à partir de son SKU.
- `check_stock` — Vérifie la disponibilité d'un produit, globalement ou pour une taille précise.
- `get_order_status` — Renvoie le statut d'une commande à partir de sa référence (ex: VEL-1003), ou la liste des commandes d'un client à partir de son email.
- `get_return_policy` — Renvoie la politique de retours et d'échanges de Velora (délais, conditions, remboursement).
- `create_return_request` — Enregistre une demande de retour pour un article d'une commande LIVRÉE. Action d'écriture : en production, elle doit être confirmée par un humain (human-in-the-loop).

## Ressources disponibles

- `policy://returns` — politique-retours
- `policy://shipping` — politique-livraison

## Rechercher les robes en stock

**Appel :** `search_products({"category":"Robes","inStockOnly":true})`

```json
{
  "count": 2,
  "products": [
    {
      "sku": "VEL-ROBE-001",
      "name": "Robe portefeuille Lila",
      "category": "Robes",
      "color": "Violet",
      "price": "79,00 €",
      "available": true,
      "totalStock": 10
    },
    {
      "sku": "VEL-ROBE-002",
      "name": "Robe chemise Origan",
      "category": "Robes",
      "color": "Kaki",
      "price": "65,00 €",
      "available": true,
      "totalStock": 6
    }
  ]
}
```

## Fiche produit — bottines Chelsea

**Appel :** `get_product({"sku":"VEL-CHAUS-001"})`

```json
{
  "sku": "VEL-CHAUS-001",
  "name": "Bottines Chelsea Ardoise",
  "description": "Bottines en cuir, élastiques latéraux.",
  "category": "Chaussures",
  "color": "Noir",
  "price": "119,00 €",
  "available": true,
  "variants": [
    {
      "size": "38",
      "stockQty": 2,
      "available": true
    },
    {
      "size": "39",
      "stockQty": 3,
      "available": true
    },
    {
      "size": "40",
      "stockQty": 0,
      "available": false
    },
    {
      "size": "41",
      "stockQty": 1,
      "available": true
    },
    {
      "size": "42",
      "stockQty": 2,
      "available": true
    }
  ]
}
```

## Vérifier le stock de la taille 39

**Appel :** `check_stock({"sku":"VEL-CHAUS-001","size":"39"})`

```json
{
  "sku": "VEL-CHAUS-001",
  "size": "39",
  "stockQty": 3,
  "available": true
}
```

## Statut de la commande VEL-1003

**Appel :** `get_order_status({"reference":"VEL-1003"})`

```json
{
  "reference": "VEL-1003",
  "status": "preparing",
  "statusLabel": "En préparation",
  "carrier": null,
  "trackingNumber": null,
  "createdAt": "2026-06-22T09:30:20.132Z",
  "customer": {
    "name": "Chloé Nguyen",
    "email": "chloe.nguyen@example.com"
  },
  "items": [
    {
      "sku": "VEL-CHAUS-001",
      "size": "39",
      "qty": 1,
      "unitPrice": "119,00 €"
    },
    {
      "sku": "VEL-PULL-001",
      "size": "M",
      "qty": 1,
      "unitPrice": "69,00 €"
    }
  ],
  "total": "188,00 €"
}
```

## Commandes du client alice.martin

**Appel :** `get_order_status({"email":"alice.martin@example.com"})`

```json
{
  "customer": "Alice Martin",
  "email": "alice.martin@example.com",
  "orders": [
    {
      "reference": "VEL-1001",
      "status": "delivered",
      "statusLabel": "Livrée",
      "createdAt": "2026-06-22T09:30:20.085Z",
      "itemsCount": 2
    },
    {
      "reference": "VEL-1005",
      "status": "returned",
      "statusLabel": "Retournée",
      "createdAt": "2026-06-22T09:30:20.184Z",
      "itemsCount": 1
    }
  ]
}
```

## Retour refusé (commande non livrée)  ⚠️ _(isError)_

**Appel :** `create_return_request({"reference":"VEL-1003","sku":"VEL-PULL-001","reason":"Trop grand"})`

```json
{"error":"Un retour n'est possible que pour une commande livrée. Statut actuel de VEL-1003 : preparing."}
```

## Retour accepté (commande livrée VEL-1001)

**Appel :** `create_return_request({"reference":"VEL-1001","sku":"VEL-ROBE-001","reason":"Taille trop grande"})`

```json
{
  "message": "Demande de retour enregistrée (RMA créé).",
  "rmaId": 2,
  "reference": "VEL-1001",
  "sku": "VEL-ROBE-001",
  "size": "M",
  "status": "requested",
  "note": "En production, cette action nécessite une confirmation humaine avant validation."
}
```

