/**
 * Warhero system
 * Author: AlexDiste
 */

/* -------------------------------------------- */

// Import Modules
import { WarheroActor } from "./warhero-actor.js";
import { WarheroUtility } from "./warhero-utility.js";
import { WarheroCombat } from "./warhero-combat.js";
import { WarheroItem } from "./warhero-item.js";
import { WarheroHotbar } from "./warhero-hotbar.js"
import { WARHERO_CONFIG } from "./warhero-config.js"

// Import Data Models
import {
  // Item Data Models
  EquipmentData, WeaponData, ArmorData, ShieldData, SkillData, PowerData,
  LanguageData, LocationData, ConditionData, ClassData, RaceData, MoneyData, PotionData,
  PoisonData, TrapData, ClassItemData, CompetencyData,
  // Actor Data Models
  CharacterData, PartyData
} from "./models/index.js";

import * as sheets from "./sheets/index.js";

const EFFECT_MIGRATION_SETTING = "effect-sanitize-migration-version-v2"

function sanitizeEffectChanges(changes = []) {
  const rawChanges = Array.isArray(changes) ? changes : []
  const validChanges = rawChanges
    .filter(change => {
      return change && typeof change === "object" && typeof change.key === "string" && change.key.trim().length > 0
    })
    .map(change => {
      const key = change.key.trim()
      if (!key || key.includes("..") || key.startsWith(".") || key.endsWith(".")) return null
      return {
        ...change,
        key
      }
    })
    .filter(change => change !== null)

  const keys = validChanges.map(change => change.key)
  return validChanges.filter(change => {
    return !keys.some(otherKey => otherKey !== change.key && otherKey.startsWith(`${change.key}.`))
  })
}

function collectDocumentEffectEntries(parentDocument) {
  if (!parentDocument?.effects?.size) return []

  const entries = []
  for (const effect of parentDocument.effects) {
    const sourceChanges = effect.toObject()?.changes ?? effect.changes ?? []
    const sanitizedChanges = sanitizeEffectChanges(sourceChanges)
    entries.push({
      parentDocument,
      effect,
      sourceChanges,
      sanitizedChanges
    })
  }

  return entries
}

function applyCrossEntryConflictSanitization(effectEntries) {
  const allKeys = effectEntries.flatMap(entry => entry.sanitizedChanges.map(change => change.key))
  for (const entry of effectEntries) {
    entry.sanitizedChanges = entry.sanitizedChanges.filter(change => {
      return !allKeys.some(otherKey => otherKey !== change.key && otherKey.startsWith(`${change.key}.`))
    })
  }
}

async function applyEffectEntryUpdates(effectEntries) {
  if (!effectEntries.length) return 0

  const groupedUpdates = new Map()
  for (const entry of effectEntries) {
    const updates = groupedUpdates.get(entry.parentDocument) || []
    updates.push({ _id: entry.effect.id, changes: entry.sanitizedChanges })
    groupedUpdates.set(entry.parentDocument, updates)
  }

  for (const [parentDocument, updates] of groupedUpdates.entries()) {
    await parentDocument.updateEmbeddedDocuments("ActiveEffect", updates)
  }

  return effectEntries.length
}

function getChangedEffectEntries(effectEntries) {
  return effectEntries.filter(entry => {
    return JSON.stringify(entry.sourceChanges) !== JSON.stringify(entry.sanitizedChanges)
  })
}

function logChangedEffectEntries(effectEntries) {
  for (const entry of effectEntries) {
    console.warn(`Warhero | Migration sanitized effect for ${entry.parentDocument.name || "unnamed"} (${entry.parentDocument.uuid || "unknown"}) effect=${entry.effect.name || "unnamed"} (${entry.effect.id || "unknown"}) removed=${(Array.isArray(entry.sourceChanges) ? entry.sourceChanges.length : 0) - entry.sanitizedChanges.length}`)
  }
}

async function migrateDocumentEffects(parentDocument) {
  const entries = collectDocumentEffectEntries(parentDocument)
  if (!entries.length) return 0

  applyCrossEntryConflictSanitization(entries)
  const changedEntries = getChangedEffectEntries(entries)
  logChangedEffectEntries(changedEntries)
  return applyEffectEntryUpdates(changedEntries)
}

