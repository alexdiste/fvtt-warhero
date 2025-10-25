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
import { WarheroCommands } from "./warhero-commands.js"
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

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

/************************************************************************************/
Hooks.once("init", async function () {

  console.log(`Initializing Warhero RPG`);

  game.system.warhero = {
    WarheroHotbar,
    WarheroCommands,
    config: WARHERO_CONFIG
  }

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
  // Register sheet application classes
  foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
  foundry.documents.collections.Actors.registerSheet("fvtt-warhero", sheets.WarheroCharacterSheet, {
    types: ["character"],
    makeDefault: true,
    label: "WH.sheet.actorV2"
  });
  foundry.documents.collections.Actors.registerSheet("fvtt-warhero", sheets.WarheroPartySheet, {
    types: ["party"],
    makeDefault: true,
    label: "WH.sheet.partyV2"
  });

  foundry.documents.collections.Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);
  foundry.documents.collections.Items.registerSheet("fvtt-warhero", sheets.WarheroEquipmentSheetV2, { types: ["equipment"], makeDefault: true });
  foundry.documents.collections.Items.registerSheet("fvtt-warhero", sheets.WarheroShieldSheetV2, { types: ["shield"], makeDefault: true });
  foundry.documents.collections.Items.registerSheet("fvtt-warhero", sheets.WarheroWeaponSheetV2, { types: ["weapon"], makeDefault: true });
  foundry.documents.collections.Items.registerSheet("fvtt-warhero", sheets.WarheroPowerSheetV2, { types: ["power"], makeDefault: true });
  foundry.documents.collections.Items.registerSheet("fvtt-warhero", sheets.WarheroSkillSheetV2, { types: ["skill"], makeDefault: true });
  foundry.documents.collections.Items.registerSheet("fvtt-warhero", sheets.WarheroArmorSheetV2, { types: ["armor"], makeDefault: true });
  foundry.documents.collections.Items.registerSheet("fvtt-warhero", sheets.WarheroRaceSheetV2, { types: ["race"], makeDefault: true });
  foundry.documents.collections.Items.registerSheet("fvtt-warhero", sheets.WarheroClassSheetV2, { types: ["class"], makeDefault: true });
  foundry.documents.collections.Items.registerSheet("fvtt-warhero", sheets.WarheroClassItemSheetV2, { types: ["classitem"], makeDefault: true });
  foundry.documents.collections.Items.registerSheet("fvtt-warhero", sheets.WarheroCompetencySheetV2, { types: ["competency"], makeDefault: true });
  foundry.documents.collections.Items.registerSheet("fvtt-warhero", sheets.WarheroConditionSheetV2, { types: ["condition"], makeDefault: true });
  foundry.documents.collections.Items.registerSheet("fvtt-warhero", sheets.WarheroLanguageSheetV2, { types: ["language"], makeDefault: true });
  foundry.documents.collections.Items.registerSheet("fvtt-warhero", sheets.WarheroLocationSheetV2, { types: ["location"], makeDefault: true });
  foundry.documents.collections.Items.registerSheet("fvtt-warhero", sheets.WarheroMoneySheetV2, { types: ["money"], makeDefault: true });
  foundry.documents.collections.Items.registerSheet("fvtt-warhero", sheets.WarheroPotionSheetV2, { types: ["potion"], makeDefault: true });
  foundry.documents.collections.Items.registerSheet("fvtt-warhero", sheets.WarheroPoisonSheetV2, { types: ["poison"], makeDefault: true });
  foundry.documents.collections.Items.registerSheet("fvtt-warhero", sheets.WarheroTrapSheetV2, { types: ["trap"], makeDefault: true });

  WarheroUtility.init()
});

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */
Hooks.once("ready", function () {

  // User warning
  if (!game.user.isGM && game.user.character == undefined) {
    ui.notifications.info("Warning ! No character linked to your user !");
  }

  WarheroUtility.ready()
})