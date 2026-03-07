import { WARHERO_CONFIG } from "./warhero-config.js";

/* -------------------------------------------- */
export class WarheroUtility {

  static async ready() {
    console.log("WarheroUtility.ready() called");
  }

  /* -------------------------------------------- */
  static async init() {

    this.rollDataStore = {}

   Handlebars.registerHelper('concat', function () {
      var outStr = '';
      for (var arg in arguments) {
        if (typeof arguments[arg] != 'object') {
          outStr += arguments[arg];
        }
      }
      return outStr;
    });
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
    Handlebars.registerHelper('join', function (array, separator) {
      if (!Array.isArray(array)) return '';
      if (typeof separator !== 'string') separator = ', ';
      return array.join(separator);
    })

  }

  /*--------------------- ----------------------- */
  static getActorStats() {
    return foundry.utils.duplicate(WARHERO_CONFIG.statList)
  }
  /*--------------------- ----------------------- */
  static upperFirst(text) {
    if (typeof text !== 'string') return text
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  /*-------------------------------------------- */
  static getSkills() {
    return foundry.utils.duplicate(this.skills)
  }
  /*-------------------------------------------- */
  static getWeaponSkills() {
    return foundry.utils.duplicate(this.weaponSkills)
  }
  /*-------------------------------------------- */
  static getShieldSkills() {
    return foundry.utils.duplicate(this.shieldSkills)
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
  static async preloadHandlebarsTemplates() {

    const templatePaths = [
      'systems/fvtt-warhero/templates/editor-notes-gm.html',
      'systems/fvtt-warhero/templates/actors/partial-actor-stat-block.hbs',
      'systems/fvtt-warhero/templates/actors/partial-actor-equipment.hbs',
      'systems/fvtt-warhero/templates/actors/partial-container.hbs',
      'systems/fvtt-warhero/templates/items/partial-item-description.hbs',
      'systems/fvtt-warhero/templates/items/partial-item-equipment-details.hbs',
      'systems/fvtt-warhero/templates/items/partial-item-common-equipment.hbs',
      'systems/fvtt-warhero/templates/items/partial-item-shield-details.hbs',
    ]
    return foundry.applications.handlebars.loadTemplates(templatePaths);
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
    let newRollData = foundry.utils.mergeObject(oldRollData, rollData)
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

  static async rollParry(rollData) {
    let actor = game.actors.get(rollData.actorId)
    let diceFormula = "1d12+" + rollData.stat.value
    let myRoll = rollData.roll
    if (!myRoll) { // New rolls only of no rerolls
      myRoll = await new Roll(diceFormula).roll()
      await this.showDiceSoNice(myRoll, game.settings.get("core", "rollMode"))
    }
    rollData.roll = myRoll
    rollData.diceFormula = diceFormula
    rollData.diceResult = myRoll.terms[0].results[0].result
    rollData.isSuccess = false
    if (myRoll.total >= 12 || rollData.diceResult == 12) {
      rollData.isSuccess = true
      if (rollData.diceResult == 12) {
        rollData.isCriticalSuccess = true
      }
    }
    if (rollData.diceResult == 1) {
      rollData.isSuccess = false
      rollData.isCriticalFailure = true
    }
    let msg = await this.createChatWithRollMode(rollData.alias, {
      content: await renderTemplate(`systems/fvtt-warhero/templates/chat-parry-result.html`, rollData)
    })
    msg.setFlag("world", "rolldata", rollData)
    console.log("Rolldata result", rollData)
  }

  static async rollWarhero(rollData) {

    let actor = game.actors.get(rollData.actorId)

    if (rollData.mode == "power") {
      let manaCost = rollData.powerLevel
      if (actor.spentMana(manaCost)) {
        let powerKey = "level" + rollData.powerLevel
        rollData.powerText = rollData.power.system[powerKey]
        // If teleport power and location selected, get location name
        if (rollData.power.system.isteleport && rollData.selectedLocation) {
          let location = actor.items.find(it => it.id === rollData.selectedLocation)
          if (location) {
            rollData.locationName = location.name
          }
        }
        let msg = await this.createChatWithRollMode(rollData.alias, {
          content: await foundry.applications.handlebars.renderTemplate(`systems/fvtt-warhero/templates/chat-generic-result.html`, rollData)
        })
        msg.setFlag("world", "rolldata", rollData)
      }
      return
    }
    if (rollData.mode == "damage") {
      let formula
      if (rollData.weapon.system.weapontype == "special") {
        formula = rollData.weapon.system.damageformula
      } else {
        formula = (rollData.is2hands) ? rollData.weapon.damageFormula2Hands : rollData.weapon.damageFormula
      }
      let myRoll = await new Roll(formula + "+" + rollData.bonusMalus, actor.system).roll()
      await this.showDiceSoNice(myRoll, game.settings.get("core", "rollMode"))
      rollData.roll = myRoll
      rollData.diceFormula = myRoll.formula
      rollData.diceResult = myRoll.terms[0].results[0].result

      let msg = await this.createChatWithRollMode(rollData.alias, {
        content: await foundry.applications.handlebars.renderTemplate(`systems/fvtt-warhero/templates/chat-generic-result.html`, rollData)
      })
      msg.setFlag("world", "rolldata", rollData)
      return
    }

    let diceFormula
    if (rollData.weapon && rollData.weapon.system.weapontype == "special") {
      diceFormula = rollData.weapon.system.rollformula
    } else {
      // ability/save/size => 0
      diceFormula = "1d20"
      if (rollData.stat) {
        diceFormula += "+" + rollData.stat.value
      }
      if (rollData.statBonus) {
        diceFormula += "+" + rollData.statBonus.value
      }
    }
    if (rollData.usemWeaponMalus) {
      diceFormula += "+" + rollData.mWeaponMalus
    }
    diceFormula += "+" + rollData.bonusMalus

    // Performs roll
    console.log("Roll formula", diceFormula)
    let myRoll = rollData.roll
    if (!myRoll) { // New rolls only of no rerolls
      myRoll = await new Roll(diceFormula, actor.system).roll()
      await this.showDiceSoNice(myRoll, game.settings.get("core", "rollMode"))
    }
    rollData.roll = myRoll
    rollData.diceFormula = diceFormula
    rollData.diceResult = myRoll.terms[0].results[0].result
    if (rollData.diceResult == 20) {
      rollData.isCriticalSuccess = true
    }
    if (rollData.diceResult == 1) {
      rollData.isCriticalFailure = true
    }

    if (rollData.stat.hasuse) {
      actor.incrementUse(rollData)
    }

    let msg = await this.createChatWithRollMode(rollData.alias, {
      content: await foundry.applications.handlebars.renderTemplate(`systems/fvtt-warhero/templates/chat-generic-result.html`, rollData)
    })
    await msg.setFlag("world", "rolldata", rollData)
    console.log("Rolldata result", rollData)

  }

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
  static sortArrayObjectsByNameAndLevel(myArray) {
    myArray.sort((a, b) => {
      let fa = a.system.level + a.name.toLowerCase();
      let fb = b.system.level + b.name.toLowerCase();
      if (fa < fb) {
        return -1;
      }
      if (fa > fb) {
        return 1;
      }
      return 0;
    })
  }
  static sortArrayObjectsByNameAndLevelAcquired(myArray) {
    myArray.sort((a, b) => {
      let fa = a.system.acquiredatlevel + a.name.toLowerCase();
      let fb = b.system.acquiredatlevel + b.name.toLowerCase();
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
  static createChatMessage(name, rollMode, chatOptions) {
    switch (rollMode) {
      case "blindroll": // GM only
        if (!game.user.isGM) {
          this.blindMessageToGM(chatOptions);
          chatOptions.whisper = [game.user.id];
          chatOptions.content = "Message only to the GM";
        } else {
          chatOptions.whisper = ChatMessage.getWhisperRecipients("GM");
        }
        break;
      case "gmroll":
        chatOptions.whisper = ChatMessage.getWhisperRecipients("GM");
        break;
      case "selfroll":
        chatOptions.whisper = [game.user.id];
        break;
      default:
        chatOptions.whisper = undefined;
        break;
    }
    chatOptions.alias = chatOptions.alias || name;
    return ChatMessage.create(chatOptions);
  }
  

  /* -------------------------------------------- */
  static getBasicRollData() {
    let rollData = {
      rollId: foundry.utils.randomID(16),
      rollMode: game.settings.get("core", "rollMode"),
      advantage: "none",
      bonusMalus: 0,
      powerLevel: "1",
      hasBM: true,
      config: game.system.warhero.config
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
  static async confirmDelete(actorSheet, li, itemType) {
    let itemId = li.data("item-id");
    let msgTxt = `<p>Are you sure to remove this ${itemType}?</p>`;
    new Dialog({
      title: "Confirm removal",
      content: msgTxt,
      buttons: {
        yes: {
          label: "Yes, remove it",
          icon: '<i class="fas fa-check"></i>',
          callback: () => {
            actorSheet.actor.deleteEmbeddedDocuments(itemType, [itemId]);
            li.slideUp(200, () => actorSheet.render(false));
          }
        },
        no: {
          label: "Cancel",
          icon: '<i class="fas fa-times"></i>'
        }
      }
    }).render(true);
  }

  /* -------------------------------------------- */
  static prepareActiveEffect(effectId) {
    let status = CONFIG.ACKS.statusEffects.find((it) => it.id.includes(effectId));
    if (status) {
      status = foundry.utils.duplicate(status);
      status.statuses = [effectId];
    }
    return status;
  }

  /* -------------------------------------------- */
  static addUniqueStatus(actor, statusId) {
    let status = actor.effects.find((it) => it.statuses.has(statusId));
    if (!status) {
      let effect = this.prepareActiveEffect(statusId);
      actor.createEmbeddedDocuments("ActiveEffect", [effect]);
    }
  }

  /* -------------------------------------------- */
  static async removeEffect(actor, statusId) {
    let effect = actor.effects.find((it) => it.statuses.has(statusId));
    if (effect) {
      await actor.deleteEmbeddedDocuments("ActiveEffect", [effect.id]);
    }
  }

  /* -------------------------------------------- */
  static async prepareActiveEffectCategories(effects) {
    // Define effect header categories
    const categories = {
      temporary: {
        type: "temporary",
        label: game.i18n.localize("WH.ui.Temporary"),
        effects: [],
      },
      passive: {
        type: "passive",
        label: game.i18n.localize("WH.ui.Passive"),
        effects: [],
      },
      inactive: {
        type: "inactive",
        label: game.i18n.localize("WH.ui.Inactive"),
        effects: [],
      },
    };

    // Iterate over active effects, classifying them into categories
    for (let e of effects) {
      e.updateDuration();
      if (e.disabled) categories.inactive.effects.push(e);
      else if (e.isTemporary) categories.temporary.effects.push(e);
      else categories.passive.effects.push(e);
    }
    return categories;
  }

  /* -------------------------------------------- */
  static async onManageActiveEffect(event, owner) {
    event.preventDefault();
    const a = event.currentTarget;
    const li = a.closest("li");
    let effect = li.dataset.effectId ? owner.effects.get(li.dataset.effectId) : null;
    switch (a.dataset.action) {
      case "create":
        effect = await ActiveEffect.implementation.create(
          {
            name: game.i18n.format("DOCUMENT.New", { type: game.i18n.localize("DOCUMENT.ActiveEffect") }),
            transfer: true,
            img: "icons/svg/aura.svg",
            origin: owner.uuid,
            "duration.rounds": li.dataset.effectType === "temporary" ? 1 : undefined,
            disabled: li.dataset.effectType === "inactive",
            changes: [{}],
          },
          { parent: owner },
        );
        return effect.sheet.render(true);
      case "edit":
        return effect.sheet.render(true);
      case "delete":
        return effect.delete();
      case "toggle":
        return effect.update({ disabled: !effect.disabled });
    }
  }
}