async function migrateActorEffectGraph(actorDocument) {
  if (!actorDocument) return 0

  const actorEntries = collectDocumentEffectEntries(actorDocument)
  const itemEntries = []
  for (const item of actorDocument.items || []) {
    itemEntries.push(...collectDocumentEffectEntries(item))
  }

  const allEntries = [...actorEntries, ...itemEntries]
  if (!allEntries.length) return 0

  applyCrossEntryConflictSanitization(allEntries)
  const changedEntries = getChangedEffectEntries(allEntries)
  logChangedEffectEntries(changedEntries)
  return applyEffectEntryUpdates(changedEntries)
}

async function migrateTokenActorDeltaEffects(tokenDocument) {
  const actorDelta = tokenDocument?.actorDelta
  if (!actorDelta) return 0

  return migrateActorEffectGraph(actorDelta)
}

async function migrateSceneTokenEffects(sceneDocument) {
  if (!sceneDocument?.tokens?.size) return 0

  let updated = 0
  for (const token of sceneDocument.tokens) {
    updated += await migrateTokenActorDeltaEffects(token)
  }

  return updated
}

async function runOneShotActiveEffectMigration() {
  if (!game.user.isGM) return

  const targetVersion = game.system.version
  const migratedVersion = game.settings.get("fvtt-warhero", EFFECT_MIGRATION_SETTING)
  if (migratedVersion === targetVersion) return

  let updatedEffects = 0

  for (const actor of game.actors.contents) {
    updatedEffects += await migrateActorEffectGraph(actor)
  }

  for (const item of game.items.contents) {
    updatedEffects += await migrateDocumentEffects(item)
  }

  for (const scene of game.scenes.contents) {
    updatedEffects += await migrateSceneTokenEffects(scene)
  }

  await game.settings.set("fvtt-warhero", EFFECT_MIGRATION_SETTING, targetVersion)
  console.log(`Warhero | ActiveEffect sanitize migration completed for ${targetVersion}. Updated effects: ${updatedEffects}`)
}

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

