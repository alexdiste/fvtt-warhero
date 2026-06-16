# AGENTS.md — fvtt-warhero

## Repo overview

FoundryVTT game system for Warhero RPG (Italian). Raw ES modules, no bundler, no tests, no CI, no linters.

## Entrypoints

| What | Path |
|------|------|
| System manifest | `system.json` (id: `fvtt-warhero`) |
| Module entry | `modules/warhero-main.js` (listed in `system.json` `esmodules`) |
| Styles | `styles/simple.css` (compiled output, listed in `system.json` `styles`); source: `styles/simple.less` |
| Build tool | `package.json` (only dependency: `less`) |

## Source structure

```
modules/
  warhero-main.js         → Hooks.once("init") + ("ready")
  warhero-actor.js        → CONFIG.Actor.documentClass
  warhero-item.js         → CONFIG.Item.documentClass
  warhero-combat.js       → CONFIG.Combat.documentClass
  warhero-config.js       → WARHERO_CONFIG (weapon/armor/shield types, slots, stats, etc.)
  warhero-utility.js      → Handlebars helpers, roll logic, temp HP bar patch
  models/                 → 18 data models (ItemData × 16, ActorData × 2)
  sheets/                 → 22 sheet classes (Actor × 2, Item × 20)
templates/
  actors/                 → partials: stat-block, equipment, powers, skills, combat, effects, biography
  items/                  → partials: one per item type
  chat-*.html / .hbs      → chat message templates
lang/
  en.json, it.json
src/packs/                → YAML source files for compendia
packs/                    → compiled LevelDB compendia (gitignored!)
```

## Actor & Item model hierarchy

- **Actor types**: `character`, `party`
- **Item types** (17): armor, class, classitem, equipment, weapon, competency, power, language, location, money, condition, poison, potion, race, shield, skill, trap

All registered via `CONFIG.Actor.dataModels` / `CONFIG.Item.dataModels` in `warhero-main.js`.

## Compendium workflow

- Sources: `src/packs/<pack-name>/_source/*.yml`
- Compiled output: `packs/<pack-name>/` (LevelDB, gitignored)
- **The `packs/` directory is listed in `.gitignore`** — agents must edit the YAML in `src/packs/`, then rebuild.

## Key system config

- `CONFIG.Combat.initiative.formula`: `"1d20"`
- Primary token attribute: `attributes.hp`, secondary: `attributes.mana`
- Grid: 1m/unit
- HotReload: css, html, hbs, json (paths: `./`, `templates`, `styles`, `lang/*.json`)
- Socket: enabled (`system.fvtt-warhero` channel, used for roll sync)
- ActiveEffect legacy transferral: disabled (`false`)

## Roll mechanics

Rolls are handled in `WarheroUtility.rollWarhero()`:
- Attack/ability rolls: `1d20 + stat.value + bonuses`
- Damage: weapon damage formula + bonus/malus
- Parry: `1d12 + stat.value`
- Initiative: `1d20`
- Dice So Nice integration: checked in `showDiceSoNice()`
- Roll data shared via socket (`msg_update_roll`)

## Development

No build tooling exists (except CSS). To work on this system:
1. Clone into Foundry's `Data/systems/fvtt-warhero/` directory
2. Run `npm install` once
3. Edit YAML sources in `src/packs/` (not `packs/`)
4. Enable Foundry hot reload for css/html/hbs/json changes
5. No test/lint/typecheck commands available

## CSS

- Source: `styles/simple.less`, compile with `npm run build:css`
- Dev watch: `npm run watch:css` — auto-compiles on save
- Output: `styles/simple.css` (committed artifact, FoundryVTT hot reloads it)
- `system.json` references `styles/simple.css` — path unchanged

## Branches

- `main` — stable releases
- `feature/roll-rework` — active development (current default)
- `fixes/analysis-round` — bugfix branch
