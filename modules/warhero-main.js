/**
 * Crucible system
 * Author: Uberwald
 * Software License: Prop
 */

/* -------------------------------------------- */

/* -------------------------------------------- */
// Import Modules
import { CrucibleActor } from "./crucible-actor.js";
import { CrucibleItemSheet } from "./crucible-item-sheet.js";
import { CrucibleActorSheet } from "./crucible-actor-sheet.js";
import { CrucibleNPCSheet } from "./crucible-npc-sheet.js";
import { CrucibleUtility } from "./crucible-utility.js";
import { CrucibleCombat } from "./crucible-combat.js";
import { CrucibleItem } from "./crucible-item.js";
import { CrucibleHotbar } from "./crucible-hotbar.js"
import { CrucibleCommands } from "./crucible-commands.js"

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

/************************************************************************************/
Hooks.once("init", async function () {

  console.log(`Initializing Crucible RPG`);
  
  game.system.cruciblerpg = {
    CrucibleHotbar,
    CrucibleCommands
  }

  /* -------------------------------------------- */
  // preload handlebars templates
  CrucibleUtility.preloadHandlebarsTemplates();

  /* -------------------------------------------- */
  // Set an initiative formula for the system 
  CONFIG.Combat.initiative = {
    formula: "1d6",
    decimals: 1
  };

  /* -------------------------------------------- */
  game.socket.on("system.fvtt-crucible-rpg", data => {
    CrucibleUtility.onSocketMesssage(data)
  });

  /* -------------------------------------------- */
  // Define custom Entity classes
  CONFIG.Combat.documentClass = CrucibleCombat
  CONFIG.Actor.documentClass = CrucibleActor
  CONFIG.Item.documentClass = CrucibleItem
  //CONFIG.Token.objectClass = CrucibleToken

  /* -------------------------------------------- */
  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("fvtt-crucible", CrucibleActorSheet, { types: ["character"], makeDefault: true });
  Actors.registerSheet("fvtt-crucible", CrucibleNPCSheet, { types: ["npc"], makeDefault: false });

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("fvtt-crucible", CrucibleItemSheet, { makeDefault: true });

  CrucibleUtility.init()
});

/* -------------------------------------------- */
function welcomeMessage() {
  ChatMessage.create({
    user: game.user.id,
    whisper: [game.user.id],
    content: `<div id="welcome-message-crucible"><span class="rdd-roll-part">
    <strong>Welcome to the Crucible RPG.</strong>
    ` });
}

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */
Hooks.once("ready", function () {

  // User warning
  if (!game.user.isGM && game.user.character == undefined) {
    ui.notifications.info("Warning ! No character linked to your user !");
    ChatMessage.create({
      content: "<b>WARNING</b> The player  " + game.user.name + " is not linked to a character !",
      user: game.user._id
    });
  }
  
  // CSS patch for v9
  if (game.version) {
    let sidebar = document.getElementById("sidebar");
    sidebar.style.width = "min-content";
  }

  welcomeMessage();
  CrucibleUtility.ready()
  CrucibleCommands.init()
  CrucibleHotbar.initDropbar()

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

