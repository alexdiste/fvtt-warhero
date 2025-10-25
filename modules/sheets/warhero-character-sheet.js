import WarheroActorSheet from "./warhero-base-actor-sheet.js";
import { WarheroUtility } from "../warhero-utility.js";

/**
 * Warhero Character Sheet Application v2
 * Extends the basic ApplicationV2 with character-specific functionality
 * @extends {foundry.applications.sheets.ActorSheetV2}
 */
export class WarheroCharacterSheet extends WarheroActorSheet {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["character"],
    tag: "form",
    position: {
      width: 760,
      height: 780,
    },
    window: {
    },
    actions: {
      "roll-this": WarheroCharacterSheet.#onRollThis,
      "roll-save": WarheroCharacterSheet.#onRollSave,
      "roll-weapon": WarheroCharacterSheet.#onRollWeapon,
      "roll-damage": WarheroCharacterSheet.#onRollDamage,
      "roll-damage-2hands": WarheroCharacterSheet.#onRollDamage2Hands,
      "roll-power": WarheroCharacterSheet.#onRollPower,
      "skill-minus": WarheroCharacterSheet.#onSkillUseMinus,
      "skill-plus": WarheroCharacterSheet.#onSkillUsePlus,
      "reset-skill-use": WarheroCharacterSheet.#onResetSkillUse,
      "actor-sleep": WarheroCharacterSheet.#onActorSleep,
      "roll-d100-this": WarheroCharacterSheet.#onRollD100This,
    }
  };

  /** @override */
  static PARTS = {
    header: {
      template: "systems/fvtt-warhero/templates/actors/actor-sheet-header.hbs",
    },
    tabs: {
      template: "templates/generic/tab-navigation.hbs",
    },
    stats: {
      template: "systems/fvtt-warhero/templates/actors/partial-actor-main.hbs",
    },
    skills: {
      template: "systems/fvtt-warhero/templates/actors/partial-actor-skills.hbs",
      scrollable: [""]
    },
    combat: {
      template: "systems/fvtt-warhero/templates/actors/partial-actor-combat.hbs",
      scrollable: [""]
    },
    powers: {
      template: "systems/fvtt-warhero/templates/actors/partial-actor-powers.hbs",
      scrollable: [""]
    },
    equipment: {
      template: "systems/fvtt-warhero/templates/actors/partial-actor-equipment.hbs",
      scrollable: [""]
    },
    biography: {
      template: "systems/fvtt-warhero/templates/actors/partial-actor-biography.hbs",
      scrollable: [""]
    }
  };

  /** @override */
  tabGroups = {
    sheet: "stats",
  }

  #getTabs() {
    const tabs = {
      stats: { id: "stats", group: "sheet", icon: "fa-solid fa-compass", label: "WH.ui.main" },
      skills: { id: "skills", group: "sheet", icon: "fa-solid fa-shapes", label: "WH.ui.skills" },
      combat: { id: "combat", group: "sheet", icon: "fa-solid fa-sword", label: "WH.ui.combat" },
      powers: { id: "powers", group: "sheet", icon: "fa-solid fa-shapes", label: "WH.ui.powers" },
      equipment: { id: "equipment", group: "sheet", icon: "fa-solid fa-shapes", label: "WH.ui.equipment" },
      biography: { id: "biography", group: "sheet", icon: "fa-solid fa-book", label: "WH.ui.biography" },
    }
    for (const v of Object.values(tabs)) {
      v.active = this.tabGroups[v.group] === v.id
      v.cssClass = v.active ? "active" : ""
    }
    return tabs
  }

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  /** @override */
  async _prepareContext() {
    const context = await super._prepareContext()
    context.tabs = this.#getTabs()
    const doc = this.document

    this.actor.setLevel()
    this.actor.computeDRTotal()
    this.actor.computeParryBonusTotal()
    this.actor.computeBonusLanguages()
    const objectData = foundry.utils.duplicate(this.document.system)
    let race = this.actor.getRace()

    let formData = {
      title: this.title,
      id: this.actor.id,
      type: this.actor.type,
      img: this.actor.img,
      name: this.actor.name,
      editable: this.isEditable,
      cssClass: this.isEditable ? "editable" : "locked",
      system: objectData,
      compentencyItems: this.actor.getCompetencyItems(),
      skills: this.actor.getNormalSkills(),
      raceSkills: this.actor.getRaceSkills(),
      classSkills: this.actor.getClassSkills(),
      languages: this.actor.getLanguages(),
      weapons: this.actor.checkAndPrepareEquipments(foundry.utils.duplicate(this.actor.getWeapons())),
      conditions: this.actor.checkAndPrepareEquipments(foundry.utils.duplicate(this.actor.getConditions())),
      armors: this.actor.checkAndPrepareEquipments(foundry.utils.duplicate(this.actor.getArmors())),
      shields: this.actor.checkAndPrepareEquipments(foundry.utils.duplicate(this.actor.getShields())),
      equippedWeapons: this.actor.checkAndPrepareEquipments(foundry.utils.duplicate(this.actor.getEquippedWeapons())),
      equippedArmors: this.actor.checkAndPrepareEquipments(foundry.utils.duplicate(this.actor.getEquippedArmors())),
      equippedShields: this.actor.checkAndPrepareEquipments(foundry.utils.duplicate(this.actor.getEquippedShields())),
      powers: this.actor.sortPowers(),
      allItems: this.actor.getAllItems(),
      subActors: foundry.utils.duplicate(this.actor.getSubActors()),
      competency: this.actor.getCompetency(),
      race: foundry.utils.duplicate(race),
      mainClass: this.actor.getMainClass(),
      secondaryClass: this.actor.getSecondaryClass(),
      totalMoney: this.actor.computeTotalMoney(),
      equipments: foundry.utils.duplicate(this.actor.getEquipmentsOnly()),
      enrichedDescription: await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.document.system.biodata.description, { async: true }),
      enrichedNotes: await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.document.system.biodata.notes, { async: true }),
      options: this.options,
      owner: this.document.isOwner,
      editScore: this.options.editScore,
      isGM: game.user.isGM,
      config: game.system.warhero.config
    }
    formData.equipmentContainers = this.actor.buildEquipmentsSlot()
    formData.bodyContainers = this.actor.buildBodySlot()
    // Dynamic patch
    formData.system.secondary.counterspell.hasmax = false
    // Race mngt
    if (race && race.name) {
      formData.hpprogression = game.system.warhero.config.progressionList[race.system.hpprogresion]
    }
    // merge context and formData
    Object.assign(context, formData)

    console.log("WarheroCharacterSheet | Context", context)
    return context
  }

  /** @override */
  async _preparePartContext(partId, context) {
    const doc = this.document
    context.systemFields = this.document.system.schema.fields
    switch (partId) {
      case "stats":
        context.tab = context.tabs.stats
        break
      case "combat":
        context.tab = context.tabs.combat
        break;
      case "skills":
        context.tab = context.tabs.skills
        break
      case "powers":
        context.tab = context.tabs.powers
        break
      case "equipment":
        context.tab = context.tabs.equipment
        break
      case "biography":
        context.tab = context.tabs.biography
        break
    }
    return context
  }



  /* -------------------------------------------- */
  /*  Event Handlers                             */
  /* -------------------------------------------- */

  /**
   * Handle rolling a statistic
   * @param {Event} event - The triggering event
   * @param {HTMLElement} target - The target element
   */
  static async #onRollThis(event, target) {
    event.preventDefault();

    const rollType = $(event.target).data("type");
    const statKey = $(event.target).data("key");
    this.actor.rollFromType(rollType, statKey);
  }

  static async #onRollD100This(event, target) {
    event.preventDefault();

    let d100Bonus = this.actor.system.secondary.percentbonus.value || 0
    new Roll(`1d100 + ${d100Bonus}`).toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `${game.i18n.localize("WH.ui.percentroll")} : 1d100 + ${d100Bonus}`
    })
  }

  /**
   * Handle rolling a skill
   * @param {Event} event - The triggering event
   * @param {HTMLElement} target - The target element
   */
  static async #onRollSave(event, target) {
    event.preventDefault();

    const rollType = $(event.target).data("type")
    const statKey = $(event.target).data("key")
    this.actor.rollSaveFromType(rollType, statKey)
  }

  /**
   * Handle rolling a weapon attack
   * @param {Event} event - The triggering event
   * @param {HTMLElement} target - The target element
   */
  static async #onRollWeapon(event, target) {
    event.preventDefault();
    const li = $(event.target).parents(".item")
    const weaponId = li.data("item-id")
    this.actor.rollWeapon(weaponId)
  }

  static async #onRollDamage(event, target) {
    event.preventDefault();

    const li = $(event.target).parents(".item")
    const weaponId = li.data("item-id")
    this.actor.rollDamage(weaponId)
  }

  static async #onRollDamage2Hands(event, target) {
    event.preventDefault();

    const li = $(event.target).parents(".item")
    const weaponId = li.data("item-id")
    this.actor.rollDamage(weaponId, true)
  }

  static async #onSkillUseMinus(event, target) {
    event.preventDefault();

    const li = $(event.target).parents(".item")
    const skillId = li.data("item-id")
    this.actor.incDecSkillUse(skillId, -1)
  }

  static async #onSkillUsePlus(event, target) {
    event.preventDefault();
    const li = $(event.target).parents(".item")
    const skillId = li.data("item-id")
    this.actor.incDecSkillUse(skillId, 1)
  }

  static async #onResetSkillUse(event, target) {
    event.preventDefault();
    this.actor.resetAllSkillUses()
  }

  static async #onActorSleep(event, target) {
    event.preventDefault();
    this.actor.restActor()
  }

  /**
   * Handle casting a power
   * @param {Event} event - The triggering event
   * @param {HTMLElement} target - The target element
   */
  static async #onRollPower(event, target) {
    event.preventDefault();

    const li = $(event.target).parents(".item")
    const powerId = li.data("item-id")
    this.actor.rollPower(powerId)
  }

  /**
   * Handle toggling item equipped status
   * @param {Event} event - The triggering event
   * @param {HTMLElement} target - The target element
   */
  static async #onToggleEquipped(event, target) {
    event.preventDefault();

    const itemId = target.closest("[data-item-id]")?.dataset.itemId;
    if (!itemId) return;

    const item = this.document.items.get(itemId);
    if (!item) return;

    const currentEquipped = item.system.equipped || false;
    await item.update({ "system.equipped": !currentEquipped });
  }


  async _onDrop(event) {
    //if (!this.isEditable || !this.isEditMode) return
    const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event)

    // Handle different data types
    if (data.type === "Item") {
      const item = await fromUuid(data.uuid)
      return super._onDropItem(item)
    }

  }



}