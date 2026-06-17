/* -------------------------------------------- */
import { WarheroUtility } from "./warhero-utility.js";

/* -------------------------------------------- */
/* -------------------------------------------- */
/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class WarheroActor extends Actor {

  /* -------------------------------------------- */
  /**
   * Override the create() function to provide additional SoS functionality.
   *
   * This overrided create() function adds initial items
   * Namely: Basic skills, money,
   *
   * @param {Object} data        Barebones actor data which this function adds onto.
   * @param {Object} options     (Unused) Additional options which customize the creation workflow.
   *
   */

  static async create(data, options) {

    // Case of compendium global import
    if (data instanceof Array) {
      return super.create(data, options);
    }
    // If the created actor has items (only applicable to duplicated actors) bypass the new actor creation logic
    if (data.items) {
      let actor = super.create(data, options);
      return actor;
    }
    data.img = data?.img || "systems/fvtt-warhero/images/icons/cowled.svg";

    // If the created actor is a character, add initial skills from compendium
    if (data.type == 'character') {
      const skills = await WarheroUtility.loadCompendium("fvtt-warhero.skills");
      data.items = skills.map(i => i.toObject())
    }

    return super.create(data, options);
  }

   /* -------------------------------------------- */
  /**
   * Override prepareData to reset the system to _source before the
   * standard prepare chain. This prevents ActiveEffect compounding
   * because Actor.prepareBaseData() → _clearData() clears the
   * _completedActiveEffectPhases Set, which would allow effects to
   * be re-applied on every call. Resetting from _source ensures
   * effects always start from the same baseline.
   */
  prepareData() {
    this.system.reset();
    super.prepareData();
  }

   /* -------------------------------------------- */
  /**
   * Override to apply "initial" ActiveEffects before embedded documents
   * prepare. This ensures items (e.g. skills computing maxuse from rolls)
   * see post-effects stat values. Actor.prepareEmbeddedDocuments() applies
   * effects AFTER super, which results in a harmless-but-noisy error when
   * "initial" is called a second time, so we call the grandparent
   * (ClientDocumentMixin) directly.
   */
  prepareEmbeddedDocuments() {
    this.applyActiveEffects("initial");
    const grandparent = Object.getPrototypeOf(Actor.prototype);
    grandparent.prepareEmbeddedDocuments.call(this);
  }

   /* -------------------------------------------- */
  /**
   * Prepara i dati derivati dell'attore. Non deve mai chiamare this.update()!
   * Tutti i campi calcolati vanno assegnati direttamente a this.system.*
   */
  prepareDerivedData() {
    super.prepareDerivedData();

    // Solo per personaggi o GM
    if (this.type == 'character' || game.user.isGM) {
      this.setLevel();
      this.computeDRTotal();
      this.computeParryBonusTotal();
    }

    // Chiamata DOPO che tutti i dati sono stati preparati
    if (this.type == 'character' || game.user.isGM) {
      this.computeBonusLanguages();
    }


  }

  /* -------------------------------------------- */
  _preUpdate(changed, options, user) {
    if (changed.system) {
      const additiveChanges = new Map();
      for (const effect of this.allApplicableEffects()) {
        if (effect.disabled) continue;
        for (const change of effect.changes) {
          if (!change.key.startsWith('system.')) continue;
          const changeType = change.type ?? WarheroActor.#modeToType(change.mode);
          if (changeType !== 'add') continue;
          const value = Number(change.value);
          if (!Number.isFinite(value)) continue;
          const path = change.key;
          const prev = additiveChanges.get(path) ?? 0;
          additiveChanges.set(path, prev + value);
        }
      }
      const computedPaths = new Set(["system.attributes.hp.max", "system.attributes.mana.max", "system.attributes.def.value", "system.attributes.def.max"]);
      for (const [path, delta] of additiveChanges) {
        if (delta === 0) continue;
        if (computedPaths.has(path)) continue;
        const docPath = path.slice(7);
        const submitted = foundry.utils.getProperty(changed.system, docPath);
        if (submitted !== undefined) {
          foundry.utils.setProperty(changed.system, docPath, Number(submitted) - delta);
        }
      }
    }
    return super._preUpdate(changed, options, user);
  }

  static #modeToType(mode) {
    return mode === undefined ? undefined
      : mode === 0 ? "custom" : mode === 1 ? "multiply" : mode === 2 ? "add"
      : mode === 3 ? "downgrade" : mode === 4 ? "upgrade" : mode === 5 ? "override"
      : `custom.${mode}`;
  }

  /* -------------------------------------------- */
  getMoneys() {
    let comp = this.items.filter(item => item.type == 'money');
    WarheroUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  /* -------------------------------------------- */
  getEquippedArmors() {
    let comp = foundry.utils.deepClone(this.items.filter(item => item.type == 'armor' && item.system.slotlocation == 'armor') || []);
    WarheroUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  getArmors() {
    let comp = foundry.utils.deepClone(this.items.filter(item => item.type == 'armor') || []);
    WarheroUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  getPowers() {
    let comp = foundry.utils.deepClone(this.items.filter(item => item.type == 'power') || []);
    WarheroUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  sortPowers() {
    let schools = {}
    for (let power of this.items) {
      if (power.type == "power") {
        power = foundry.utils.deepClone(power)
        let school = schools[power.system.magicschool] || []
        school.push(power)
        WarheroUtility.sortArrayObjectsByNameAndLevel(school)
        schools[power.system.magicschool] = school
      }
    }
    return schools
  }
  getAllItems() {
    let comp = Array.from(this.items);
    WarheroUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  /* -------------------------------------------- */
  getEquippedShields() {
    let comp = foundry.utils.deepClone(this.items.filter(item => item.type == 'shield' && item.system.slotlocation == "shield") || []);
    WarheroUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  getShields() {
    let comp = foundry.utils.deepClone(this.items.filter(item => item.type == 'shield') || []);
    WarheroUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  /* -------------------------------------------- */
  getRace() {
    let race = this.items.filter(item => item.type == 'race')
    return race[0] ?? null;
  }
  /* -------------------------------------------- */
  getMainClass() {
    let classWH = this.items.find(item => item.type == 'class' && !item.system.issecondary)
    return classWH
  }
  getSecondaryClass() {
    let classWH = this.items.find(item => item.type == 'class' && item.system.issecondary)
    return classWH
  }
  getClasses() {
    let comp = foundry.utils.deepClone(this.items.filter(item => item.type == "class") || []);
    WarheroUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  getLocations() {
    let comp = foundry.utils.deepClone(this.items.filter(item => item.type == 'location') || []);
    // Add a class option when the number of locations is more that "mind" statistics
    for (let i = 0; i < comp.length; i++) {
      let c = comp[i]
      if (i >= this.system.statistics?.min?.value) {
        c.class = "warhero-location-overflow"
      }
    }
    WarheroUtility.sortArrayObjectsByName(comp)
    return comp;
  }

  /* -------------------------------------------- */
  computeTotalMoney() {
    let nbMoney = 0
    this.items.forEach(it => { if (it.type == 'money') { nbMoney += it.system.quantity } })
    return nbMoney
  }

  async computeMembersTotalMoney() {
    if (this.type !== 'party') return 0
    let members = this.system.biodata?.members
    if (!members) return 0
    if (typeof members === 'string') {
      try {
        members = JSON.parse(members) || []
      } catch {
        members = []
      }
    }
    if (!Array.isArray(members)) members = []

    const sums = await Promise.all(members.map(async (member) => {
      const actor = member?.uuid ? await fromUuid(member.uuid).catch(() => null) : null
      return actor?.computeTotalMoney?.() || 0
    }))
    return sums.reduce((total, value) => total + value, 0)
  }

  /* -------------------------------------------- */
  buildPartySlots() {
    let containers = {}
    for (let slotName in game.system.warhero.config.partySlotNames) {
      let slotDef = game.system.warhero.config.partySlotNames[slotName]
      containers[slotName] = foundry.utils.deepClone(slotDef)
      containers[slotName].content = this.items.filter(it => (it.type == 'money' || it.type == 'weapon' || it.type == 'armor' || it.type == 'shield' || it.type == 'equipment' || it.type == 'potion' || it.type == 'poison' || it.type == 'trap' || it.type == 'classitem'))
      let slotUsed = 0
      for (let item of containers[slotName].content) {
        let q = (item.system.quantity) ? item.system.quantity : 1
        containers[slotName].nbslots += (item.system.providedslot ?? 0) * q
        if (item.type == "money") {
          slotUsed += Math.ceil(item.system.quantity / 1000)
        } else {
          slotUsed += item.system.slotused * q
        }
      }
      // Keep 2 digits
      slotUsed = Math.ceil(slotUsed * 100) / 100;
      containers[slotName].slotUsed = slotUsed;
    }
    return containers
  }

  /* -------------------------------------------- */
  buildBodySlot() {
    let containers = {}
    for (let slotName in game.system.warhero.config.slotNames) {
      let slotDef = game.system.warhero.config.slotNames[slotName]
      if (!slotDef.container) {
        containers[slotName] = foundry.utils.deepClone(slotDef)
        containers[slotName].content = this.items.filter(it => (it.type == 'money' || it.type == 'weapon' || it.type == 'armor' || it.type == 'shield' || it.type == 'equipment' || it.type == 'potion' || it.type == 'poison' || it.type == 'trap' || it.type == 'classitem')
          && it.system.slotlocation == slotName)
        // Manage specific shields case : merge shield with weapon2
        if (slotName == "weapon2") {
          containers[slotName].content = containers[slotName].content.concat(this.items.filter(it => it.type == 'shield' && it.system.slotlocation == "shield"))
        }
        if (slotName == "shield") {
          containers[slotName].content = containers[slotName].content.concat(this.items.filter(it => it.type == 'shield' && (it.system.slotlocation == "weapon1" || it.system.slotlocation == "weapon2")))
        }
        let slotUsed = 0
        for (let item of containers[slotName].content) {
          let q = (item.system.quantity) ? item.system.quantity : 1
          containers[slotName].nbslots += (item.system.providedslot ?? 0) * q
          if (item.type == "money") {
            slotUsed += Math.ceil(item.system.quantity / 1000)
          } else {
            slotUsed += item.system.slotused * q
          }
        }
        slotUsed = Math.ceil(slotUsed * 100) / 100;
        containers[slotName].slotUsed = slotUsed
      }
    }
    return containers
  }

  /* -------------------------------------------- */
  buildEquipmentsSlot() {
    let containers = {}
    for (let slotName in game.system.warhero.config.slotNames) {
      let slotDef = game.system.warhero.config.slotNames[slotName]
      if (slotDef.container) {
        containers[slotName] = foundry.utils.deepClone(slotDef)
        containers[slotName].content = this.items.filter(it => (it.type == 'money' || it.type == 'weapon' || it.type == 'armor' || it.type == 'shield' || it.type == 'equipment' || it.type == 'potion' || it.type == 'poison' || it.type == 'trap' || it.type == 'classitem')
          && it.system.slotlocation == slotName)
        let slotUsed = 0
        for (let item of containers[slotName].content) {
          let q = (item.system.quantity) ? item.system.quantity : 1
          containers[slotName].nbslots += (item.system.providedslot ?? 0) * q
          if (item.type == "money") {
            slotUsed += Math.ceil(item.system.quantity / 1000)
          } else {
            slotUsed += item.system.slotused * q
          }
        }
        slotUsed = Math.ceil(slotUsed * 100) / 100;
        containers[slotName].slotUsed = slotUsed
      }
    }
    return containers
  }
  /* -------------------------------------------- */
  getEquippedArmor() {
    let armor = this.items.find(item => item.type == 'armor' && item.system.slotlocation == 'armor');
    return armor ?? null;
  }
  /* -------------------------------------------- */
  prepareWeapon(weapon) {
    let formula = weapon.system.damage
    if (weapon.system.weapontype == "long" || weapon.system.weapontype == "short") {
      formula += "+" + this.system.statistics.str.value
    }
    if (weapon.system.weapontype == "twohanded") {
      formula += "+" + Math.floor(this.system.statistics.str.value * 1.5)
    }
    if (weapon.system.weapontype == "polearm") {
      formula += "+" + Math.floor(this.system.statistics.str.value * 1)
      weapon.damageFormula2Hands = weapon.system.damage2hands + "+" + Math.floor(this.system.statistics.str.value * 1.5)
    }
    if (weapon.system.weapontype == "throwing" || weapon.system.weapontype == "shooting") {
      formula += "+" + this.system.secondary.rangeddamagebonus.value
    } else if (weapon.system.weapontype != "special") {
      formula += "+" + this.system.secondary.meleedamagebonus.value
      if (weapon.damageFormula2Hands) {
        weapon.damageFormula2Hands += "+" + this.system.secondary.meleedamagebonus.value
      }
    }
    const damageBonus = Number(weapon.system.damagebonus) || 0
    if (damageBonus) {
      formula += "+" + damageBonus
      if (weapon.damageFormula2Hands) {
        weapon.damageFormula2Hands += "+" + damageBonus
      }
    }
    weapon.damageFormula = formula
  }
  /* -------------------------------------------- */
  getEquippedWeapons() {
    let comp = foundry.utils.deepClone(this.items.filter(item => item.type == 'weapon' && (item.system.slotlocation == "weapon1" || item.system.slotlocation == "weapon2")) || []);
    for (let weapon of comp) {
      this.prepareWeapon(weapon)
    }
    WarheroUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  getWeapons() {
    let comp = foundry.utils.deepClone(this.items.filter(item => item.type == 'weapon') || []);
    for (let weapon of comp) {
      this.prepareWeapon(weapon)
    }
    WarheroUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  /* -------------------------------------------- */
  getConditions() {
    let comp = foundry.utils.deepClone(this.items.filter(item => item.type == 'condition') || []);
    WarheroUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  /* -------------------------------------------- */
  getItemById(id) {
    let item = this.items.find(item => item.id == id);
    if (item) {
      item = foundry.utils.deepClone(item)
    }
    return item;
  }
  /* -------------------------------------------- */
  getLanguages() {
    let comp = this.items.filter(it => it.type == "language")
    WarheroUtility.sortArrayObjectsByName(comp)
    return comp
  }
  /* -------------------------------------------- */
  getNormalSkills() {
    let comp = this.items.filter(it => it.type == "skill" && !it.system.classskill && !it.system.raceskill)
    WarheroUtility.sortArrayObjectsByNameAndLevelAcquired(comp)
    return comp
  }
  getRaceSkills() {
    let comp = this.items.filter(it => it.type == "skill" && it.system.raceskill)
    WarheroUtility.sortArrayObjectsByName(comp)
    return comp
  }
  getClassSkills() {
    let comp = this.items.filter(it => it.type == "skill" && it.system.classskill)
    WarheroUtility.sortArrayObjectsByName(comp)
    return comp
  }
  /* -------------------------------------------- */
  async equipItem(itemId) {
    let item = this.items.find(item => item.id == itemId)
    if (item && item.system) {
      if (item.type == "armor") {
        let armor = this.items.find(item => item.id != itemId && item.type == "armor" && item.system.equipped)
        if (armor) {
          ui.notifications.warn("You already have an armor equipped!")
          return
        }
      }
      if (item.type == "shield") {
        let shield = this.items.find(item => item.id != itemId && item.type == "shield" && item.system.equipped)
        if (shield) {
          ui.notifications.warn("You already have a shield equipped!")
          return
        }
      }
      let update = { _id: item.id, "system.equipped": !item.system.equipped };
      //console.log("[DEBUG] equipItem updateEmbeddedDocuments", update);
      await this.updateEmbeddedDocuments('Item', [update]); // Updates one EmbeddedEntity
    }
  }

  /* ------------------------------------------- */
  getCompetencyItems() {
    return foundry.utils.deepClone(this.items.filter(item => item.type == "competency") || [])
  }
  /* ------------------------------------------- */
  getEquipmentsOnly() {
    return foundry.utils.deepClone(this.items.filter(item => item.type == "equipment") || [])
  }

  /* -------------------------------------------- */
  async rollArmor(rollData) {
    let armor = this.getEquippedArmor()
    if (armor) {

    }
    return { armor: "none" }
  }

   /* -------------------------------------------- */
  updateCompetency(competency, obj, labelTab) {
    for (let key in obj) {
      if (obj[key]) {
        //console.log("Parsing", key) //game.system.warhero.config.weaponTypes[key].label)
        competency[key] = { enabled: true, label: labelTab[key].label }
      }
    }
  }
  getCompetency() {
    let myRace = this.getRace()
    let myClass1 = this.getMainClass()
    let myClass2 = this.getSecondaryClass()
    let competency = { weapons: {}, armors: {}, shields: {} }
    if (myRace && myRace.system) {
      this.updateCompetency(competency.weapons, myRace.system.weapons, game.system.warhero.config.weaponTypes)
      this.updateCompetency(competency.armors, myRace.system.armors, game.system.warhero.config.armorTypes)
      this.updateCompetency(competency.shields, myRace.system.shields, game.system.warhero.config.shieldTypes)
    }
    if (myClass1 && myClass1.system) {
      this.updateCompetency(competency.weapons, myClass1.system.weapons, game.system.warhero.config.weaponTypes)
      this.updateCompetency(competency.armors, myClass1.system.armors, game.system.warhero.config.armorTypes)
      this.updateCompetency(competency.shields, myClass1.system.shields, game.system.warhero.config.shieldTypes)
    }
    if (myClass2 && myClass2.system) {
      this.updateCompetency(competency.weapons, myClass2.system.weapons, game.system.warhero.config.weaponTypes)
      this.updateCompetency(competency.armors, myClass2.system.armors, game.system.warhero.config.armorTypes)
      this.updateCompetency(competency.shields, myClass2.system.shields, game.system.warhero.config.shieldTypes)
    }
    return competency
  }

  /* -------------------------------------------- */
  async addObjectToContainer(itemId, containerId) {
    let container = this.items.find(item => item.id == containerId && item.system.iscontainer)
    let object = this.items.find(item => item.id == itemId)
    if (container) {
      if (object.system.iscontainer) {
        ui.notifications.warn("Only 1 level of container allowed")
        return
      }
      let alreadyInside = this.items.filter(item => item.system.containerid && item.system.containerid == containerId);
      if (alreadyInside.length >= container.system.containercapacity) {
        ui.notifications.warn("Container is already full !")
        return
      } else {
        await this.updateEmbeddedDocuments("Item", [{ _id: object.id, 'system.containerid': containerId }])
      }
    } else if (object && object.system.containerid) { // remove from container
      await this.updateEmbeddedDocuments("Item", [{ _id: object.id, 'system.containerid': "" }]);
    }
  }

  /* -------------------------------------------- */
  async preprocessItem(event, item, onDrop = false) {
    let dropID = $(event.target).parents(".item").attr("data-item-id") // Only relevant if container drop
    let objectID = item.id || item._id
    this.addObjectToContainer(objectID, dropID)
    return true
  }

  /* -------------------------------------------- */
  async equipGear(equipmentId) {
    let item = this.items.find(item => item.id == equipmentId);
    if (item && item.system) {
      let update = { _id: item.id, "system.equipped": !item.system.equipped };
      await this.updateEmbeddedDocuments('Item', [update]); // Updates one EmbeddedEntity
    }
  }
  /* -------------------------------------------- */
  async getInitiativeScore(combatId, combatantId) {
    let roll = new Roll("1d20+" + this.system.attributes.ini.value)
    await roll.evaluate()
    await WarheroUtility.showDiceSoNice(roll, game.settings.get("core", "messageMode"))
    return roll.total
  }

  /* -------------------------------------------- */
  syncRoll(rollData) {
    this.lastRollId = rollData.rollId;
    WarheroUtility.saveRollData(rollData);
  }

  /* -------------------------------------------- */
  getOneSkill(skillId) {
    let skill = this.items.find(item => item.type == 'skill' && item.id == skillId)
    if (skill) {
      skill = foundry.utils.deepClone(skill);
    }
    return skill;
  }

  /* -------------------------------------------- */
  async deleteAllItemsByType(itemType) {
    let items = this.items.filter(item => item.type == itemType);
    await this.deleteEmbeddedDocuments('Item', items);
  }

  /* -------------------------------------------- */
  async addItemWithoutDuplicate(newItem) {
    let item = this.items.find(item => item.type == newItem.type && item.name.toLowerCase() == newItem.name.toLowerCase())
    if (!item) {
      await this.createEmbeddedDocuments('Item', [newItem]);
    }
  }

  /* -------------------------------------------- */
  async incrementSkillExp(skillId, inc) {
    let skill = this.items.get(skillId)
    if (skill) {
      let update = { _id: skill.id, 'system.exp': skill.system.exp + inc };
      //console.log("[DEBUG] incrementSkillExp updateEmbeddedDocuments", update);
      await this.updateEmbeddedDocuments('Item', [update])
      let chatData = {
        user: game.user.id,
        rollMode: game.settings.get("core", "messageMode"),
        whisper: [game.user.id].concat(ChatMessage.getWhisperRecipients('GM')),
        content: `<div>${this.name} has gained 1 exp in the skill ${skill.name} (exp = ${skill.system.exp})</div>`
      }
      await ChatMessage.create(chatData)
      if (skill.system.exp >= 25) {
        await this.updateEmbeddedDocuments('Item', [{ _id: skill.id, 'system.exp': 0, 'system.explevel': skill.system.explevel + 1 }])
        let chatData = {
          user: game.user.id,
          rollMode: game.settings.get("core", "messageMode"),
          whisper: [game.user.id].concat(ChatMessage.getWhisperRecipients('GM')),
          content: `<div>${this.name} has gained 1 exp SL in the skill ${skill.name} (new exp SL :  ${skill.system.explevel}) !</div>`
        }
        await ChatMessage.create(chatData)
      }
    }
  }

  /* -------------------------------------------- */
  /**
   * Apply damage to the actor, considering temporary hit points first
   * Temporary HP are reduced first, then any excess damage goes to real HP
   * @param {number} damageAmount - The amount of damage to apply
   * @param {boolean} applyArmorReduction - If true, applies armor damage reduction (minimum 1 damage)
   * @returns {Promise<void>}
   */
  async applyDamage(damageAmount, applyArmorReduction = false) {
    if (!damageAmount || damageAmount <= 0) {
      return;
    }

    let finalDamage = damageAmount;

    // Apply armor damage reduction if requested
    if (applyArmorReduction) {
      const drbonustotal = this.system?.secondary?.drbonustotal?.value || 0;
      finalDamage = Math.max(1, damageAmount - drbonustotal);
      /*console.log('[DEBUG] applyDamage with armor reduction', {
        originalDamage: damageAmount,
        damageReduction: drbonustotal,
        finalDamage: finalDamage
      });*/
    }

    let currentTemporaryHP = this.system.attributes.temporaryhp?.value || 0;
    let currentHP = this.system.attributes.hp?.value || 0;

    let remainingDamage = finalDamage;
    let tempHPLost = 0;
    let realHPLost = 0;

    // First, reduce temporary HP
    if (currentTemporaryHP > 0) {
      tempHPLost = Math.min(currentTemporaryHP, remainingDamage);
      currentTemporaryHP -= tempHPLost;
      remainingDamage -= tempHPLost;
    }

    // Then, reduce real HP with any excess damage
    if (remainingDamage > 0) {
      realHPLost = remainingDamage;
      currentHP = Math.max(0, currentHP - remainingDamage);
    }

    // Update the actor with new values
    const updates = {
      'system.attributes.temporaryhp.value': Math.max(0, currentTemporaryHP),
      'system.attributes.hp.value': currentHP
    };

    /*console.log('[DEBUG] applyDamage', {
      originalDamageAmount: damageAmount,
      finalDamage: finalDamage,
      applyArmorReduction: applyArmorReduction,
      originalTempHP: this.system.attributes.temporaryhp?.value,
      originalHP: this.system.attributes.hp?.value,
      tempHPLost: tempHPLost,
      realHPLost: realHPLost,
      newTempHP: updates['system.attributes.temporaryhp.value'],
      newHP: updates['system.attributes.hp.value']
    });
    */

    await this.update(updates);

    // Create a chat message to notify about the damage
    const chatData = {
      user: game.user.id,
      content: game.i18n.format("WH.chat.damageapplied", {
        name: this.name,
        damage: finalDamage,
        tempHPLost: tempHPLost,
        hpLost: realHPLost
      })
    };
    await ChatMessage.create(chatData);
  }

  /* -------------------------------------------- */
  /**
   * Add temporary hit points to the actor (cumulative)
   * @param {number} tempHPAmount - The amount of temporary HP to add
   * @returns {Promise<void>}
   */
  async addTemporaryHP(tempHPAmount) {
    if (!tempHPAmount || tempHPAmount <= 0) {
      return;
    }

    let currentTemporaryHP = this.system.attributes.temporaryhp?.value || 0;
    // Temporary HP stack - add them together
    let newTemporaryHP = currentTemporaryHP + tempHPAmount;

    const updates = {
      'system.attributes.temporaryhp.value': newTemporaryHP
    };

    /*console.log('[DEBUG] addTemporaryHP', {
      tempHPAmount,
      previousTempHP: currentTemporaryHP,
      newTempHP: newTemporaryHP
    });
    */

    await this.update(updates);

    // Create a chat message to notify about the temporary HP
    const chatData = {
      user: game.user.id,
      content: game.i18n.format("WH.chat.temporaryhpadded", {
        name: this.name,
        temphp: newTemporaryHP
      })
    };
    await ChatMessage.create(chatData);
  }

  /* -------------------------------------------- */
  async restActor() {
    const manamax = this.system.attributes.mana.max;
    const hpmax = this.system.attributes.hp.max;

    this.resetAllSkillUses(false);

    let updates = {
      "system.attributes.mana.value": manamax,
      "system.attributes.hp.value": hpmax,
      "system.attributes.temporaryhp.value": 0,
      "system.secondary.counterspell.nbuse": 0
    };

    //console.log('[DEBUG] update resetAllSkillUses', { updates });
    await this.update(updates);

    await ChatMessage.create({
      user: game.user.id,
      content: game.i18n.format("WH.chat.actorrested", { name: this.name })
    });
  }

  /* -------------------------------------------- */
async resetAllSkillUses(askConfirmation = true) {
    // Gestione della conferma
    if (askConfirmation) {
        // Fallback per la localizzazione (i tuoi originali)
        const yesLabel = game.i18n.localize("Yes") || "Yes";
        const noLabel = game.i18n.localize("No") || "No";
        const title = game.i18n.localize("WH.ui.confirmresetskillsuse");
        const content = `<p>${game.i18n.localize("WH.ui.confirmresetskillsusecontent")}</p>`;

        // Utilizzo del metodo statico corretto per v13
        const confirmed = await foundry.applications.api.DialogV2.confirm({
            window: { title: title },
            content: content,
            yes: {
                label: yesLabel,
                callback: () => true
            },
            no: {
                label: noLabel,
                callback: () => false
            },
            rejectClose: false,
            modal: true
        });

        if (!confirmed) return;
    }

    let updates = []
    for (let skill of this.items.filter(i => i.type === 'skill')) {
      updates.push({ _id: skill.id, 'system.currentuse': 0 })
    }
    if (updates.length > 0) {
      await this.updateEmbeddedDocuments('Item', updates)
    }
  }

  /* -------------------------------------------- */
  async incDecSkillUse(skillId, value) {
    let skill = this.items.get(skillId)
    if (skill) {
      let newUse = skill.system.currentuse + value
      if (newUse > skill.system.maxuse) {
        ui.notifications.warn(game.i18n.localize("WH.notif.skillmaxuse"))
        return
      }
      newUse = Math.max(newUse, 0)
      await this.updateEmbeddedDocuments('Item', [{ _id: skill.id, 'system.currentuse': newUse }])
    }
  }
  /* -------------------------------------------- */
  async incDecQuantity(objetId, incDec = 0) {
    let objetQ = this.items.get(objetId)
    if (objetQ) {
      let newQ = objetQ.system.quantity + incDec
      if (newQ >= 0) {
        let update = { _id: objetQ.id, 'system.quantity': newQ };
        //console.log("[DEBUG] incDecQuantity updateEmbeddedDocuments", update);
        const updated = await this.updateEmbeddedDocuments('Item', [update]) // Updates one EmbeddedEntity
      }
    }
  }
  /* -------------------------------------------- */
  setLevel() {
    // prepareDerivedData fires during document creation, before the data
    // model is fully populated — optional chaining on the read is not enough;
    // the write target must also be guarded.
    let xpValue = this.system?.secondary?.xp?.value ?? 0;
    let calculated_level = 1 + Math.floor(xpValue / 10);
    if (this.system?.secondary?.xp) {
      this.system.secondary.xp.level = calculated_level;
    }
  }
  /* -------------------------------------------- */
  computeDRTotal() {
    let armors = this.items.filter(it => it.type == "armor" && it.system.slotlocation == 'armor')
    let dr = 0
    for (let armor of armors) {
      dr += armor.system.damagereduction
    }
    let drbonus = this.system?.secondary?.drbonus?.value || 0 //errore
    let drbonustotal = dr + drbonus
    if (drbonustotal < 0) drbonustotal = 0
    if (this.system?.secondary?.drbonustotal) {
      this.system.secondary.drbonustotal.value = drbonustotal //errore
    }
  }
  /* -------------------------------------------- */
  computeParryBonusTotal() {
    let shields = this.items.filter(it => it.type == "shield" && it.system.slotlocation == 'shield')
    let parry = 0
    for (let shield of shields) {
      parry += shield.system.parrybonus
    }
    let parrybonus = this.system?.secondary?.parrybonus?.value || 0
    let parrybonustotal = parrybonus + parry
    if (parrybonustotal < 0) parrybonustotal = 0
    if (this.system?.secondary?.parrybonustotal) {
      this.system.secondary.parrybonustotal.value = parrybonustotal //errore
    }
  }
  /* -------------------------------------------- */
  computeBonusLanguages() {
   const minStat = this.system.statistics?.min?.value ?? 0;
   const nblanguage = Math.floor(minStat / 2);
   if (this.system?.secondary?.nblanguage) {
     this.system.secondary.nblanguage.value = nblanguage;
   }
  }
  /* -------------------------------------------- */
  async spentMana(spentValue) {
    let mana = foundry.utils.deepClone(this.system.attributes.mana)
    if (Number(spentValue) > mana.value) {
      ui.notifications.warn("Not enough Mana points  : you have " + mana.value + " points, tried to spend " + spentValue)
      return false
    }
    mana.value -= Number(spentValue)
    await this.update({ 'system.attributes.mana': mana })
    return true
  }

  /* -------------------------------------------- */
  async incrementUse(rollData) {
    let stat = foundry.utils.deepClone(this.system[rollData.mode][rollData.statKey])
    stat.nbuse++
    await this.update({ [`system.${rollData.mode}.${rollData.statKey}`]: stat })
  }

  /* -------------------------------------------- */
  getCommonRollData() {
    let rollData = WarheroUtility.getBasicRollData()
    rollData.alias = this.name
    rollData.actorImg = this.img
    rollData.actorId = this.id
    rollData.img = this.img

    return rollData
  }

  /* -------------------------------------------- */
  rollFromType(rollType, rollKey) {
    let stat = foundry.utils.deepClone(this.system[rollType][rollKey])
    let rollData = this.getCommonRollData()
    rollData.mode = rollType
    rollData.statKey = rollKey
    rollData.stat = stat
    rollData.title = `${this.name} - ${game.i18n.localize(stat.label)}`
    if (stat && stat.stat) {
      rollData.statBonus = foundry.utils.deepClone(this.system.statistics[stat.stat])
    }
    if (stat.hasuse && stat.nbuse >= stat.maxuse) {
      ui.notifications.warn(game.i18n.localize("WH.notif.toomanyuses"))
      return
    }
    rollData.usemWeaponMalus = false
    rollData.mWeaponMalus = this.system.secondary.malusmultiweapon.value

    if (rollKey == "parrybonustotal") {
      WarheroUtility.rollParry(rollData)
      return
    }
    this.startRoll(rollData)
  }
  /* -------------------------------------------- */
  rollSaveFromType(rollType, rollKey) {
    // start from the saved statistic entry and then override its value
    // with the dedicated "save" field – the game designer populates that
    // manually on the sheet (statistics.str.save, statistics.dex.save,
    // statistics.min.save).
    let stat = foundry.utils.deepClone(this.system[rollType][rollKey]);
    if (stat) {
      stat.value = stat.save ?? 0;
      // keep the save property in sync for display in the chat message
      stat.save = stat.value;
    }
    let rollData = this.getCommonRollData();
    rollData.mode = "save";
    rollData.stat = stat;
    rollData.title = `${this.name} - Save`;
    this.startRoll(rollData);
  }

  /* -------------------------------------------- */
  rollWeapon(weaponId) {
    let weapon = this.items.get(weaponId)
    if (weapon) {
      weapon = foundry.utils.deepClone(weapon)
      let rollData = this.getCommonRollData()
      rollData.mode = "weapon"
      if (weapon.system.weapontype === "shooting" || weapon.system.weapontype === "throwing") {
        rollData.stat = foundry.utils.deepClone(this.system.attributes.txcr)
      } else {
        rollData.stat = foundry.utils.deepClone(this.system.attributes.txcm)
      }
      rollData.usemWeaponMalus = false
      rollData.mWeaponMalus = this.system.secondary.malusmultiweapon.value
      rollData.dexValue = this.system.statistics.dex.value
      rollData.weapon = weapon
      rollData.weaponId = weaponId
      rollData.img = weapon.img
      rollData.title = `${this.name} - ${weapon.name}`
      this.startRoll(rollData)
    }
  }
  /* -------------------------------------------- */
  rollDamage(weaponId, is2hands = false) {
    let weapon = this.items.get(weaponId)
    if (weapon) {
      weapon = foundry.utils.deepClone(weapon)
      this.prepareWeapon(weapon)
      let rollData = this.getCommonRollData()
      rollData.mode = "damage"
      rollData.weapon = weapon
      rollData.is2hands = is2hands
      rollData.img = weapon.img
      rollData.title = `${this.name} - Damage`
      this.startRoll(rollData)
    }
  }
  /* -------------------------------------------- */
  rollPower(powerId) {
    let power = this.items.get(powerId)
    if (power) {
      power = foundry.utils.deepClone(power)
      let rollData = this.getCommonRollData()
      rollData.mode = "power"
      rollData.power = power
      rollData.powerLevel = Number(power.system.level)
      rollData.img = power.img
      rollData.hasBM = false
      rollData.title = `${this.name} - Power`
      rollData.powerDescription = power.system.description
      // If teleport power, add locations list
      if (power.system.isteleport) {
        rollData.locations = this.getLocations()
        rollData.selectedLocation = ""
      }
      this.startRoll(rollData)
    }
  }

  /* -------------------------------------------- */
  async startRoll(rollData) {
    this.syncRoll(rollData)

    const content = await foundry.applications.handlebars.renderTemplate("systems/fvtt-warhero/templates/roll-dialog-generic.hbs", rollData)

    const rollContext = await foundry.applications.api.DialogV2.wait({
      window: { title: "Roll window" },
      position: { width: 420, height: "auto" },
      classes: ["fvtt-warhero"],
      content,
      buttons: [
        {
          label: "Roll !",
          callback: (event, button, dialog) => {
            const output = Array.from(button.form.elements).reduce((obj, input) => {
              if (input.name) obj[input.name] = input.value
              return obj
            }, {})
            return output
          },
        },
      ],
      actions: {
      },
      rejectClose: false, // Click on Close button will not launch an error
      render: (event, dialog) => {
        $("#powerLevel").change(event => {
          rollData.powerLevel = event.currentTarget.value
        })
        $("#bonusMalus").change(event => {
          rollData.bonusMalus = Number(event.currentTarget.value)
        })
        $("#usemWeaponMalusCheck").change(event => {
          rollData.usemWeaponMalus = event.currentTarget.checked
        })
        $("#selectedLocation").change(event => {
          rollData.selectedLocation = event.currentTarget.value
        } )
      }
    })

    // If the user cancels the dialog, exit
    if (rollContext === null) return

    rollData = { ...rollData, ...rollContext }
    WarheroUtility.rollWarhero(rollData)
  }
}
