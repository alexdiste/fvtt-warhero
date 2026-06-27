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
      width: 780,
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
      "skill-description-chat": WarheroCharacterSheet.#onSkillDescriptionChat,
      "toggle-empty-slots": WarheroCharacterSheet.#onToggleEmptySlots,
      "use-charge": WarheroCharacterSheet.#onUseCharge,
      "item-consume": WarheroCharacterSheet.#onConsumeItem,
      "restore-charges": WarheroCharacterSheet.#onRestoreCharges,
    }
  }

  /* -------------------------------------------- */
  /**
   * Restore all daily charges on the actor's items.
   * @param {Event} event - The triggering event
   * @param {HTMLElement} target - The target element
   */
  static async #onRestoreCharges(event, target) {
    event.preventDefault();
    const updates = [];
    for (const item of this.actor.items) {
      if (item.system.magiccharge === "chargedaily" && item.system.chargevalue > 0) {
        updates.push({ _id: item.id, "system.chargevalue": 0 });
      }
    }
    if (!updates.length) return;
    await this.actor.updateEmbeddedDocuments("Item", updates);
    const count = updates.length;
    const content = await foundry.applications.handlebars.renderTemplate(
      "systems/fvtt-warhero/templates/chat-charge-result.html",
      {
        actorImg: this.actor.img,
        alias: this.actor.name,
        itemName: game.i18n.format("WH.chat.chargesrestored", { actor: this.actor.name, count }),
        subtitle: game.i18n.localize("WH.ui.equipment"),
        message: game.i18n.localize("WH.ui.restorecharges"),
      }
    );
    await WarheroUtility.createChatWithRollMode(this.actor.name, { content });
    this.render();
  }

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
    },
    effects: {
      template: "systems/fvtt-warhero/templates/actors/partial-actor-effects.hbs",
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
      effects: { id: "effects", group: "sheet", icon: "fa-solid fa-book", label: "WH.ui.effects" },
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
    const objectData = foundry.utils.deepClone(this.document.system)
    let race = this.actor.getRace()

    let formData = {
      title: this.title,
      id: this.actor.id,
      type: this.actor.type,
      img: this.actor.img,
      name: this.actor.name,
      editable: this.isEditable,
      cssClass: this.isEditable ? "editable" : "locked",
      system: this.actor.system,
      compentencyItems: this.actor.getCompetencyItems(),
      skills: this.actor.getNormalSkills(),
      raceSkills: this.actor.getRaceSkills(),
      classSkills: this.actor.getClassSkills(),
      languages: this.actor.getLanguages(),
      weapons: this.actor.getWeapons(),
      conditions: this.actor.getConditions(),
      armors: this.actor.getArmors(),
      shields: this.actor.getShields(),
      equippedWeapons: this.actor.getEquippedWeapons(),
      equippedArmors: this.actor.getEquippedArmors(),
      equippedShields: this.actor.getEquippedShields(),
      powers: this.actor.sortPowers(),
      locations: this.actor.getLocations(),
      allItems: this.actor.getAllItems(),
      competency: this.actor.getCompetency(),
      race: foundry.utils.deepClone(race),
      mainClass: this.actor.getMainClass(),
      secondaryClass: this.actor.getSecondaryClass(),
      totalMoney: this.actor.computeTotalMoney(),
      equipments: foundry.utils.deepClone(this.actor.getEquipmentsOnly()),
      enrichedDescription: await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.document.system.biodata.description, { async: true }),
      enrichedNotes: await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.document.system.biodata.notes, { async: true }),
      options: this.options,
      owner: this.document.isOwner,
      editScore: this.options.editScore,
      isGM: game.user.isGM,
      config: game.system.warhero.config,
      effects: await WarheroUtility.prepareActiveEffectCategories(this.actor.allApplicableEffects())
    }
    formData.equipmentContainers = this.actor.buildEquipmentsSlot()
    formData.bodyContainers = this.actor.buildBodySlot()
    // Add filter flags for item search
    const equippedSlots = new Set(["armor", "shield", "weapon1", "weapon2", "ring", "belt"]);
    for (const [slotKey, container] of Object.entries({...formData.bodyContainers, ...formData.equipmentContainers})) {
      for (const item of container.content) {
        item._filterHasCharge = item.system.magiccharge && item.system.magiccharge !== "notapplicable";
        item._chargeDepleted = item._filterHasCharge && item.system.chargevalue >= item.system.chargevaluemax;
        item._chargeLimited = item._filterHasCharge && item.system.magiccharge === "chargelimited";
        item._filterMagical = item.system.isidentified && item.system.isidentified !== "notapplicable";
        item._filterUnidentified = item.system.isidentified === "unknown";
        item._filterEquipped = equippedSlots.has(slotKey);
      }
    }
    // Dynamic patch
    formData.system.secondary.counterspell.hasmax = false
    // Race mngt
    if (race && race.name) {
      formData.hpprogression = game.system.warhero.config.progressionList[race.system.hpprogresion]
    }
    // merge context and formData
    Object.assign(context, formData)

    //console.log("WarheroCharacterSheet | Context", context)
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
      case "effects":
        context.tab = context.tabs.effects
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
    let roll = new Roll(`1d100 + ${d100Bonus}`)
    await roll.evaluate({ async: true })
    await WarheroUtility.showDiceSoNice(roll, game.settings.get("core", "messageMode"))

    let diceResult = roll.terms[0].results[0].result
    let rollData = {
      actorImg: this.actor.img,
      alias: this.actor.name,
      actorId: this.actor.id,
      mode: "percent",
      img: this.actor.img,
      diceResult,
      diceFormula: roll.formula,
      roll,
      isCriticalSuccess: diceResult === 100,
      isCriticalFailure: diceResult === 1,
      hasBM: false,
      advantage: "none"
    }

    let content = await foundry.applications.handlebars.renderTemplate(
      "systems/fvtt-warhero/templates/chat-generic-result.html", rollData
    )
    let msg = await WarheroUtility.createChatWithRollMode(rollData.alias, { content })
    await msg.setFlag("world", "rolldata", rollData)
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
    await this.actor.incDecSkillUse(skillId, -1)
  }

  static async #onSkillUsePlus(event, target) {
    event.preventDefault();
    const li = $(event.target).parents(".item")
    const skillId = li.data("item-id")
    const skill = this.actor.items.get(skillId)
    if (!skill) return
    const ok = await this.actor.incDecSkillUse(skillId, 1)
    if (!ok) return
    const content = await foundry.applications.handlebars.renderTemplate(
      "systems/fvtt-warhero/templates/chat-skill-description.html",
      {
        actorImg: this.actor.img,
        alias: this.actor.name,
        skillName: skill.name,
        skillImg: skill.img,
        description: game.i18n.format("WH.chat.skillused", { skill: skill.name })
      }
    )
    await WarheroUtility.createChatWithRollMode(this.actor.name, { content })
  }

  static async #onResetSkillUse(event, target) {
    event.preventDefault();
    await this.actor.resetAllSkillUses()
  }

  static async #onSkillDescriptionChat(event, target) {
    event.preventDefault();
    const li = $(event.target).parents(".item")
    const skillId = li.data("item-id")
    const skill = this.actor.items.get(skillId)
    if (!skill) return

    const content = await foundry.applications.handlebars.renderTemplate(
      "systems/fvtt-warhero/templates/chat-skill-description.html",
      {
        actorImg: this.actor.img,
        alias: this.actor.name,
        skillName: skill.name,
        skillImg: skill.img,
        description: skill.system.description || game.i18n.localize("WH.ui.nodescription")
      }
    )
    await WarheroUtility.createChatWithRollMode(this.actor.name, { content })
  }

  static async #onActorSleep(event, target) {
    event.preventDefault();

    // Localizzazione con fallback
    const yesLabel = game.i18n.localize("Yes") || "Yes";
    const noLabel = game.i18n.localize("No") || "No";
    const title = game.i18n.localize("WH.ui.confirmrest");
    const content = `<p>${game.i18n.localize("WH.ui.confirmrestcontent")}</p>`;

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

    // Esecuzione del riposo
    await this.actor.restActor();
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

  /**
   * Toggle visibility of empty container slots on the equipment tab
   * @param {Event} event - The triggering event
   * @param {HTMLElement} target - The target element
   */
  static #onToggleEmptySlots(event, target) {
    const section = target.closest('[data-tab="equipment"]');
    section.classList.toggle("hide-empty-slots");
  }

  /**
   * Consume one charge from a magical item and send chat warning if depleted.
   * @param {Event} event - The triggering event
   * @param {HTMLElement} target - The target element
   */
  static async #onUseCharge(event, target) {
    event.preventDefault();
    const itemId = target.closest("[data-item-id]")?.dataset.itemId;
    if (!itemId) return;
    const item = this.document.items.get(itemId);
    if (!item) return;

    const itemName = item.name;
    const result = await item.system.use();

    if (result === "destroyed") {
      const content = await foundry.applications.handlebars.renderTemplate(
        "systems/fvtt-warhero/templates/chat-charge-result.html",
        {
          actorImg: this.actor.img,
          alias: this.actor.name,
          itemName,
          subtitle: game.i18n.localize("WH.ui.equipment"),
          message: game.i18n.format("WH.chat.itemdestroyed", { item: itemName }),
        }
      );
      await WarheroUtility.createChatWithRollMode(this.actor.name, { content });
      this.render();
      return;
    }

    if (result === "consumed" || result === "depleted") {
      const content = await foundry.applications.handlebars.renderTemplate(
        "systems/fvtt-warhero/templates/chat-charge-result.html",
        {
          actorImg: this.actor.img,
          alias: this.actor.name,
          itemName,
          subtitle: game.i18n.localize("WH.ui.equipment"),
          message: game.i18n.localize("WH.chat.chargeused"),
        }
      );
      await WarheroUtility.createChatWithRollMode(this.actor.name, { content });

      if (result === "depleted") {
        const depletedContent = await foundry.applications.handlebars.renderTemplate(
          "systems/fvtt-warhero/templates/chat-charge-result.html",
          {
            actorImg: this.actor.img,
            alias: this.actor.name,
            itemName,
            subtitle: game.i18n.localize("WH.ui.equipment"),
            message: game.i18n.localize("WH.chat.chargedepleted"),
          }
        );
        await WarheroUtility.createChatWithRollMode(this.actor.name, { content: depletedContent });
      }

      this.render();
    }
  }

  static async #onConsumeItem(event, target) {
    event.preventDefault();
    const itemId = target.closest("[data-item-id]")?.dataset.itemId;
    if (!itemId) return;
    const item = this.document.items.get(itemId);
    if (!item || item.system.quantity <= 0) return;

    const itemName = item.name;
    const newQuantity = item.system.quantity - 1;

    if (newQuantity <= 0) {
      const destroy = await foundry.applications.api.DialogV2.confirm({
        window: { title: game.i18n.format("WH.ui.consumeTitle", { item: itemName }) },
        content: `<p>${game.i18n.format("WH.ui.consumeLast", { item: itemName })}</p>`,
        yes: { label: game.i18n.localize("WH.ui.consumeDestroy"), callback: () => true },
        no: { label: game.i18n.localize("WH.ui.consumeKeep"), callback: () => false },
        rejectClose: false,
        modal: true
      });

      if (destroy) {
        await item.delete();
      } else {
        await item.update({ "system.quantity": 0 });
      }
    } else {
      await item.update({ "system.quantity": newQuantity });
    }

    const content = await foundry.applications.handlebars.renderTemplate(
      "systems/fvtt-warhero/templates/chat-charge-result.html",
      {
        actorImg: this.actor.img,
        alias: this.actor.name,
        itemName,
        subtitle: game.i18n.localize("WH.ui.equipment"),
        message: game.i18n.format("WH.chat.itemconsumed", { item: itemName })
      }
    );
    await WarheroUtility.createChatWithRollMode(this.actor.name, { content });
  }

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);
    this.element.addEventListener("input", WarheroCharacterSheet.#onFilterEquipment.bind(this));
    this.element.addEventListener("change", WarheroCharacterSheet.#onFilterEquipment.bind(this));
    this.element.addEventListener("click", WarheroCharacterSheet.#onClearFilterSearch.bind(this));
    this.element.addEventListener("input", WarheroCharacterSheet.#onFilterSkillsPowers.bind(this));
    this.element.addEventListener("change", WarheroCharacterSheet.#onFilterSkillsPowers.bind(this));
  }

  /**
   * Filter equipment items by search text, type, equipped status, and magical status.
   */
  static #onFilterEquipment(event) {
    const target = event.target;
    if (!target.matches(".item-filter-search, .item-filter-equipped, .item-filter-magical, .item-filter-has-charge, .item-filter-unidentified, .item-filter-type")) return;
    const section = target.closest('[data-tab="equipment"]');
    if (!section) return;

    const search = (section.querySelector(".item-filter-search")?.value || "").toLowerCase();
    const filterType = section.querySelector(".item-filter-type")?.value || "";
    const showEquipped = section.querySelector(".item-filter-equipped")?.checked || false;
    const showHasCharge = section.querySelector(".item-filter-has-charge")?.checked || false;
    const showMagical = section.querySelector(".item-filter-magical")?.checked || false;
    const showUnidentified = section.querySelector(".item-filter-unidentified")?.checked || false;
    const hasFilters = search || filterType || showEquipped || showHasCharge || showMagical || showUnidentified;

    for (const row of section.querySelectorAll("[data-item-id]")) {
      if (!hasFilters) {
        row.classList.remove("item-hidden");
        continue;
      }
      let visible = true;
      if (search) {
        const name = (row.dataset.itemName || "").toLowerCase();
        if (!name.includes(search)) visible = false;
      }
      if (visible && filterType && row.dataset.filterType !== filterType) visible = false;
      if (visible && showEquipped && row.dataset.filterEquipped !== "true") visible = false;
      if (visible && showHasCharge && row.dataset.filterHasCharge !== "true") visible = false;
      if (visible && showMagical && row.dataset.filterMagical !== "true") visible = false;
      if (visible && showUnidentified && row.dataset.filterUnidentified !== "true") visible = false;
      row.classList.toggle("item-hidden", !visible);
    }
  }

  /**
   * Click on the clear icon → reset search and re-run filter.
   */
  static #onClearFilterSearch(event) {
    const target = event.target;
    if (!target.matches(".item-filter-clear")) return;
    const section = target.closest('[data-tab]');
    if (!section) return;
    const input = section.querySelector(".item-filter-search");
    if (input) {
      input.value = "";
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }


  /**
   * Filter skills/powers by search text and hide passive skills.
   */
  static #onFilterSkillsPowers(event) {
    const target = event.target;
    if (!target.matches(".item-filter-search, .item-filter-passive, .item-filter-category")) return;
    const section = target.closest('[data-tab="skills"], [data-tab="powers"]');
    if (!section) return;

    const search = (section.querySelector(".item-filter-search")?.value || "").toLowerCase();
    const filterCategory = section.querySelector(".item-filter-category")?.value || "";
    const hidePassive = section.querySelector(".item-filter-passive")?.checked || false;
    const hasFilters = search || filterCategory || hidePassive;

    for (const row of section.querySelectorAll("[data-item-id]")) {
      if (!hasFilters) {
        row.classList.remove("item-hidden");
        continue;
      }
      let visible = true;
      if (search) {
        const name = (row.dataset.itemName || "").toLowerCase();
        if (!name.includes(search)) visible = false;
      }
      if (visible && filterCategory && row.dataset.filterCategory !== filterCategory) visible = false;
      if (visible && hidePassive && row.dataset.filterPassive === "true") visible = false;
      row.classList.toggle("item-hidden", !visible);
    }
  }

  /**
   * Handle drop events for item relocation between equipment slots.
   * - Existing actor item dropped on a different slot → update slotlocation
   * - New item (compendium/sidebar) dropped on a slot → create with that slot
   * - Otherwise → existing creation behavior
   */
  async _onDrop(event) {
    const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event)

    if (data.type === "Item") {
      const item = await fromUuid(data.uuid)
      if (!item) return false

      const slotElement = event.target.closest("[data-slot]");
      const targetSlot = slotElement?.dataset.slot;

      // Existing actor item → relocate if dropped on a different slot
      if (item.parent === this.document) {
        if (targetSlot && item.system.slotlocation !== undefined && item.system.slotlocation !== targetSlot) {
          await item.update({ "system.slotlocation": targetSlot });
          this.render();
        }
        return false;
      }

      // New item from compendium/sidebar — apply race check then create
      if (item.type === "race") {
        const existingRace = this.actor.items.find(i => i.type === "race")
        if (existingRace) {
          ui.notifications.error(game.i18n.localize("WH.ui.errorOnlyOneRace"))
          return false
        }
      }

      const itemData = item.toObject();
      if (targetSlot && itemData.system?.slotlocation !== undefined) {
        itemData.system.slotlocation = targetSlot;
      }
      return this.document.createEmbeddedDocuments("Item", [itemData], { renderSheet: false });
    }

    return false
  }

  /**
   * Highlight the equipment slot being hovered during a drag.
   */
  _onDragOver(event) {
    this.element.querySelectorAll("[data-slot]").forEach(el => el.classList.remove("drag-over"));
    const slot = event.target.closest("[data-slot]");
    if (slot) slot.classList.add("drag-over");
  }
}
