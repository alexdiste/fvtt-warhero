/**
 * Warhero system
 * Author: AlexDiste
 * Software License: Prop
 */

/* -------------------------------------------- */

/* -------------------------------------------- */
// Import Modules
import { WarheroActor } from "./warhero-actor.js";
import { WarheroItemSheet } from "./warhero-item-sheet.js";
import { WarheroActorSheet } from "./warhero-actor-sheet.js";
import { WarheroPartySheet } from "./warhero-party-sheet.js";
import { WarheroUtility } from "./warhero-utility.js";
import { WarheroCombat } from "./warhero-combat.js";
import { WarheroItem } from "./warhero-item.js";
import { WarheroHotbar } from "./warhero-hotbar.js"
import { WarheroCommands } from "./warhero-commands.js"
import { WARHERO_CONFIG } from "./warhero-config.js"

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
  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("fvtt-warhero", WarheroActorSheet, { types: ["character"], makeDefault: true });
  Actors.registerSheet("fvtt-warhero", WarheroPartySheet, { types: ["party"], makeDefault: false });

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("fvtt-warhero", WarheroItemSheet, { makeDefault: true });

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