/************************************************************************************/
Hooks.once("init", async function () {

  game.system.warhero = {
    WarheroHotbar,
    config: WARHERO_CONFIG
  }

  game.settings.register("fvtt-warhero", EFFECT_MIGRATION_SETTING, {
    name: "ActiveEffect sanitize migration version",
    hint: "Internal setting to track one-shot ActiveEffect cleanup migration.",
    scope: "world",
    config: false,
    type: String,
    default: ""
  })

  /* -------------------------------------------- */
  // preload handlebars templates
  WarheroUtility.preloadHandlebarsTemplates();

  /* -------------------------------------------- */
  // Set an initiative formula for the system
  CONFIG.Combat.initiative = {
    formula: "1d20",
    decimals: 1
  };

  /* -------------------------------------------- */
  game.socket.on("system.fvtt-warhero", data => {
    WarheroUtility.onSocketMesssage(data)
  });

  // Ensure new effect transfer (when supported by current Foundry version)
  if (Object.prototype.hasOwnProperty.call(CONFIG.ActiveEffect, "legacyTransferral")) {
    CONFIG.ActiveEffect.legacyTransferral = false;
  }

  /* -------------------------------------------- */
  // Define custom Entity classes
  CONFIG.Combat.documentClass = WarheroCombat
  CONFIG.Actor.documentClass = WarheroActor
  CONFIG.Item.documentClass = WarheroItem

  /* -------------------------------------------- */
  // Register Item Data Models
  Object.assign(CONFIG.Item.dataModels, {
    equipment: EquipmentData,
    weapon: WeaponData,
    armor: ArmorData,
    shield: ShieldData,
    skill: SkillData,
    power: PowerData,
    language: LanguageData,
    location: LocationData,
    condition: ConditionData,
    class: ClassData,
    race: RaceData,
    money: MoneyData,
    potion: PotionData,
    poison: PoisonData,
    trap: TrapData,
    classitem: ClassItemData,
    competency: CompetencyData
  });

  /* -------------------------------------------- */
  // Register Actor Data Models
  Object.assign(CONFIG.Actor.dataModels, {
    character: CharacterData,
    party: PartyData
  });

  /* -------------------------------------------- */
  // Register sheet application classes (with v13/v14 compatibility fallbacks)
  const actorCollection = foundry.documents?.collections?.Actors ?? Actors
  const itemCollection = foundry.documents?.collections?.Items ?? Items
  const legacyActorSheet = foundry.appv1?.sheets?.ActorSheet ?? globalThis.ActorSheet
  const legacyItemSheet = foundry.appv1?.sheets?.ItemSheet ?? globalThis.ItemSheet

  if (legacyActorSheet) {
    actorCollection.unregisterSheet("core", legacyActorSheet)
  }
  actorCollection.registerSheet("fvtt-warhero", sheets.WarheroCharacterSheet, {
    types: ["character"],
    makeDefault: true,
    label: "WH.sheet.actorV2"
  });
  actorCollection.registerSheet("fvtt-warhero", sheets.WarheroPartySheet, {
    types: ["party"],
    makeDefault: true,
    label: "WH.sheet.partyV2"
  });

  if (legacyItemSheet) {
    itemCollection.unregisterSheet("core", legacyItemSheet)
  }
  itemCollection.registerSheet("fvtt-warhero", sheets.WarheroEquipmentSheetV2, { types: ["equipment"], makeDefault: true });
  itemCollection.registerSheet("fvtt-warhero", sheets.WarheroShieldSheetV2, { types: ["shield"], makeDefault: true });
  itemCollection.registerSheet("fvtt-warhero", sheets.WarheroWeaponSheetV2, { types: ["weapon"], makeDefault: true });
  itemCollection.registerSheet("fvtt-warhero", sheets.WarheroPowerSheetV2, { types: ["power"], makeDefault: true });
  itemCollection.registerSheet("fvtt-warhero", sheets.WarheroSkillSheetV2, { types: ["skill"], makeDefault: true });
  itemCollection.registerSheet("fvtt-warhero", sheets.WarheroArmorSheetV2, { types: ["armor"], makeDefault: true });
  itemCollection.registerSheet("fvtt-warhero", sheets.WarheroRaceSheetV2, { types: ["race"], makeDefault: true });
  itemCollection.registerSheet("fvtt-warhero", sheets.WarheroClassSheetV2, { types: ["class"], makeDefault: true });
  itemCollection.registerSheet("fvtt-warhero", sheets.WarheroClassItemSheetV2, { types: ["classitem"], makeDefault: true });
  itemCollection.registerSheet("fvtt-warhero", sheets.WarheroCompetencySheetV2, { types: ["competency"], makeDefault: true });
  itemCollection.registerSheet("fvtt-warhero", sheets.WarheroConditionSheetV2, { types: ["condition"], makeDefault: true });
  itemCollection.registerSheet("fvtt-warhero", sheets.WarheroLanguageSheetV2, { types: ["language"], makeDefault: true });
  itemCollection.registerSheet("fvtt-warhero", sheets.WarheroLocationSheetV2, { types: ["location"], makeDefault: true });
  itemCollection.registerSheet("fvtt-warhero", sheets.WarheroMoneySheetV2, { types: ["money"], makeDefault: true });
  itemCollection.registerSheet("fvtt-warhero", sheets.WarheroPotionSheetV2, { types: ["potion"], makeDefault: true });
  itemCollection.registerSheet("fvtt-warhero", sheets.WarheroPoisonSheetV2, { types: ["poison"], makeDefault: true });
  itemCollection.registerSheet("fvtt-warhero", sheets.WarheroTrapSheetV2, { types: ["trap"], makeDefault: true });

  WarheroUtility.init()
});

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */
Hooks.once("ready", async function () {

  // User warning
  if (!game.user.isGM && game.user.character == undefined) {
    ui.notifications.info(game.i18n.localize("WH.notif.nocharacterlinked"));
  }

  await runOneShotActiveEffectMigration()

  WarheroUtility.ready()
})