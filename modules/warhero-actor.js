/* -------------------------------------------- */
import { CrucibleUtility } from "./crucible-utility.js";
import { CrucibleRollDialog } from "./crucible-roll-dialog.js";

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
export class CrucibleActor extends Actor {

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

    if (data.type == 'character') {
      const skills = await CrucibleUtility.loadCompendium("fvtt-crucible-rpg.skills");
      data.items = skills.map(i => i.toObject())
    }
    if (data.type == 'npc') {
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
      let hp = duplicate(this.system.secondary.hp)
      let max = (this.system.abilities.str.value + this.system.abilities.con.value) * 6
      if (max != hp.max || hp.value > max) {
        hp.max = max
        hp.value = max // Init case
        this.update({ 'system.secondary.hp': hp })
      }
    }
  }
  /* -------------------------------------------- */
  computeEffortPoints() {
    if (this.type == "character") {
      let effort = duplicate(this.system.secondary.effort)
      let max = (this.system.abilities.con.value + this.system.abilities.int.value) * 6
      if (max != effort.max || effort.value > max) {
        effort.max = max
        effort.value = max // Init case
        this.update({ 'system.secondary.effort': effort })
      }
    }
  }

  /* -------------------------------------------- */
  prepareDerivedData() {

    if (this.type == 'character' || game.user.isGM) {
      this.system.encCapacity = this.getEncumbranceCapacity()
      this.buildContainerTree()
      this.computeHitPoints()
      this.computeEffortPoints()
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
    CrucibleUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  /* -------------------------------------------- */
  getFeats() {
    let comp = duplicate(this.items.filter(item => item.type == 'feat') || []);
    CrucibleUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  /* -------------------------------------------- */
  getFeatsWithDie() {
    let comp = duplicate(this.items.filter(item => item.type == 'feat' && item.system.isfeatdie) || []);
    CrucibleUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  getFeatsWithSL() {
    let comp = duplicate(this.items.filter(item => item.type == 'feat' && item.system.issl) || []);
    CrucibleUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  /* -------------------------------------------- */
  getLore() {
    let comp = duplicate(this.items.filter(item => item.type == 'spell') || []);
    CrucibleUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  getEquippedWeapons() {
    let comp = duplicate(this.items.filter(item => item.type == 'weapon' && item.system.equipped) || []);
    CrucibleUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  /* -------------------------------------------- */
  getArmors() {
    let comp = duplicate(this.items.filter(item => item.type == 'armor') || []);
    CrucibleUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  getEquippedArmor() {
    let comp = this.items.find(item => item.type == 'armor' && item.system.equipped)
    if (comp) {
      return duplicate(comp)
    }
    return undefined
  }
  /* -------------------------------------------- */
  getShields() {
    let comp = duplicate(this.items.filter(item => item.type == 'shield') || []);
    CrucibleUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  getEquippedShield() {
    let comp = this.items.find(item => item.type == 'shield' && item.system.equipped)
    if (comp) {
      return duplicate(comp)
    }
    return undefined
  }
  /* -------------------------------------------- */
  getRace() {
    let race = this.items.filter(item => item.type == 'race')
    return race[0] ?? [];
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
  getConditions() {
    let comp = duplicate(this.items.filter(item => item.type == 'condition') || []);
    CrucibleUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  /* -------------------------------------------- */
  getWeapons() {
    let comp = duplicate(this.items.filter(item => item.type == 'weapon') || []);
    CrucibleUtility.sortArrayObjectsByName(comp)
    return comp;
  }
  /* -------------------------------------------- */
  getItemById(id) {
    let item = this.items.find(item => item.id == id);
    if (item) {
      item = duplicate(item)
    }
    return item;
  }

  /* -------------------------------------------- */
  getSkills() {
    let comp = duplicate(this.items.filter(item => item.type == 'skill') || [])
    for (let skill of comp) {
      CrucibleUtility.updateSkill(skill)
    }
    CrucibleUtility.sortArrayObjectsByName(comp)
    return comp
  }

  /* -------------------------------------------- */
  getRelevantAbility(statKey) {
    let comp = duplicate(this.items.filter(item => item.type == 'skill' && item.system.ability == ability) || []);
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
    return this.items.filter(item => item.type == 'shield' || item.type == 'armor' || item.type == "weapon" || item.type == "equipment");
  }
  /* ------------------------------------------- */
  getEquipmentsOnly() {
    return duplicate(this.items.filter(item => item.type == "equipment") || [])
  }

  /* ------------------------------------------- */
  getSaveRoll() {
    return {
      reflex: {
        "label": "Reflex Save",
        "img": "systems/fvtt-crucible-rpg/images/icons/saves/reflex_save.webp",
        "value": this.system.abilities.agi.value + this.system.abilities.wit.value
      },
      fortitude: {
        "label": "Fortitude Save",
        "img": "systems/fvtt-crucible-rpg/images/icons/saves/fortitude_save.webp",
        "value": this.system.abilities.str.value + this.system.abilities.con.value
      },
      willpower: {
        "label": "Willpower Save",
        "img": "systems/fvtt-crucible-rpg/images/icons/saves/will_save.webp",
        "value": this.system.abilities.int.value + this.system.abilities.cha.value
      }
    }
  }

  /* ------------------------------------------- */
  async buildContainerTree() {
    let equipments = duplicate(this.items.filter(item => item.type == "equipment") || [])
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
      //item.data.idrDice = CrucibleUtility.getDiceFromLevel(Number(item.data.idr))
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
    let dmgRoll = new Roll(formula+"[crucible-orange]").roll({ async: false })
    await CrucibleUtility.showDiceSoNice(dmgRoll, game.settings.get("core", "rollMode"))
    let hp = duplicate(this.system.secondary.hp)
    hp.value = Number(hp.value) + Number(dmgRoll.total)
    this.update({ 'system.secondary.hp': hp })
    return Number(dmgRoll.total)
  }

  /* -------------------------------------------- */
  getAbility(abilKey) {
    return this.system.abilities[abilKey];
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
  getInitiativeScore(combatId, combatantId) {
    if (this.type == 'character') {
      this.rollMR(true, combatId, combatantId)
    }
    console.log("Init required !!!!")
    return -1;
  }

  /* -------------------------------------------- */
  getSubActors() {
    let subActors = [];
    for (let id of this.system.subactors) {
      subActors.push(duplicate(game.actors.get(id)))
    }
    return subActors;
  }
  /* -------------------------------------------- */
  async addSubActor(subActorId) {
    let subActors = duplicate(this.system.subactors);
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
    CrucibleUtility.saveRollData(rollData);
  }

  /* -------------------------------------------- */
  getOneSkill(skillId) {
    let skill = this.items.find(item => item.type == 'skill' && item.id == skillId)
    if (skill) {
      skill = duplicate(skill);
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
  getCommonRollData(abilityKey = undefined) {
    let noAction = this.isNoAction()
    if (noAction) {
      ui.notifications.warn("You can't do any actions du to the condition : " + noAction.name)
      return
    }

    let rollData = CrucibleUtility.getBasicRollData()
    rollData.alias = this.name
    rollData.actorImg = this.img
    rollData.actorId = this.id
    rollData.img = this.img
    rollData.featsDie = this.getFeatsWithDie()
    rollData.featsSL = this.getFeatsWithSL()
    rollData.armors = this.getArmors()
    rollData.conditions = this.getConditions()
    rollData.featDieName = "none"
    rollData.featSLName = "none"
    rollData.rollAdvantage = "none"
    rollData.advantage = "none"
    rollData.disadvantage = "none"
    rollData.forceAdvantage = this.isForcedAdvantage()
    rollData.forceDisadvantage = this.isForcedDisadvantage()
    rollData.forceRollAdvantage = this.isForcedRollAdvantage()
    rollData.forceRollDisadvantage = this.isForcedRollDisadvantage()
    rollData.noAdvantage = this.isNoAdvantage()
    if (rollData.defenderTokenId) {
      let defenderToken = game.canvas.tokens.get(rollData.defenderTokenId)
      let defender = defenderToken.actor

      // Distance management
      let token = this.token
      if (!token) {
        let tokens = this.getActiveTokens()
        token = tokens[0]
      }
      if (token) {
        const ray = new Ray(token.object?.center || token.center, defenderToken.center)
        rollData.tokensDistance = canvas.grid.measureDistances([{ ray }], { gridSpaces: false })[0] / canvas.grid.grid.options.dimensions.distance
      } else {
        ui.notifications.info("No token connected to this actor, unable to compute distance.")
        return
      }
      if (defender) {
        rollData.forceAdvantage = defender.isAttackerAdvantage()
        rollData.advantageFromTarget = true
      }
    }

    if (abilityKey) {
      rollData.ability = this.getAbility(abilityKey)
      rollData.selectedKill = undefined
    }

    console.log("ROLLDATA", rollData)

    return rollData
  }

  /* -------------------------------------------- */
  rollAbility(abilityKey) {
    let rollData = this.getCommonRollData(abilityKey)
    rollData.mode = "ability"
    if (rollData.target) {
      ui.notifications.warn("You are targetting a token with a skill : please use a Weapon instead.")
      return
    }
    CrucibleUtility.rollCrucible(rollData)
  }

  /* -------------------------------------------- */
  rollSkill(skillId) {
    let skill = this.items.get(skillId)
    if (skill) {
      if (skill.system.islore && skill.system.level == 0) {
        ui.notifications.warn("You can't use Lore Skills with a SL of 0.")
        return
      }
      skill = duplicate(skill)
      CrucibleUtility.updateSkill(skill)
      let abilityKey = skill.system.ability
      let rollData = this.getCommonRollData(abilityKey)
      rollData.mode = "skill"
      rollData.skill = skill
      rollData.img = skill.img
      if (rollData.target) {
        ui.notifications.warn("You are targetting a token with a skill : please use a Weapon instead.")
        return
      }
      this.startRoll(rollData)
    }
  }

  /* -------------------------------------------- */
  rollWeapon(weaponId) {
    let weapon = this.items.get(weaponId)
    if (weapon) {
      weapon = duplicate(weapon)
      let skill = this.items.find(item => item.name.toLowerCase() == weapon.system.skill.toLowerCase())
      if (skill) {
        skill = duplicate(skill)
        CrucibleUtility.updateSkill(skill)
        let abilityKey = skill.system.ability
        let rollData = this.getCommonRollData(abilityKey)
        rollData.mode = "weapon"
        rollData.skill = skill
        rollData.weapon = weapon
        rollData.img = weapon.img
        if (!rollData.forceDisadvantage) { // This is an attack, check if disadvantaged
          rollData.forceDisadvantage = this.isAttackDisadvantage()
        }
        /*if (rollData.weapon.system.isranged && rollData.tokensDistance > CrucibleUtility.getWeaponMaxRange(rollData.weapon) ) {
          ui.notifications.warn(`Your target is out of range of your weapon (max: ${CrucibleUtility.getWeaponMaxRange(rollData.weapon)}  - current : ${rollData.tokensDistance})` )
          return
        }*/
        this.startRoll(rollData)
      } else {
        ui.notifications.warn("Unable to find the relevant skill for weapon " + weapon.name)
      }
    }
  }

  /* -------------------------------------------- */
  rollDefenseMelee(attackRollData) {
    let weapon = this.items.get(attackRollData.defenseWeaponId)
    if (weapon) {
      weapon = duplicate(weapon)
      let skill = this.items.find(item => item.name.toLowerCase() == weapon.system.skill.toLowerCase())
      if (skill) {
        skill = duplicate(skill)
        CrucibleUtility.updateSkill(skill)
        let abilityKey = skill.system.ability
        let rollData = this.getCommonRollData(abilityKey)
        rollData.defenderTokenId = undefined // Cleanup
        rollData.mode = "weapondefense"
        rollData.shield = this.getEquippedShield()
        rollData.attackRollData = duplicate(attackRollData)
        rollData.skill = skill
        rollData.weapon = weapon
        rollData.img = weapon.img
        if (!rollData.forceDisadvantage) { // This is an attack, check if disadvantaged
          rollData.forceDisadvantage = this.isDefenseDisadvantage()
        }

        this.startRoll(rollData)
      } else {
        ui.notifications.warn("Unable to find the relevant skill for weapon " + weapon.name)
      }
    } else {
      ui.notifications.warn("Weapon not found ! ")
    }
  }

  /* -------------------------------------------- */
  rollDefenseRanged(attackRollData) {
    let rollData = this.getCommonRollData()
    rollData.defenderTokenId = undefined // Cleanup
    rollData.mode = "rangeddefense"
    if ( attackRollData) {
      rollData.attackRollData = duplicate(attackRollData)
      rollData.effectiveRange = CrucibleUtility.getWeaponRange(attackRollData.weapon)
      rollData.tokensDistance = attackRollData.tokensDistance // QoL copy
    }
    rollData.sizeDice = CrucibleUtility.getSizeDice(this.system.biodata.size)
    rollData.distanceBonusDice = 0 //Math.max(0, Math.floor((rollData.tokensDistance - rollData.effectiveRange) + 0.5))
    rollData.hasCover = "none"
    rollData.situational = "none"
    rollData.useshield = false
    rollData.shield = this.getEquippedShield()
    this.startRoll(rollData)
  }

  /* -------------------------------------------- */
  rollShieldDie() {
    let shield = this.getEquippedShield()
    if (shield) {
      shield = duplicate(shield)
      let rollData = this.getCommonRollData()
      rollData.mode = "shield"
      rollData.shield = shield
      rollData.useshield = true
      rollData.img = shield.img
      this.startRoll(rollData)
    }
  }

  /* -------------------------------------------- */
  async rollArmorDie(rollData = undefined) {
    let armor = this.getEquippedArmor()
    if (armor) {
      armor = duplicate(armor)
      let reduce = 0
      let multiply = 1
      let disadvantage = false
      let advantage = false
      let messages = ["Armor applied"]

      if (rollData) {
        if (CrucibleUtility.isArmorLight(armor) && CrucibleUtility.isWeaponPenetrating(rollData.attackRollData.weapon)) {
          return { armorIgnored: true, nbSuccess: 0, messages: ["Armor ignored : Penetrating weapons ignore Light Armors."] }
        }
        if (CrucibleUtility.isWeaponPenetrating(rollData.attackRollData.weapon)) {
          messages.push("Armor reduced by 1 (Penetrating weapon)")
          reduce = 1
        }
        if (CrucibleUtility.isWeaponLight(rollData.attackRollData.weapon)) {
          messages.push("Armor with advantage (Light weapon)")
          advantage = true
        }
        if (CrucibleUtility.isWeaponHeavy(rollData.attackRollData.weapon)) {
          messages.push("Armor with disadvantage (Heavy weapon)")
          disadvantage = true
        }
        if (CrucibleUtility.isWeaponHack(rollData.attackRollData.weapon)) {
          messages.push("Armor reduced by 1 (Hack weapon)")
          reduce = 1
        }
        if (CrucibleUtility.isWeaponUndamaging(rollData.attackRollData.weapon)) {
          messages.push("Armor multiplied by 2 (Undamaging weapon)")
          multiply = 2
        }
      }
      let diceColor = armor.system.absorprionroll
      let armorResult = await CrucibleUtility.getRollTableFromDiceColor(diceColor, false)
      console.log("Armor log", armorResult)
      let armorValue = Math.max(0, (Number(armorResult.text) + reduce) * multiply)
      if (advantage || disadvantage) {
        let armorResult2 = await CrucibleUtility.getRollTableFromDiceColor(diceColor, false)
        let armorValue2 = Math.max(0, (Number(armorResult2.text) + reduce) * multiply)
        if (advantage) {
          armorValue = (armorValue2 > armorValue) ? armorValue2 : armorValue
          messages.push(`Armor advantage - Roll 1 = ${armorValue} - Roll 2 = ${armorValue2}`)
        }
        if (disadvantage) {
          armorValue = (armorValue2 < armorValue) ? armorValue2 : armorValue
          messages.push(`Armor disadvantage - Roll 1 = ${armorValue} - Roll 2 = ${armorValue2}`)
        }
      }
      armorResult.armorValue = armorValue
      if (!rollData) {
        ChatMessage.create({ content: "Armor result : " + armorValue })
      }
      messages.push("Armor result : " + armorValue)
      return { armorIgnored: false, nbSuccess: armorValue, rawArmor: armorResult.text, messages: messages }
    }
    return { armorIgnored: true, nbSuccess: 0, messages: ["No armor equipped."] }
  }

  /* -------------------------------------------- */
  rollSave(saveKey) {
    let saves = this.getSaveRoll()
    let save = saves[saveKey]
    if (save) {
      save = duplicate(save)
      let rollData = this.getCommonRollData()
      rollData.mode = "save"
      rollData.save = save
      if (rollData.target) {
        ui.notifications.warn("You are targetting a token with a save roll - Not authorized.")
        return
      }
      this.startRoll(rollData)
    }

  }
  /* -------------------------------------------- */
  async startRoll(rollData) {
    this.syncRoll(rollData)
    let rollDialog = await CrucibleRollDialog.create(this, rollData)
    rollDialog.render(true)
  }

}
