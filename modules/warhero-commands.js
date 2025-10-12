/* -------------------------------------------- */

import { WarheroUtility } from "./warhero-utility.js";
import { WarheroRollDialog } from "./__deprecated/warhero-roll-dialog.js";

/* -------------------------------------------- */
const __saveFirstToKey = { r: "reflex", f: "fortitude", w: "willpower" }

/* -------------------------------------------- */
export class WarheroCommands {

  static init() {
    if (!game.system.warhero.commands) {
      const crucibleCommands = new WarheroCommands();
      //crucibleCommands.registerCommand({ path: ["/rtarget"], func: (content, msg, params) => WarheroCommands.rollTarget(msg, params), descr: "Launch the target roll window" });
      //crucibleCommands.registerCommand({ path: ["/rsave"], func: (content, msg, params) => WarheroCommands.rollSave(msg, params), descr: "Performs a save roll" });
      game.system.warhero.commands = crucibleCommands;
    }
  }

  constructor() {
    this.commandsTable = {};
  }

  /* -------------------------------------------- */
  registerCommand(command) {
    this._addCommand(this.commandsTable, command.path, '', command);
  }

  /* -------------------------------------------- */
  _addCommand(targetTable, path, fullPath, command) {
    if (!this._validateCommand(targetTable, path, command)) {
      return;
    }
    const term = path[0];
    fullPath = fullPath + term + ' '
    if (path.length == 1) {
      command.descr = `<strong>${fullPath}</strong>: ${command.descr}`;
      targetTable[term] = command;
    }
    else {
      if (!targetTable[term]) {
        targetTable[term] = { subTable: {} };
      }
      this._addCommand(targetTable[term].subTable, path.slice(1), fullPath, command)
    }
  }

  /* -------------------------------------------- */
  _validateCommand(targetTable, path, command) {
    if (path.length > 0 && path[0] && command.descr && (path.length != 1 || targetTable[path[0]] == undefined)) {
      return true;
    }
    console.warn("crucibleCommands._validateCommand failed ", targetTable, path, command);
    return false;
  }


  /* -------------------------------------------- */
  /* Manage chat commands */
  processChatCommand(commandLine, content = '', msg = {}) {
    // Setup new message's visibility
    let rollMode = game.settings.get("core", "rollMode");
    if (["gmroll", "blindroll"].includes(rollMode)) msg["whisper"] = ChatMessage.getWhisperRecipients("GM");
    if (rollMode === "blindroll") msg["blind"] = true;
    msg["type"] = 0;

    let command = commandLine[0].toLowerCase();
    let params = commandLine.slice(1);

    return this.process(command, params, content, msg);
  }

  /* -------------------------------------------- */
  process(command, params, content, msg) {
    return this._processCommand(this.commandsTable, command, params, content, msg);
  }

  /* -------------------------------------------- */
  _processCommand(commandsTable, name, params, content = '', msg = {}, path = "") {
    console.log("===> Processing command")
    let command = commandsTable[name];
    path = path + name + " ";
    if (command && command.subTable) {
      if (params[0]) {
        return this._processCommand(command.subTable, params[0], params.slice(1), content, msg, path)
      }
      else {
        this.help(msg, command.subTable);
        return true;
      }
    }
    if (command && command.func) {
      const result = command.func(content, msg, params);
      if (result == false) {
        WarheroCommands._chatAnswer(msg, command.descr);
      }
      return true;
    }
    return false;
  }

  /* -------------------------------------------- */
  static _chatAnswer(msg, content) {
    msg.whisper = [game.user.id];
    msg.content = content;
    ChatMessage.create(msg);
  }

  /* -------------------------------------------- */
  static rollTarget(msg, params) {
    const speaker = ChatMessage.getSpeaker()
    let actor
    if (speaker.token) actor = game.actors.tokens[speaker.token]
    if (!actor) actor = game.actors.get(speaker.actor)
    if (!actor) {
      return ui.notifications.warn(`Select your actor to run the macro`)
    }
    actor.rollDefenseRanged()
  }

  /* -------------------------------------------- */
  static rollSave(msg, params) {
    console.log(msg, params)
    if (params.length == 0) {
      ui.notifications.warn("/rsave command error : syntax is /rsave reflex, /rsave fortitude or /rsave willpower")
      return
    }
    let saveKey = params[0].toLowerCase()
    if (saveKey.length > 0 && (saveKey[0] == "r" || saveKey[0] == "f" || saveKey[0] == "w")) {
      const speaker = ChatMessage.getSpeaker()
      let actor
      if (speaker.token) actor = game.actors.tokens[speaker.token]
      if (!actor) actor = game.actors.get(speaker.actor)
      if (!actor) {
        return ui.notifications.warn(`Select your actor to run the macro`)
      }
      actor.rollSave(__saveFirstToKey[saveKey[0]])
    } else {
      ui.notifications.warn("/rsave syntax error : syntax is /rsave reflex, /rsave fortitude or /rsave willpower")
    }
  }
}