/* -------------------------------------------- */
import { WarheroCombat } from "./warhero-combat.js";
import { WarheroCommands } from "./warhero-commands.js";

/* -------------------------------------------- */

/* -------------------------------------------- */
export class WarheroUtility {


  /* -------------------------------------------- */
  static async init() {
    Hooks.on('renderChatLog', (log, html, data) => WarheroUtility.chatListeners(html));
    /*Hooks.on("dropCanvasData", (canvas, data) => {
      WarheroUtility.dropItemOnToken(canvas, data)
    });*/

    this.rollDataStore = {}
    this.defenderStore = {}

    WarheroCommands.init();

    Handlebars.registerHelper('count', function (list) {
      return list.length;
    })
    Handlebars.registerHelper('includes', function (array, val) {
      return array.includes(val);
    })
    Handlebars.registerHelper('upper', function (text) {
      return text.toUpperCase();
    })
    Handlebars.registerHelper('lower', function (text) {
      return text.toLowerCase()
    })
    Handlebars.registerHelper('upperFirst', function (text) {
      if (typeof text !== 'string') return text
      return text.charAt(0).toUpperCase() + text.slice(1)
    })
    Handlebars.registerHelper('notEmpty', function (list) {
      return list.length > 0;
    })
    Handlebars.registerHelper('mul', function (a, b) {
      return parseInt(a) * parseInt(b);
    })

    this.gameSettings()

  }

  /*-------------------------------------------- */
  static gameSettings() {
    /*game.settings.register("fvtt-warhero", "dice-color-skill", {
      name: "Dice color for skills",
      hint: "Set the dice color for skills",
      scope: "world",
      config: true,
      requiresReload: true ,
      default: "#101010",
      type: String
    })

    Hooks.on('renderSettingsConfig', (event) => {
      const element = event.element[0].querySelector(`[name='fvtt-warhero.dice-color-skill']`)
      if (!element) return
      // Replace placeholder element
      console.log("Element Found !!!!")
    })    */
  }
  
