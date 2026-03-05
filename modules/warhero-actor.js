/* -------------------------------------------- */
import { WarheroUtility } from "./warhero-utility.js";

/* -------------------------------------------- */
/* -------------------------------------------- */
/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class WarheroActor extends Actor {
  static _loggedSanitizedEffects = new Set()

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
    if (Array.isArray(data)) {
      return super.create(data, options);
    }

    if (!foundry.utils.isPlainObject(data)) {
      return super.create(data, options);
    }

    const createData = foundry.utils.duplicate(data)

    // If the created actor has items (only applicable to duplicated actors) bypass the new actor creation logic
    if (Array.isArray(createData.items) && createData.items.length > 0) {
      let actor = super.create(createData, options);
      return actor;
    }
    createData.img = createData?.img || "systems/fvtt-warhero/images/icons/cowled.svg";

    // If the created actor is a character, add initial skills from compendium
    if (createData.type == 'character') {
      const skills = await WarheroUtility.loadCompendium("fvtt-warhero.skills");
      createData.items = skills.map(i => this._sanitizeItemDataForCreate(i.toObject()))
    }

    return super.create(createData, options);
  }

  static _sanitizeItemDataForCreate(itemData) {
    if (!itemData || typeof itemData !== "object") return itemData
    const clone = foundry.utils.duplicate(itemData)
    const rawEffects = Array.isArray(clone.effects) ? clone.effects : []
    clone.effects = rawEffects
      .filter(effect => effect && typeof effect === "object")
      .map(effect => {
        const normalized = foundry.utils.duplicate(effect)
        const rawChanges = Array.isArray(normalized.changes) ? normalized.changes : []
        normalized.changes = rawChanges
          .filter(change => change && typeof change === "object")
          .map(change => {
            const key = `${change.key ?? ""}`.trim()
            if (!key) return null
            if (["system", "system.biodata", "system.statistics", "system.attributes", "system.secondary"].includes(key)) return null
            return {
              key,
              mode: Number.isFinite(Number(change.mode)) ? Number(change.mode) : CONST.ACTIVE_EFFECT_MODES.ADD,
              value: `${change.value ?? ""}`,
              priority: Number.isFinite(Number(change.priority)) ? Number(change.priority) : undefined
            }
          })
          .filter(change => change !== null)
        return normalized
      })
    return clone
  }

  /* -------------------------------------------- */
  prepareBaseData() {
  }

  /* -------------------------------------------- */
 prepareData() {
    super.prepareData();
  }

  _buildSlotsFromConfig(slotConfig, defaultSlot = undefined) {
    const slots = foundry.utils.duplicate(slotConfig || {})
    for (const slot of Object.values(slots)) {
      slot.content = []
      slot.slotUsed = 0
    }

    for (const item of this.items) {
      const slotlocation = item.system?.slotlocation || defaultSlot
      if (!slotlocation || !slots[slotlocation]) continue
      const quantity = Number(item.system?.quantity ?? 1)
      const slotused = Number(item.system?.slotused ?? 1)
      const used = Math.max(quantity, 0) * Math.max(slotused, 0)

      slots[slotlocation].slotUsed += Number.isFinite(used) ? used : 0
      slots[slotlocation].content.push(foundry.utils.duplicate(item))
    }

    for (const slot of Object.values(slots)) {
      WarheroUtility.sortArrayObjectsByName(slot.content)
    }

    return slots
  }

  getEquipmentsOnly() {
    let comp = foundry.utils.duplicate(this.items.filter(item => {
      return typeof item.system?.slotlocation === "string" && item.system.slotlocation.trim().length > 0
    }) || [])
    WarheroUtility.sortArrayObjectsByName(comp)
    return comp
  }

  buildEquipmentsSlot() {
    const slotConfig = game.system?.warhero?.config?.slotNames || {}
    const allSlots = this._buildSlotsFromConfig(slotConfig)
    const containers = {}
    for (const [key, slot] of Object.entries(allSlots)) {
      if (slot.container) containers[key] = slot
    }
    return containers
  }

  buildBodySlot() {
    const slotConfig = game.system?.warhero?.config?.slotNames || {}
    const allSlots = this._buildSlotsFromConfig(slotConfig)
    const bodySlots = {}
    for (const [key, slot] of Object.entries(allSlots)) {
      if (!slot.container) bodySlots[key] = slot
    }
    return bodySlots
  }

  buildPartySlots() {
    const slotConfig = game.system?.warhero?.config?.partySlotNames || {}
    return this._buildSlotsFromConfig(slotConfig, "storage")
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
      // Assegna i valori calcolati dai getter ai dati del sistema
      if (this.system?.secondary?.xp) {
        this.system.secondary.xp.level = this.getComputedLevel()
      }
      if (this.system?.secondary?.drbonustotal) {
        this.system.secondary.drbonustotal.value = this.getComputedDRTotal()
      }
      if (this.system?.secondary?.parrybonustotal) {
        this.system.secondary.parrybonustotal.value = this.getComputedParryBonusTotal()
      }
      if (this.system?.secondary?.nblanguage) {
        this.system.secondary.nblanguage.value = this.getComputedBonusLanguages()
      }
      if (this.system?.attributes?.ini) {
        this.system.attributes.ini.value = this.getComputedInitiativeBonus()
      }
    }

    super.prepareDerivedData();
  }

  /* -------------------------------------------- */
  _preUpdate(changed, options, user) {

    super._preUpdate(changed, options, user);
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
  getCompetencyItems() {
    let comp = foundry.utils.duplicate(this.items.filter(item => item.type == 'competency') || [])
    WarheroUtility.sortArrayObjectsByName(comp)
    return comp
  }
  /* -------------------------------------------- */
  updateCompetency(competency, obj, labelTab) {
    for (let key in obj) {
      if (obj[key]) {
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
  async getInitiativeScore(combatId, combatantId) {
    let roll = new Roll("1d20+" + this.system.attributes.ini.value)
    await roll.evaluate()
    await WarheroUtility.playDice3DForRoll(roll, game.settings.get("core", "rollMode"))
    return roll.total
  }

  /* -------------------------------------------- */
  syncRoll(rollData) {
    this.lastRollId = rollData.rollId;
    WarheroUtility.saveRollData(rollData);
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
  getComputedLevel() {
    let xp = this.system?.secondary?.xp?.value
    if (xp == undefined) return 1
    return 1 + Math.floor(xp / 10)
  }
  /* -------------------------------------------- */
  setLevel() {
    const level = this.getComputedLevel()
    if (this.system?.secondary?.xp) {
      this.system.secondary.xp.level = level
    }
    return level
  }
  /* -------------------------------------------- */
  getComputedDRTotal() {
    let armors = this.items.filter(it => it.type == "armor" && it.system.slotlocation == 'armor')
    let dr = 0
    for (let armor of armors) {
      dr += armor.system.damagereduction
    }
    let drbonustotal = (this.system?.secondary?.drbonus?.value || 0) + dr
    if (drbonustotal < 0) drbonustotal = 0
    return drbonustotal
  }
  /* -------------------------------------------- */
  computeDRTotal() {
    const total = this.getComputedDRTotal()
    if (this.system?.secondary?.drbonustotal) {
      this.system.secondary.drbonustotal.value = total
    }
    return total
  }
  /* -------------------------------------------- */
  getComputedParryBonusTotal() {
    let shields = this.items.filter(it => it.type == "shield" && it.system.slotlocation == 'shield')
    let parry = 0
    for (let shield of shields) {
      parry += shield.system.parrybonus
    }
    let parrybonustotal = (this.system?.secondary?.parrybonus?.value || 0) + parry
    if (parrybonustotal < 0) parrybonustotal = 0
    return parrybonustotal
  }
  /* -------------------------------------------- */
  computeParryBonusTotal() {
    const total = this.getComputedParryBonusTotal()
    if (this.system?.secondary?.parrybonustotal) {
      this.system.secondary.parrybonustotal.value = total
    }
    return total
  }
  /* -------------------------------------------- */
  getComputedBonusLanguages() {
    if (!this.system?.statistics?.min.value) return 0
    return Math.floor(this.system.statistics.min.value / 2)
  }
  /* -------------------------------------------- */
  computeBonusLanguages() {
    const total = this.getComputedBonusLanguages()
    if (this.system?.secondary?.nblanguage) {
      this.system.secondary.nblanguage.value = total
    }
    return total
  }
  /* -------------------------------------------- */
  getComputedInitiativeBonus() {
    let dexBonus = this.system?.statistics?.dex?.value || 0
    let customBonus = this.system?.attributes?.ini?.bonus || 0
    return dexBonus + customBonus
  }
  /* -------------------------------------------- */
  spentMana(spentValue) {
    let mana = foundry.utils.duplicate(this.system.attributes.mana)
    if (Number(spentValue) > mana.value) {
      ui.notifications.warn(game.i18n.format("WH.notif.notenoughmana", { current: mana.value, spent: spentValue }))
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
    rollData.title = `${this.name} - ${game.i18n.localize("WH.chat.save")}`;
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
      rollData.title = `${this.name} - ${game.i18n.localize("WH.ui.damage")}`
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
      rollData.title = `${this.name} - ${game.i18n.localize("WH.chat.power")}`
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
      window: { title: game.i18n.localize("WH.ui.rollwindow") },
      position: { width: 420, height: "auto" },
      classes: ["fvtt-warhero"],
      content,
      buttons: [
        {
          label: game.i18n.localize("WH.ui.roll"),
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