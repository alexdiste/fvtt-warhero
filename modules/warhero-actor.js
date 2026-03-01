/* -------------------------------------------- */
import { WarheroUtility } from "./warhero-utility.js";

/* -------------------------------------------- */
const coverBonusTable = { "nocover": 0, "lightcover": 2, "heavycover": 4, "entrenchedcover": 6 };
const statThreatLevel = ["agi", "str", "phy", "com", "def", "per"]
const __subkey2title = {
  "melee-dmg": "Melee Damage", "melee-atk": "Melee Attack", "ranged-atk": "Ranged Attack",
  "ranged-dmg": "Ranged Damage", "dmg-res": "Damare Resistance"
}

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
  prepareBaseData() {
  }

  /* -------------------------------------------- */
  async prepareData() {
    super.prepareData();
  }

  /* -------------------------------------------- */
  computeHitPoints() {
    if (this.type == "character") {
    }
  }

  /* -------------------------------------------- */
  prepareDerivedData() {

    if (this.type == 'character' || game.user.isGM) {
      this.computeHitPoints()
      this.setLevel()
      this.computeDRTotal()
      this.computeParryBonusTotal()
      this.computeBonusLanguages()
    }

    super.prepareDerivedData();
  }

  /* -------------------------------------------- */
  _preUpdate(changed, options, user) {

    super._preUpdate(changed, options, user);
  }

  /* -------------------------------------------- */
  getEncumbranceCapacity() {
    return 1;
  }

  /* -------------------------------------------- */
  getMoneys() {
    let comp = this.items.filter(item => item.type == 'money');
    WarheroUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  /* -------------------------------------------- */
  getFeats() {
    let comp = foundry.utils.duplicate(this.items.filter(item => item.type == 'feat') || []);
    WarheroUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  /* -------------------------------------------- */
  getFeatsWithDie() {
    let comp = foundry.utils.duplicate(this.items.filter(item => item.type == 'feat' && item.system.isfeatdie) || []);
    WarheroUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  getFeatsWithSL() {
    let comp = foundry.utils.duplicate(this.items.filter(item => item.type == 'feat' && item.system.issl) || []);
    WarheroUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  /* -------------------------------------------- */
  getLore() {
    let comp = foundry.utils.duplicate(this.items.filter(item => item.type == 'spell') || []);
    WarheroUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  getEquippedWeapons() {
    let comp = foundry.utils.duplicate(this.items.filter(item => item.type == 'weapon' && item.system.equipped) || []);
    WarheroUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  /* -------------------------------------------- */
  getEquippedArmors() {
    let comp = foundry.utils.duplicate(this.items.filter(item => item.type == 'armor' && item.system.slotlocation == 'armor') || []);
    WarheroUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  getArmors() {
    let comp = foundry.utils.duplicate(this.items.filter(item => item.type == 'armor') || []);
    WarheroUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  getPowers() {
    let comp = foundry.utils.duplicate(this.items.filter(item => item.type == 'power') || []);
    WarheroUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  sortPowers() {
    let schools = {}
    for (let power of this.items) {
      if (power.type == "power") {
        power = foundry.utils.duplicate(power)
        let school = schools[power.system.magicschool] || []
        school.push(power)
        WarheroUtility.sortArrayObjectsByNameAndLevel(school)
        schools[power.system.magicschool] = school
      }
    }
    return schools
  }
  getAllItems() {
    let comp = foundry.utils.duplicate(this.items || []);
    WarheroUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  /* -------------------------------------------- */
  getEquippedShields() {
    let comp = foundry.utils.duplicate(this.items.filter(item => item.type == 'shield' && item.system.slotlocation == "shield") || []);
    WarheroUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  getShields() {
    let comp = foundry.utils.duplicate(this.items.filter(item => item.type == 'shield') || []);
    WarheroUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  /* -------------------------------------------- */
  getRace() {
    let race = this.items.filter(item => item.type == 'race')
    return race[0] ?? [];
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
    let comp = foundry.utils.duplicate(this.items.filter(item => item.type == "class") || []);
    WarheroUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  getLocations() {
    let comp = foundry.utils.duplicate(this.items.filter(item => item.type == 'location') || []);
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
  checkAndPrepareEquipment(item) {
  }

  /* -------------------------------------------- */
  checkAndPrepareEquipments(listItem) {
    for (let item of listItem) {
      this.checkAndPrepareEquipment(item)
    }
    return listItem
  }
  /* -------------------------------------------- */
  computeTotalMoney() {
    let nbMoney = 0
    this.items.forEach(it => { if (it.type == 'money') { nbMoney += it.system.quantity } })
    return nbMoney
  }

  /* -------------------------------------------- */
  buildPartySlots() {
    let containers = {}
    for (let slotName in game.system.warhero.config.partySlotNames) {
      let slotDef = game.system.warhero.config.partySlotNames[slotName]
      containers[slotName] = foundry.utils.duplicate(slotDef)
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
        containers[slotName] = foundry.utils.duplicate(slotDef)
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
        containers[slotName] = foundry.utils.duplicate(slotDef)
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
  getConditions() {
    let comp = foundry.utils.duplicate(this.items.filter(item => item.type == 'condition') || []);
    WarheroUtility.sortArrayObjectsByName(comp)
    return comp;
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
    weapon.damageFormula = formula
  }
  /* -------------------------------------------- */
  getEquippedWeapons() {
    let comp = foundry.utils.duplicate(this.items.filter(item => item.type == 'weapon' && (item.system.slotlocation == "weapon1" || item.system.slotlocation == "weapon2")) || []);
    for (let weapon of comp) {
      this.prepareWeapon(weapon)
    }
    WarheroUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  getWeapons() {
    let comp = foundry.utils.duplicate(this.items.filter(item => item.type == 'weapon') || []);
    for (let weapon of comp) {
      this.prepareWeapon(weapon)
    }
    WarheroUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  /* -------------------------------------------- */
  getConditions() {
    let comp = foundry.utils.duplicate(this.items.filter(item => item.type == 'condition') || []);
    WarheroUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  /* -------------------------------------------- */
  getItemById(id) {
    let item = this.items.find(item => item.id == id);
    if (item) {
      item = foundry.utils.duplicate(item)
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
  getSkills() {
    let comp = foundry.utils.duplicate(this.items.filter(item => item.type == 'skill') || [])
    WarheroUtility.sortArrayObjectsByName(comp)
    return comp
  }

  /* -------------------------------------------- */
  getRelevantAbility(statKey) {
    let comp = foundry.utils.duplicate(this.items.filter(item => item.type == 'skill' && item.system.ability == ability) || []);
    return comp;
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
      await this.updateEmbeddedDocuments('Item', [update]); // Updates one EmbeddedEntity
    }
  }

  /* -------------------------------------------- */
  compareName(a, b) {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  }

  /* ------------------------------------------- */
  getEquipments() {
    return this.items.filter(item => item.type == 'shield' || item.type == 'armor' || item.type == "weapon" || item.type == "equipment" || item.type == "potion" || item.type == "poison" || item.type == "trap" || item.type == "classitem");
  }
  getCompetencyItems() {
    return foundry.utils.duplicate(this.items.filter(item => item.type == "competency") || [])
  }
  /* ------------------------------------------- */
  getEquipmentsOnly() {
    return foundry.utils.duplicate(this.items.filter(item => item.type == "equipment") || [])
  }

  /* ------------------------------------------- */
  /**
   * Return an object whose keys match the statistic keys used on the sheet
   * ("str","dex","min").  Each entry contains the save bonus configured
   * on the statistic.  This keeps the logic decoupled from earlier
   * implementations that derived saves from unrelated ability scores.
   */
  getSaveRoll() {
    const stats = this.system?.statistics || {};
    return {
      str: {
        label: "Fortitude Save",
        value: stats.str?.save || 0
      },
      dex: {
        label: "Reflex Save",
        value: stats.dex?.save || 0
      },
      min: {
        label: "Willpower Save",
        value: stats.min?.save || 0
      }
    };
  }

  /* ------------------------------------------- */
  async buildContainerTree() {
    let equipments = foundry.utils.duplicate(this.items.filter(item => item.type == "equipment") || [])
    for (let equip1 of equipments) {
      if (equip1.system.iscontainer) {
        equip1.system.contents = []
        equip1.system.contentsEnc = 0
        for (let equip2 of equipments) {
          if (equip1._id != equip2.id && equip2.system.containerid == equip1.id) {
            equip1.system.contents.push(equip2)
            let q = equip2.system.quantity ?? 1
            equip1.system.contentsEnc += q * equip2.system.weight
          }
        }
      }
    }

    // Compute whole enc
    let enc = 0
    for (let item of equipments) {
      //item.data.idrDice = WarheroUtility.getDiceFromLevel(Number(item.data.idr))
      if (item.system.equipped) {
        if (item.system.iscontainer) {
          enc += item.system.contentsEnc
        } else if (item.system.containerid == "") {
          let q = item.system.quantity ?? 1
          enc += q * item.system.weight
        }
      }
    }
    for (let item of this.items) { // Process items/shields/armors
      if ((item.type == "weapon" || item.type == "shield" || item.type == "armor") && item.system.equipped) {
        let q = item.system.quantity ?? 1
        enc += q * item.system.weight
      }
    }

    // Store local values
    this.encCurrent = enc
    this.containersTree = equipments.filter(item => item.system.containerid == "") // Returns the root of equipements without container

  }

  /* -------------------------------------------- */
  async rollArmor(rollData) {
    let armor = this.getEquippedArmor()
    if (armor) {

    }
    return { armor: "none" }
  }

  /* -------------------------------------------- */
  async incDecHP(formula) {
    let dmgRoll = await new Roll(formula + "[warhero-orange]").roll()
    await WarheroUtility.showDiceSoNice(dmgRoll, game.settings.get("core", "rollMode"))
    let hp = foundry.utils.duplicate(this.system.secondary.hp)
    hp.value = Number(hp.value) + Number(dmgRoll.total)
    this.update({ 'system.secondary.hp': hp })
    return Number(dmgRoll.total)
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
    if (myRace.system) {
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
  getAbility(abilKey) {
    // return a safe object even if abilities are missing
    return (this.system?.abilities || {})[abilKey] || { value: 0 };
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
      console.log("Removeing: ", object)
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
    await WarheroUtility.showDiceSoNice(roll, game.settings.get("core", "rollMode"))
    return roll.total
  }

  /* -------------------------------------------- */
  getSubActors() {
    let subActors = [];
    for (let id of this.system.subactors) {
      subActors.push(foundry.utils.duplicate(game.actors.get(id)))
    }
    return subActors;
  }
  /* -------------------------------------------- */
  async addSubActor(subActorId) {
    let subActors = foundry.utils.duplicate(this.system.subactors);
    subActors.push(subActorId);
    await this.update({ 'system.subactors': subActors });
  }
  /* -------------------------------------------- */
  async delSubActor(subActorId) {
    let newArray = [];
    for (let id of this.system.subactors) {
      if (id != subActorId) {
        newArray.push(id);
      }
    }
    await this.update({ 'system.subactors': newArray });
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
      skill = foundry.utils.duplicate(skill);
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
      await this.updateEmbeddedDocuments('Item', [{ _id: skill.id, 'system.exp': skill.system.exp + inc }])
      let chatData = {
        user: game.user.id,
        rollMode: game.settings.get("core", "rollMode"),
        whisper: [game.user.id].concat(ChatMessage.getWhisperRecipients('GM')),
        content: `<div>${this.name} has gained 1 exp in the skill ${skill.name} (exp = ${skill.system.exp})</div`
      }
      ChatMessage.create(chatData)
      if (skill.system.exp >= 25) {
        await this.updateEmbeddedDocuments('Item', [{ _id: skill.id, 'system.exp': 0, 'system.explevel': skill.system.explevel + 1 }])
        let chatData = {
          user: game.user.id,
          rollMode: game.settings.get("core", "rollMode"),
          whisper: [game.user.id].concat(ChatMessage.getWhisperRecipients('GM')),
          content: `<div>${this.name} has gained 1 exp SL in the skill ${skill.name} (new exp SL :  ${skill.system.explevel}) !</div`
        }
        ChatMessage.create(chatData)
      }
    }
  }

  /* -------------------------------------------- */
  async restActor() {
    const manamax = this.system.attributes.mana.max;
    const hpmax = this.system.attributes.hp.max;

    this.resetAllSkillUses(false);

    let updates = {
      "system.attributes.mana.value": manamax,
      "system.attributes.hp.value": hpmax,
      "system.secondary.counterspell.nbuse": 0
    };

    await this.update(updates);

    ChatMessage.create({
      user: game.user._id,
      content: game.i18n.format("WH.chat.actorrested", { name: this.name })
    });
  }

  /* -------------------------------------------- */
  async resetAllSkillUses(askConfirmation = true) {
    // Wait for confirmation
    if (askConfirmation) {
      let confirmed = await Dialog.confirm({
        title: game.i18n.localize("WH.ui.confirmresetskillsusetitle"),
        content: `<p>${game.i18n.localize("WH.ui.confirmresetskillsusecontent")}</p>`,
        yes: () => true,
        no: () => false
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
      this.updateEmbeddedDocuments('Item', [{ _id: skill.id, 'system.currentuse': newUse }])
    }
  }
  /* -------------------------------------------- */
  async incDecQuantity(objetId, incDec = 0) {
    let objetQ = this.items.get(objetId)
    if (objetQ) {
      let newQ = objetQ.system.quantity + incDec
      if (newQ >= 0) {
        const updated = await this.updateEmbeddedDocuments('Item', [{ _id: objetQ.id, 'system.quantity': newQ }]) // pdates one EmbeddedEntity
      }
    }
  }
  /* -------------------------------------------- */
  async incDecAmmo(objetId, incDec = 0) {
    let objetQ = this.items.get(objetId)
    if (objetQ) {
      let newQ = objetQ.system.ammocurrent + incDec;
      if (newQ >= 0 && newQ <= objetQ.system.ammomax) {
        const updated = await this.updateEmbeddedDocuments('Item', [{ _id: objetQ.id, 'system.ammocurrent': newQ }]); // pdates one EmbeddedEntity
      }
    }
  }

  /* -------------------------------------------- */
  isForcedAdvantage() {
    return this.items.find(cond => cond.type == "condition" && cond.system.advantage)
  }
  isForcedDisadvantage() {
    return this.items.find(cond => cond.type == "condition" && cond.system.disadvantage)
  }
  isForcedRollAdvantage() {
    return this.items.find(cond => cond.type == "condition" && cond.system.rolladvantage)
  }
  isForcedRollDisadvantage() {
    return this.items.find(cond => cond.type == "condition" && cond.system.rolldisadvantage)
  }
  isNoAdvantage() {
    return this.items.find(cond => cond.type == "condition" && cond.system.noadvantage)
  }
  isNoAction() {
    return this.items.find(cond => cond.type == "condition" && cond.system.noaction)
  }
  isAttackDisadvantage() {
    return this.items.find(cond => cond.type == "condition" && cond.system.attackdisadvantage)
  }
  isDefenseDisadvantage() {
    return this.items.find(cond => cond.type == "condition" && cond.system.defensedisadvantage)
  }
  isAttackerAdvantage() {
    return this.items.find(cond => cond.type == "condition" && cond.system.targetadvantage)
  }
  /* -------------------------------------------- */
  setLevel() {
    let xp = this.system?.secondary?.xp?.value
    if (xp == undefined) return
    let level = 1 + Math.floor(xp / 10)
    if (level != this.system.secondary.xp.level) {
      this.update({ 'system.secondary.xp.level': level })
    }
  }
  /* -------------------------------------------- */
  computeDRTotal() {
    let armors = this.items.filter(it => it.type == "armor" && it.system.slotlocation == 'armor')
    let dr = 0
    for (let armor of armors) {
      dr += armor.system.damagereduction
    }
    let drbonustotal = dr
    if (this.system?.secondary?.drbonustotal) {
      drbonustotal = this.system.secondary.drbonustotal.value
    }
    if (drbonustotal < 0) drbonustotal = 0
    if (drbonustotal != this.system?.secondary?.drbonustotal?.value) {
      this.update({ 'system.secondary.drbonustotal.value': drbonustotal })
    }
  }
  /* -------------------------------------------- */
  computeParryBonusTotal() {
    let shields = this.items.filter(it => it.type == "shield" && it.system.slotlocation == 'shield')
    let parry = 0
    for (let shield of shields) {
      parry += shield.system.parrybonus
    }
    if (this.system?.secondary?.parrybonustotal == undefined) return
    let parrybonustotal = this.system?.secondary?.parrybonustotal?.value + parry
    if (parrybonustotal < 0) parrybonustotal = 0
    if (parrybonustotal != this.system?.secondary?.parrybonustotal?.value) {
      this.update({ 'system.secondary.parrybonustotal.value': parrybonustotal })
    }
  }
  /* -------------------------------------------- */
  computeBonusLanguages() {
    if (!this.system?.statistics?.min.value || this.system?.secondary?.nblanguage == undefined) return
    let nblanguage = Math.floor(this.system.statistics.min.value / 2)
    if (nblanguage != this.system?.secondary?.nblanguage?.value) {
      this.update({ 'system.secondary.nblanguage.value': nblanguage })
    }
  }
  /* -------------------------------------------- */
  spentMana(spentValue) {
    let mana = foundry.utils.duplicate(this.system.attributes.mana)
    if (Number(spentValue) > mana.value) {
      ui.notifications.warn("Not enough Mana points  : you have " + mana.value + " points, tried to spend " + spentValue)
      return false
    }
    mana.value -= Number(spentValue)
    this.update({ 'system.attributes.mana': mana })
    return true
  }

  /* -------------------------------------------- */
  incrementUse(rollData) {
    let stat = foundry.utils.duplicate(this.system[rollData.mode][rollData.statKey])
    stat.nbuse++
    this.update({ [`system.${rollData.mode}.${rollData.statKey}`]: stat })
  }

  /* -------------------------------------------- */
  getCommonRollData() {
    let rollData = WarheroUtility.getBasicRollData()
    rollData.alias = this.name
    rollData.actorImg = this.img
    rollData.actorId = this.id
    rollData.img = this.img
    console.log("ROLLDATA", rollData)

    return rollData
  }

  /* -------------------------------------------- */
  rollFromType(rollType, rollKey) {
    let stat = foundry.utils.duplicate(this.system[rollType][rollKey])
    let rollData = this.getCommonRollData()
    rollData.mode = rollType
    rollData.statKey = rollKey
    rollData.stat = stat
    rollData.title = `${this.name} - ${game.i18n.localize(stat.label)}`
    if (stat && stat.stat) {
      rollData.statBonus = foundry.utils.duplicate(this.system.statistics[stat.stat])
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
    let stat = foundry.utils.duplicate(this.system[rollType][rollKey]);
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
      weapon = foundry.utils.duplicate(weapon)
      let rollData = this.getCommonRollData()
      rollData.mode = "weapon"
      if (weapon.system.weapontype === "shooting" || weapon.system.weapontype === "throwing") {
        rollData.stat = foundry.utils.duplicate(this.system.attributes.txcr)
      } else {
        rollData.stat = foundry.utils.duplicate(this.system.attributes.txcm)
      }
      rollData.usemWeaponMalus = false
      rollData.mWeaponMalus = this.system.secondary.malusmultiweapon.value
      rollData.weapon = weapon
      rollData.img = weapon.img
      rollData.title = `${this.name} - ${weapon.name}`
      this.startRoll(rollData)
    }
  }
  /* -------------------------------------------- */
  rollDamage(weaponId, is2hands = false) {
    let weapon = this.items.get(weaponId)
    if (weapon) {
      weapon = foundry.utils.duplicate(weapon)
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
      power = foundry.utils.duplicate(power)
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