  /*-------------------------------------------- */
  static upperFirst(text) {
    if (typeof text !== 'string') return text
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  /*-------------------------------------------- */
  static getSkills() {
    return duplicate(this.skills)
  }
  /*-------------------------------------------- */
  static getWeaponSkills() {
    return duplicate(this.weaponSkills)
  }
  /*-------------------------------------------- */
  static getShieldSkills() {
    return duplicate(this.shieldSkills)
  }

  /* -------------------------------------------- */
  static async ready() {
  }

  /* -------------------------------------------- */
  static async loadCompendiumData(compendium) {
    const pack = game.packs.get(compendium)
    return await pack?.getDocuments() ?? []
  }

  /* -------------------------------------------- */
  static async loadCompendium(compendium, filter = item => true) {
    let compendiumData = await WarheroUtility.loadCompendiumData(compendium)
    return compendiumData.filter(filter)
  }

  /* -------------------------------------------- */
  static isArmorLight(armor) {
    if (armor && (armor.system.armortype.includes("light") || armor.system.armortype.includes("clothes"))) {
      return true
    }
    return false
  }
  /* -------------------------------------------- */
  static isWeaponPenetrating(weapon) {
    if (weapon && weapon.system.qualities.toLowerCase().includes("penetrating")) {
      return true
    }
    return false
  }
  /* -------------------------------------------- */
  static isWeaponLight(weapon) {
    if (weapon && weapon.system.qualities.toLowerCase().includes("light")) {
      return true
    }
    return false
  }
  /* -------------------------------------------- */
  static isWeaponHeavy(weapon) {
    if (weapon && weapon.system.qualities.toLowerCase().includes("heavy")) {
      return true
    }
    return false
  }
  /* -------------------------------------------- */
  static isWeaponHack(weapon) {
    if (weapon && weapon.system.qualities.toLowerCase().includes("hack")) {
      return true
    }
    return false
  }
  /* -------------------------------------------- */
  static isWeaponUndamaging(weapon) {
    if (weapon && weapon.system.qualities.toLowerCase().includes("undamaging")) {
      return true
    }
    return false
  }
  /* -------------------------------------------- */
  static isWeaponDangerous(weapon) {
    if (weapon && weapon.system.qualities.toLowerCase().includes("dangerous")) {
      return true
    }
    return false
  }
  /* -------------------------------------------- */
  static isWeaponDeadly(weapon) {
    if (weapon && weapon.system.qualities.toLowerCase().includes("deadly")) {
      return true
    }
    return false
  }
  static getWeaponRange(weapon) {
    if (weapon && weapon.system.isranged) {
      let rangeValue = weapon.system.range.replace(/[^0-9]/g, '')
      return Number(rangeValue)
    }
    return false
  }
  static getWeaponMaxRange(weapon) {
    if (weapon && weapon.system.isranged) {
      let rangeValue = weapon.system.maxrange.replace(/[^0-9]/g, '')
      return Number(rangeValue)
    }
    return false
  }

  /* -------------------------------------------- */
  static async getRollTableFromDiceColor(diceColor, displayChat = true) {
    let rollTableName = __color2RollTable[diceColor]
    if (rollTableName) {
      const pack = game.packs.get("fvtt-warhero.rolltables")
      const index = await pack.getIndex()
      const entry = index.find(e => e.name === rollTableName)
      let table = await pack.getDocument(entry._id)
      const draw = await table.draw({ displayChat: displayChat, rollMode: "gmroll" })
      return draw.results.length > 0 ? draw.results[0] : undefined
    }
  }
  /* -------------------------------------------- */
  static getSizeDice(sizeValue) {
    return __size2Dice[sizeValue]
  }

  /* -------------------------------------------- */
  static async getCritical(level, weapon) {
    const pack = game.packs.get("fvtt-warhero.rolltables")

    let tableName = "Crit " + level + " (" + this.upperFirst(weapon.system.damage) + ")"
    const index = await pack.getIndex()
    const entry = index.find(e => e.name === tableName)
    let table = await pack.getDocument(entry._id)
    const draw = await table.draw({ displayChat: false, rollMode: "gmroll" })
    return draw.results.length > 0 ? draw.results[0] : undefined
  }

  /* -------------------------------------------- */
  static async chatListeners(html) {

    html.on("click", '.view-item-from-chat', event => {
      game.system.crucible.creator.openItemView(event)
    })

  }

  /* -------------------------------------------- */
  static async preloadHandlebarsTemplates() {

    const templatePaths = [
      'systems/fvtt-warhero/templates/editor-notes-gm.html',
      'systems/fvtt-warhero/templates/partial-roll-select.html',
      'systems/fvtt-warhero/templates/partial-actor-stat-block.html',
      'systems/fvtt-warhero/templates/partial-actor-status.html',
      'systems/fvtt-warhero/templates/partial-options-abilities.html',
      'systems/fvtt-warhero/templates/partial-item-nav.html',
      'systems/fvtt-warhero/templates/partial-item-description.html',
      'systems/fvtt-warhero/templates/partial-item-common-equipment.html',
      'systems/fvtt-warhero/templates/partial-actor-equipment.html',
    ]
    return loadTemplates(templatePaths);
  }

  /* -------------------------------------------- */
  static removeChatMessageId(messageId) {
    if (messageId) {
      game.messages.get(messageId)?.delete();
    }
  }

  static findChatMessageId(current) {
    return WarheroUtility.getChatMessageId(WarheroUtility.findChatMessage(current));
  }

  static getChatMessageId(node) {
    return node?.attributes.getNamedItem('data-message-id')?.value;
  }

  static findChatMessage(current) {
    return WarheroUtility.findNodeMatching(current, it => it.classList.contains('chat-message') && it.attributes.getNamedItem('data-message-id'));
  }

  static findNodeMatching(current, predicate) {
    if (current) {
      if (predicate(current)) {
        return current;
      }
      return WarheroUtility.findNodeMatching(current.parentElement, predicate);
    }
    return undefined;
  }


  /* -------------------------------------------- */
  static createDirectOptionList(min, max) {
    let options = {};
    for (let i = min; i <= max; i++) {
      options[`${i}`] = `${i}`;
    }
    return options;
  }

  /* -------------------------------------------- */
  static buildListOptions(min, max) {
    let options = ""
    for (let i = min; i <= max; i++) {
      options += `<option value="${i}">${i}</option>`
    }
    return options;
  }

  /* -------------------------------------------- */
  static getTarget() {
    if (game.user.targets) {
      for (let target of game.user.targets) {
        return target
      }
    }
    return undefined
  }

  /* -------------------------------------------- */
  static updateRollData(rollData) {

    let id = rollData.rollId
    let oldRollData = this.rollDataStore[id] || {}
    let newRollData = mergeObject(oldRollData, rollData)
    this.rollDataStore[id] = newRollData
  }
  /* -------------------------------------------- */
  static saveRollData(rollData) {
    game.socket.emit("system.warhero-rpg", {
      name: "msg_update_roll", data: rollData
    }); // Notify all other clients of the roll    
    this.updateRollData(rollData)
  }

  /* -------------------------------------------- */
  static async displayDefenseMessage(rollData) {
    if (rollData.mode == "weapon" && rollData.defenderTokenId) {
      let defender = game.canvas.tokens.get(rollData.defenderTokenId).actor
      if (game.user.isGM || (game.user.character && game.user.character.id == defender.id)) {
        rollData.defender = defender
        rollData.defenderWeapons = defender.getEquippedWeapons()
        rollData.isRangedAttack = rollData.weapon?.system.isranged
        this.createChatWithRollMode(defender.name, {
          name: defender.name,
          alias: defender.name,
          //user: defender.id,
          content: await renderTemplate(`systems/fvtt-warhero/templates/chat-request-defense.html`, rollData),
          whisper: [defender.id].concat(ChatMessage.getWhisperRecipients('GM')),
        })
      }
    }
  }

  /* -------------------------------------------- */
  static getSuccessResult(rollData) {
    if (rollData.sumSuccess <= -3) {
      if (rollData.attackRollData.weapon.system.isranged) {
        return { result: "miss", fumble: true, hpLossType: "melee" }
      } else {
        return { result: "miss", fumble: true, attackerHPLoss: "2d3", hpLossType: "melee" }
      }
    }
    if (rollData.sumSuccess == -2) {
      if (rollData.attackRollData.weapon.system.isranged) {
        return { result: "miss", dangerous_fumble: true }
      } else {
        return { result: "miss", dangerous_fumble: true, attackerHPLoss: "1d3", hpLossType: "melee" }
      }
    }
    if (rollData.sumSuccess == -1) {
      return { result: "miss" }
    }
    if (rollData.sumSuccess == 0) {
      if (rollData.attackRollData.weapon.system.isranged) {
        return { result: "target_space", aoe: true }
      } else {
        return { result: "clash", hack_vs_shields: true }
      }
    }
    if (rollData.sumSuccess == 1) {
      return { result: "hit", defenderDamage: "1", entangle: true, knockback: true }
    }
    if (rollData.sumSuccess == 2) {
      return { result: "hit", defenderDamage: "2", critical_1: true, entangle: true, knockback: true, penetrating_impale: true, hack_armors: true }
    }
    if (rollData.sumSuccess >= 3) {
      return { result: "hit", defenderDamage: "3", critical_2: true, entangle: true, knockback: true, penetrating_impale: true, hack_armors: true }
    }
  }

  /* -------------------------------------------- */
  static async getFumble(weapon) {
    const pack = game.packs.get("fvtt-warhero.rolltables")
    const index = await pack.getIndex()
    let entry

    if (weapon.isranged) {
      entry = index.find(e => e.name === "Fumble! (ranged)")
    }
    if (!weapon.isranged) {
      entry = index.find(e => e.name === "Fumble! (melee)")
    }
    let table = await pack.getDocument(entry._id)
    const draw = await table.draw({ displayChat: false, rollMode: "gmroll" })
    return draw.results.length > 0 ? draw.results[0] : undefined
  }

  /* -------------------------------------------- */
  static async processSuccessResult(rollData) {
    if (game.user.isGM) { // Only GM process this
      let result = rollData.successDetails
      let attacker = game.actors.get(rollData.actorId)
      let defender = game.canvas.tokens.get(rollData.attackRollData.defenderTokenId).actor

      if (attacker && result.attackerHPLoss) {
        result.attackerHPLossValue = await attacker.incDecHP("-" + result.attackerHPLoss)
      }
      if (attacker && defender && result.defenderDamage) {
        let dmgDice = (rollData.attackRollData.weapon.system.isranged) ? "d6" : "d8"
        result.damageWeaponFormula = result.defenderDamage + dmgDice
        result.defenderHPLossValue = await defender.incDecHP("-" + result.damageWeaponFormula)
      }
      if (result.fumble || (result.dangerous_fumble && WarheroUtility.isWeaponDangerous(rollData.attackRollData.weapon))) {
        result.fumbleDetails = await this.getFumble(rollData.weapon)
      }
      if (result.critical_1 || result.critical_2) {
        let isDeadly = WarheroUtility.isWeaponDeadly(rollData.attackRollData.weapon)
        result.critical = await this.getCritical((result.critical_1) ? "I" : "II", rollData.attackRollData.weapon)
        result.criticalText = result.critical.text
      }
      this.createChatWithRollMode(rollData.alias, {
        content: await renderTemplate(`systems/fvtt-warhero/templates/chat-attack-defense-result.html`, rollData)
      })
      console.log("Results processed", rollData)
    }
  }

  /* -------------------------------------------- */
  static async processAttackDefense(rollData) {
    if (rollData.attackRollData) {
      //console.log("Defender token, ", rollData, rollData.defenderTokenId)
      let defender = game.canvas.tokens.get(rollData.attackRollData.defenderTokenId).actor
      let sumSuccess = rollData.attackRollData.nbSuccess - rollData.nbSuccess
      if (sumSuccess > 0) {
        let armorResult = await defender.rollArmorDie(rollData)
        rollData.armorResult = armorResult
        sumSuccess += rollData.armorResult.nbSuccess
        if (sumSuccess < 0) { // Never below 0
          sumSuccess = 0
        }
      }
      rollData.sumSuccess = sumSuccess
      rollData.successDetails = this.getSuccessResult(rollData)
      if (game.user.isGM) {
        this.processSuccessResult(rollData)
      } else {
        game.socket.emit("system.fvtt-warhero", { msg: "msg_gm_process_attack_defense", data: rollData });
      }
    }
  }

  /* -------------------------------------------- */
  static async onSocketMesssage(msg) {
    console.log("SOCKET MESSAGE", msg.name)
    if (msg.name == "msg_update_roll") {
      this.updateRollData(msg.data)
    }
    if (msg.name == "msg_gm_process_attack_defense") {
      this.processSuccessResult(msg.data)
    }
    if (msg.name == "msg_gm_item_drop" && game.user.isGM) {
      let actor = game.actors.get(msg.data.actorId)
      let item
      if (msg.data.isPack) {
        item = await fromUuid("Compendium." + msg.data.isPack + "." + msg.data.itemId)
      } else {
        item = game.items.get(msg.data.itemId)
      }
      this.addItemDropToActor(actor, item)
    }
  }

  /* -------------------------------------------- */
  static chatDataSetup(content, modeOverride, isRoll = false, forceWhisper) {
    let chatData = {
      user: game.user.id,
      rollMode: modeOverride || game.settings.get("core", "rollMode"),
      content: content
    };

    if (["gmroll", "blindroll"].includes(chatData.rollMode)) chatData["whisper"] = ChatMessage.getWhisperRecipients("GM").map(u => u.id);
    if (chatData.rollMode === "blindroll") chatData["blind"] = true;
    else if (chatData.rollMode === "selfroll") chatData["whisper"] = [game.user];

    if (forceWhisper) { // Final force !
      chatData["speaker"] = ChatMessage.getSpeaker();
      chatData["whisper"] = ChatMessage.getWhisperRecipients(forceWhisper);
    }

    return chatData;
  }

  /* -------------------------------------------- */
  static async showDiceSoNice(roll, rollMode) {
    if (game.modules.get("dice-so-nice")?.active) {
      if (game.dice3d) {
        let whisper = null;
        let blind = false;
        rollMode = rollMode ?? game.settings.get("core", "rollMode");
        switch (rollMode) {
          case "blindroll": //GM only
            blind = true;
          case "gmroll": //GM + rolling player
            whisper = this.getUsers(user => user.isGM);
            break;
          case "roll": //everybody
            whisper = this.getUsers(user => user.active);
            break;
          case "selfroll":
            whisper = [game.user.id];
            break;
        }
        await game.dice3d.showForRoll(roll, game.user, true, whisper, blind);
      }
    }
  }

  /* -------------------------------------------- */
  static getDiceFromCover(cover) {
    if (cover == "cover50") return 1
    return 0
  }
  /* -------------------------------------------- */
  static getDiceFromSituational(cover) {
    if (cover == "prone") return 1
    if (cover == "dodge") return 1
    if (cover == "moving") return 1
    if (cover == "engaged") return 1
    return 0
  }
  /* -------------------------------------------- */
  static async rollParry(rollData) {
    let actor = game.actors.get(rollData.actorId)
    // ability/save/size => 0
    let diceFormula = "1d12+" + rollData.stat.value
    let myRoll = rollData.roll
    if (!myRoll) { // New rolls only of no rerolls
      myRoll = new Roll(diceFormula).roll({ async: false })
      await this.showDiceSoNice(myRoll, game.settings.get("core", "rollMode"))
    }
    rollData.roll = myRoll
    rollData.isSuccess = false
    if (myRoll.total >= 12 || myRoll.terms[0].results[0].result == 12) {
      rollData.isSuccess = true
    }
    if (myRoll.terms[0].results[0].result == 1) {
      rollData.isSuccess = false
    }
    let msg = await this.createChatWithRollMode(rollData.alias, {
      content: await renderTemplate(`systems/fvtt-warhero/templates/chat-parry-result.html`, rollData)
    })
    msg.setFlag("world", "rolldata", rollData)
    console.log("Rolldata result", rollData)
  }

  /* -------------------------------------------- */
  static async rollWarhero(rollData) {

    let actor = game.actors.get(rollData.actorId)

    if ( rollData.mode == "power") {
      let manaCost = Array.from(rollData.powerLevel)[0]
      if( actor.spentMana(manaCost)) {
        let powerKey  = "level"+rollData.powerLevel
        rollData.powerText = rollData.power.system[powerKey]
        let msg = await this.createChatWithRollMode(rollData.alias, {
          content: await renderTemplate(`systems/fvtt-warhero/templates/chat-generic-result.html`, rollData)
        })
        msg.setFlag("world", "rolldata", rollData)
      }
      return
    }
    if ( rollData.mode == "damage") {
      let myRoll = new Roll(rollData.weapon.damageFormula + "+" + rollData.bonusMalus).roll({ async: false })
      await this.showDiceSoNice(myRoll, game.settings.get("core", "rollMode"))
      rollData.roll = myRoll
  
      let msg = await this.createChatWithRollMode(rollData.alias, {
        content: await renderTemplate(`systems/fvtt-warhero/templates/chat-generic-result.html`, rollData)
      })
      msg.setFlag("world", "rolldata", rollData)
      return
    }

    // ability/save/size => 0
    let diceFormula = "1d20"
    if ( rollData.stat) {
      diceFormula += "+" + rollData.stat.value
    }
    if ( rollData.usemWeaponMalus) {
      diceFormula += "+" + rollData.mWeaponMalus
    }
    diceFormula += "+" + rollData.bonusMalus
    rollData.diceFormula = diceFormula

    // Performs roll
    console.log("Roll formula", diceFormula)
    let myRoll = rollData.roll
    if (!myRoll) { // New rolls only of no rerolls
      myRoll = new Roll(diceFormula).roll({ async: false })
      await this.showDiceSoNice(myRoll, game.settings.get("core", "rollMode"))
    }
    rollData.roll = myRoll

    let msg = await this.createChatWithRollMode(rollData.alias, {
      content: await renderTemplate(`systems/fvtt-warhero/templates/chat-generic-result.html`, rollData)
    })
    msg.setFlag("world", "rolldata", rollData)
    console.log("Rolldata result", rollData)

  }

  /* -------------------------------------------- */
  static sortArrayObjectsByName(myArray) {
    myArray.sort((a, b) => {
      let fa = a.name.toLowerCase();
      let fb = b.name.toLowerCase();
      if (fa < fb) {
        return -1;
      }
      if (fa > fb) {
        return 1;
      }
      return 0;
    })
  }

  /* -------------------------------------------- */
  static getUsers(filter) {
    return game.users.filter(filter).map(user => user.id);
  }
  /* -------------------------------------------- */
  static getWhisperRecipients(rollMode, name) {
    switch (rollMode) {
      case "blindroll": return this.getUsers(user => user.isGM);
      case "gmroll": return this.getWhisperRecipientsAndGMs(name);
      case "selfroll": return [game.user.id];
    }
    return undefined;
  }
  /* -------------------------------------------- */
  static getWhisperRecipientsAndGMs(name) {
    let recep1 = ChatMessage.getWhisperRecipients(name) || [];
    return recep1.concat(ChatMessage.getWhisperRecipients('GM'));
  }

  /* -------------------------------------------- */
  static blindMessageToGM(chatOptions) {
    let chatGM = duplicate(chatOptions);
    chatGM.whisper = this.getUsers(user => user.isGM);
    chatGM.content = "Blinde message of " + game.user.name + "<br>" + chatOptions.content;
    console.log("blindMessageToGM", chatGM);
    game.socket.emit("system.fvtt-warhero", { msg: "msg_gm_chat_message", data: chatGM });
  }


  /* -------------------------------------------- */
  static async searchItem(dataItem) {
    let item
    if (dataItem.pack) {
      item = await fromUuid("Compendium." + dataItem.pack + "." + dataItem.id)
    } else {
      item = game.items.get(dataItem.id)
    }
    return item
  }

  /* -------------------------------------------- */
  static split3Columns(data) {

    let array = [[], [], []];
    if (data == undefined) return array;

    let col = 0;
    for (let key in data) {
      let keyword = data[key];
      keyword.key = key; // Self-reference
      array[col].push(keyword);
      col++;
      if (col == 3) col = 0;
    }
    return array;
  }

  /* -------------------------------------------- */
  static createChatMessage(name, rollMode, chatOptions) {
    switch (rollMode) {
      case "blindroll": // GM only
        if (!game.user.isGM) {
          this.blindMessageToGM(chatOptions);

          chatOptions.whisper = [game.user.id];
          chatOptions.content = "Message only to the GM";
        }
        else {
          chatOptions.whisper = this.getUsers(user => user.isGM);
        }
        break;
      default:
        chatOptions.whisper = this.getWhisperRecipients(rollMode, name);
        break;
    }
    chatOptions.alias = chatOptions.alias || name;
    return ChatMessage.create(chatOptions);
  }

  /* -------------------------------------------- */
  static getBasicRollData() {
    let rollData = {
      rollId: randomID(16),
      rollMode: game.settings.get("core", "rollMode"),
      advantage: "none",
      bonusMalus: 0,
      powerLevel: "1",
      hasBM: true
    }
    WarheroUtility.updateWithTarget(rollData)
    return rollData
  }

  /* -------------------------------------------- */
  static updateWithTarget(rollData) {
    let target = WarheroUtility.getTarget()
    if (target) {
      rollData.defenderTokenId = target.id
    }
  }

  /* -------------------------------------------- */
  static async createChatWithRollMode(name, chatOptions) {
    return this.createChatMessage(name, game.settings.get("core", "rollMode"), chatOptions)
  }

  /* -------------------------------------------- */
  static async confirmDelete(actorSheet, li) {
    let itemId = li.data("item-id");
    let msgTxt = "<p>Are you sure to remove this Item ?";
    let buttons = {
      delete: {
        icon: '<i class="fas fa-check"></i>',
        label: "Yes, remove it",
        callback: () => {
          actorSheet.actor.deleteEmbeddedDocuments("Item", [itemId]);
          li.slideUp(200, () => actorSheet.render(false));
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: "Cancel"
      }
    }
    msgTxt += "</p>";
    let d = new Dialog({
      title: "Confirm removal",
      content: msgTxt,
      buttons: buttons,
      default: "cancel"
    });
    d.render(true);
  }

}