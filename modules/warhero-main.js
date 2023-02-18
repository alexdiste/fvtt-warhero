/**
 * Warhero system
 * Author: Uberwald
 * Software License: Prop
 */

/* -------------------------------------------- */

/* -------------------------------------------- */
// Import Modules
import { WarheroActor } from "./warhero-actor.js";
import { WarheroItemSheet } from "./warhero-item-sheet.js";
import { WarheroActorSheet } from "./warhero-actor-sheet.js";
import { WarheroNPCSheet } from "./warhero-npc-sheet.js";
import { WarheroMonsterSheet } from "./warhero-monster-sheet.js";
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
    formula: "1d6",
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
  //CONFIG.Token.objectClass = WarheroToken

  /* -------------------------------------------- */
  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("fvtt-warhero", WarheroActorSheet, { types: ["character"], makeDefault: true });
  Actors.registerSheet("fvtt-warhero", WarheroNPCSheet, { types: ["npc"], makeDefault: false });
  Actors.registerSheet("fvtt-warhero", WarheroMonsterSheet, { types: ["monster"], makeDefault: false });

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("fvtt-warhero", WarheroItemSheet, { makeDefault: true });

  WarheroUtility.init()
});

/* -------------------------------------------- */
function welcomeMessage() {
  /*ChatMessage.create({
    user: game.user.id,
    whisper: [game.user.id],
    content: `<div id="welcome-message-crucible"><span class="rdd-roll-part">
    <strong>Welcome to the Warhero RPG.</strong>
    ` });*/
}

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */
Hooks.once("ready", function () {

  // User warning
  if (!game.user.isGM && game.user.character == undefined) {
    ui.notifications.info("Warning ! No character linked to your user !");
    /*ChatMessage.create({
      content: "<b>WARNING</b> The player  " + game.user.name + " is not linked to a character !",
      user: game.user._id
    });*/
  }
  
  // CSS patch for v9
  if (game.version) {
    let sidebar = document.getElementById("sidebar");
    sidebar.style.width = "min-content";
  }

  welcomeMessage();
  WarheroUtility.ready()
  WarheroCommands.init()
  WarheroHotbar.initDropbar()

})

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */
Hooks.on("chatMessage", (html, content, msg) => {
  if (content[0] == '/') {
    let regExp = /(\S+)/g;
    let commands = content.match(regExp);
    if (game.system.cruciblerpg.commands.processChatCommand(commands, content, msg)) {
      return false;
    }
  }
  return true;
});

