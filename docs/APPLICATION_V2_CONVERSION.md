# Warhero Item Sheets - Application v2 Conversion

## Vue d'ensemble

Ce document décrit la conversion des fiches d'items du système Warhero du format Application v1 (ancien) vers Application v2 (nouveau format Foundry VTT).

## Fichiers créés

### Nouvelle classe ItemSheet v2
- **`modules/warhero-item-sheet-v2.js`** - Classe principale étendant `foundry.applications.sheets.ItemSheetV2`

### Templates de base
- **`templates/item-sheet-header.html`** - En-tête commun avec image, nom et actions
- **`templates/item-sheet-tabs.html`** - Navigation par onglets
- **`templates/item-sheet-description.html`** - Onglet description avec éditeur riche
- **`templates/item-sheet-details.html`** - Onglet détails générique
- **`templates/item-sheet-footer.html`** - Pied de page avec actions et infos

### Templates spécialisés par type d'item
- **`templates/item-weapon-sheet-v2.html`** - Armes avec stats de combat
- **`templates/item-armor-sheet-v2.html`** - Armures avec défense et DR
- **`templates/item-shield-sheet-v2.html`** - Boucliers avec bonus parade
- **`templates/item-equipment-sheet-v2.html`** - Équipement général et conteneurs
- **`templates/item-skill-sheet-v2.html`** - Compétences avec jets de dés
- **`templates/item-power-sheet-v2.html`** - Pouvoirs magiques
- **`templates/item-class-sheet-v2.html`** - Classes de personnage
- **`templates/item-race-sheet-v2.html`** - Races avec traits raciaux
- **`templates/item-money-sheet-v2.html`** - Monnaies et gemmes
- **`templates/item-potion-sheet-v2.html`** - Potions avec effets
- **`templates/item-poison-sheet-v2.html`** - Poisons avec jets de sauvegarde
- **`templates/item-trap-sheet-v2.html`** - Pièges avec difficultés
- **`templates/item-condition-sheet-v2.html`** - Conditions d'état
- **`templates/item-language-sheet-v2.html`** - Langues avec niveaux
- **`templates/item-competency-sheet-v2.html`** - Compétences générales
- **`templates/item-classitem-sheet-v2.html`** - Capacités de classe
- **`templates/item-genericitem-sheet-v2.html`** - Template générique

### Styles
- **`styles/item-sheet-v2.css`** - Feuille de style complète pour les nouvelles fiches

## Fonctionnalités Application v2

### Architecture moderne
- Utilise `foundry.applications.sheets.ItemSheetV2` comme classe de base
- Système d'actions déclaratif avec `data-action`
- Gestion automatique des formulaires avec `submitOnChange`
- Structure modulaire avec `PARTS` pour les templates

### Actions disponibles
- **`post-item`** - Poster l'item dans le chat
- **`edit-subitem`** - Éditer un sous-item
- **`delete-subitem`** - Supprimer un sous-item
- **`roll-damage`** - Lancer les dégâts (armes)
- **`roll-attack`** - Lancer une attaque (armes)
- **`roll-skill`** - Lancer une compétence
- **`use-item`** - Utiliser un item (potions, équipement magique)
- **`show-image`** - Afficher l'image en grand
- **`cast-power`** - Lancer un pouvoir magique

### Interface utilisateur améliorée
- Design responsive et moderne
- Navigation par onglets fluide
- Boutons d'action contextuels
- Affichage des statistiques en blocs
- Éditeurs riches pour les descriptions
- Validation automatique des formulaires

### Onglets dynamiques
- **Description** - Toujours présent avec éditeur riche
- **Détails** - Propriétés spécifiques au type d'item
- **Combat** - Pour les armes, armures et boucliers
- **Usage** - Pour les compétences, pouvoirs et items consommables

## Migration et compatibilité

### Enregistrement des fiches
```javascript
// Dans warhero-main.js
Items.registerSheet("fvtt-warhero", WarheroItemSheet, { makeDefault: false });
Items.registerSheet("fvtt-warhero", WarheroItemSheetV2, { makeDefault: true });
```

### DataModels intégrés
Les nouvelles fiches utilisent les DataModels créés précédemment :
- Validation automatique des données
- Méthodes intégrées (use, rest, etc.)
- Migration transparente depuis template.json

### Rétrocompatibilité
- L'ancienne fiche reste disponible
- Les données existantes sont automatiquement compatibles
- Aucune perte de fonctionnalité

## Structure des templates

### Template modulaire
```handlebars
{{!-- Exemple de structure --}}
<section class="sheet-body">
  {{> item-sheet-tabs}}
  <div class="tab-content">
    {{> item-sheet-description}}
    <div class="tab details" data-group="primary" data-tab="details">
      <!-- Contenu spécifique au type -->
    </div>
  </div>
</section>
{{> item-sheet-footer}}
```

### Données contextuelles
Chaque template reçoit :
- `document` - Le document item complet
- `system` - Les données système de l'item
- `isOwner`, `isEditable` - Permissions
- `config` - Configuration du système
- Données spécifiques au type (weaponTypes, armorTypes, etc.)

## Styles et thèmes

### CSS moderne
- Variables CSS pour la cohérence
- Flexbox et Grid pour la mise en page
- Animations et transitions fluides
- Design responsive pour mobile/tablette

### Thème Warhero
- Couleurs cohérentes avec le système
- Icônes Font Awesome intégrées
- Boutons d'action colorés par contexte
- Zones d'information bien délimitées

## Utilisation

### Pour les utilisateurs
1. Les nouvelles fiches sont activées par défaut
2. Interface plus moderne et intuitive
3. Actions rapides disponibles via boutons
4. Navigation améliorée entre les onglets

### Pour les développeurs
1. Système d'actions facile à étendre
2. Templates modulaires réutilisables
3. CSS bien organisé et documenté
4. Intégration complète avec les DataModels

## Prochaines étapes

### Extensions possibles
- Fiches d'acteurs en Application v2
- Templates pour mobiles/tablettes
- Thèmes alternatifs
- Intégration avec les modules tiers

### Maintenance
- Tests avec différentes versions de Foundry
- Optimisations de performance
- Corrections de bugs et améliorations UX
- Documentation utilisateur complète