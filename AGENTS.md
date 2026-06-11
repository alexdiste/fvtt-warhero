# fvtt-warhero — Agent Guide

FoundryVTT game system "Warhero RPG" (id: `fvtt-warhero`). Plain JS ES modules, no build step, no tests, no linter, no TS.

## Commands

There is no npm/package.json for the system code. The only tool dependency is the FoundryVTT CLI used in CI:

```bash
# compile one compendium pack (YAML source -> packs/)
fvtt package pack -n "<packname>" --in "src/packs/<packname>/_source" --out "packs" --id "fvtt-warhero" --type "System" --yaml
```

## Code layout

| Path | Purpose |
|------|---------|
| `modules/warhero-main.js` | Entry point (`Hooks.once("init")`) |
| `modules/warhero-actor.js` | `WarheroActor extends Actor` |
| `modules/warhero-item.js` | `WarheroItem extends Item` |
| `modules/warhero-combat.js` | `WarheroCombat extends Combat` |
| `modules/warhero-config.js` | `WARHERO_CONFIG` — item types, slots, options |
| `modules/warhero-utility.js` | Static helpers, roll logic, socket handling |
| `modules/models/` | `TypeDataModel` classes per actor/item type |
| `modules/sheets/` | Sheet classes (v2 API: `HandlebarsApplicationMixin` + `ItemSheetV2`/`ActorSheetV2`) |
| `templates/` | Handlebars (`.hbs`) |
| `styles/simple.css` | All styles |
| `lang/en.json`, `lang/it.json` | Localization |
| `src/packs/` | Compendium source (YAML) — compiled to `packs/` (gitignored) |
| `images/icons/` | SVG icons from game-icons.net |

## Data model pattern

Item models in `modules/models/*-data.js` extend `foundry.abstract.TypeDataModel`, define schema via `static defineSchema()` using `foundry.data.fields.*`. Actor models (character, party) follow the same pattern.

All data models must declare `static LOCALIZATION_PREFIXES = ["WH.ClassName"];` for automatic field label resolution.

Registered in `warhero-main.js`:
- 17 item types: equipment, weapon, armor, shield, skill, power, language, location, condition, class, race, money, potion, poison, trap, classitem, competency
- 2 actor types: character, party

## Sheet pattern

Sheets use Foundry v2 API (`foundry.applications.api`). Items extend `WarheroBaseItemSheet` (which mixes `HandlebarsApplicationMixin` into `ItemSheetV2`). Actors extend `WarheroActorSheet` (mixes into `ActorSheetV2`). Parts are defined as `static PARTS = { ... }` with template paths prefixed `systems/fvtt-warhero/`.

## System API

System classes are exposed on `game.system.warhero`:
- `game.system.warhero.config` — WARHERO_CONFIG
- `game.system.warhero.applications` — all sheet classes
- `game.system.warhero.models` — all data model classes
- `game.system.warhero.documents` — WarheroActor, WarheroItem, WarheroCombat
- `game.system.warhero.WarheroUtility` — static utility methods

## Release (CI)

`.github/workflows/release.yml`: tag-based release.
- `s*` tag → stable (zip name `fvtt-warhero.zip`, `latest` manifest URL)
- `v*` tag → beta/prerelease (versioned zip)
- Compiles packs from `src/packs/`, updates `system.json` version/manifest/download via sed, zips excluding `src/`, `.github/`, etc.

## Hot reload

Configured in `system.json` `flags.hotReload` for `css`, `html`, `hbs`, `json` extensions. Paths include `./`, `templates`, `styles`, `lang/en.json`, `lang/it.json`.

## Localization

Keys follow `WH.*` pattern (e.g. `WH.ui.Strength`, `WH.conf.short`). Two languages: English (`lang/en.json`), Italian (`lang/it.json`).

## Grid

`system.json`: `distance: 1, units: "m"`.

## Git

- `packs/`, `dist/`, `node_modules/`, `docs/`, `copilot-instructions.md`, `agents/`, `.vscode/` are gitignored
- `AGENTS.md` is NOT in `.gitignore` — commit it to the repo

## Constraints

- No tests exist. No CI test step.
- No automated linting or typechecking.
- Foundry v14 compatibility (`system.json: minimum/verified: 14`).
