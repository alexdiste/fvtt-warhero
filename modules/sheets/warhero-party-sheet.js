import WarheroActorSheet from "./warhero-base-actor-sheet.js";
import { WarheroUtility } from "../warhero-utility.js";

/**
 * Warhero Party Sheet Application v2
 * Extends the basic ApplicationV2 with character-specific functionality
 * @extends {foundry.applications.sheets.ActorSheetV2}
 */
export class WarheroPartySheet extends WarheroActorSheet {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["party"],
    tag: "form",
    position: {
      width: 780,
      height: 780,
    },
    window: {
    },
    actions: {
      "use-charge": WarheroPartySheet.#onUseCharge,
    },
  };

  /** @override */
  static PARTS = {
    header: {
      template: "systems/fvtt-warhero/templates/actors/party-sheet-header.hbs",
    },
    tabs: {
      template: "templates/generic/tab-navigation.hbs",
    },
    equipment: {
      template: "systems/fvtt-warhero/templates/actors/partial-party-equipment.hbs",
    },
    members: {
      template: "systems/fvtt-warhero/templates/actors/partial-party-members.hbs",
    },
    biography: {
      template: "systems/fvtt-warhero/templates/actors/partial-party-biography.hbs",
    }
  };

  /** @override */
  tabGroups = {
    sheet: "members",
  }

  #getTabs() {
    const tabs = {
      members: { id: "members", group: "sheet", icon: "fa-solid fa-users", label: "WH.ui.members" },
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
    const objectData = foundry.utils.deepClone(doc.system)

    const members = this.constructor.#parseJsonField(objectData.biodata.members)
    const relations = this.constructor.#parseJsonField(objectData.biodata.relationships)
    objectData.biodata.members = members
    objectData.biodata.relationships = relations

    const relationLabels = {
      neutral: game.i18n.localize("WH.ui.neutral"),
      allied: game.i18n.localize("WH.ui.allied"),
      hostile: game.i18n.localize("WH.ui.hostile"),
    }
    const relationsWithLabels = relations.map((relation) => ({
      ...relation,
      relationLabel: relationLabels[relation.relation] ?? relation.relation ?? "",
      visible: !!relation.visible,
    }))
    objectData.biodata.relationships = relationsWithLabels

    const memberAttributeColumns = this.constructor.#parseAttributeMapping(objectData.biodata.memberAttributes)
    const enrichedMembers = await this.constructor.#enrichMembers(members, memberAttributeColumns)
    const memberAttributeMaxima = this.constructor.#computeAttributeMaximums(enrichedMembers, memberAttributeColumns)
    const memberMoney = await this.actor.computeMembersTotalMoney()

    const visibleRelations = relationsWithLabels.filter((relation) => relation.visible)

    let formData = {
      title: this.title,
      id: this.actor.id,
      type: this.actor.type,
      img: this.actor.img,
      name: this.actor.name,
      editable: this.isEditable,
      cssClass: this.isEditable ? "editable" : "locked",
      system: objectData,
      totalMoney: this.actor.computeTotalMoney(),
      memberMoney,
      memberAttributeColumns,
      memberAttributeMaxima,
      members: enrichedMembers,
      relations: relationsWithLabels,
      visibleRelations,
      equipments: foundry.utils.deepClone(this.actor.getEquipmentsOnly()),
      enrichedDescription: await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.document.system.biodata.description, { async: true }),
      enrichedNotes: await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.document.system.biodata.notes, { async: true }),
      enrichedGmNotes: await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.document.system.biodata.gmnotes, { async: true }),
      options: this.options,
      owner: this.document.isOwner,
      editScore: this.options.editScore,
      isGM: game.user.isGM
    }
    formData.partySlots = this.actor.buildPartySlots()

    // Add filter flags for item search
    for (const container of Object.values(formData.partySlots)) {
      for (const item of container.content) {
        item._filterMagical = item.system.magiccharge && item.system.magiccharge !== "notapplicable";
        item._filterEquipped = item.system.equipped;
      }
    }

    // merge context and formData
    Object.assign(context, formData)

    return context
  }

  /** @override */
  async _preparePartContext(partId, context) {
    context.systemFields = this.document.system.schema.fields
    switch (partId) {
      case "equipment":
        context.tab = context.tabs.equipment
        break
      case "members":
        context.tab = context.tabs.members
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

  async _onDrop(event) {
    //if (!this.isEditable || !this.isEditMode) return
    const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event)

    if (data.type === "Item") {
      const item = await fromUuid(data.uuid)
      return super._onDropItem(item)
    }

    if (data.type === "Actor") {
      const actor = await fromUuid(data.uuid)
      if (!actor) return
      if (actor.type === "character") {
        const members = this.constructor.#parseJsonField(this.document.system.biodata.members)
        if (members.some((m) => m.uuid === actor.uuid)) {
          return ui.notifications.warn(game.i18n.localize("WH.ui.memberAlreadyAdded"))
        }
        members.push({ uuid: actor.uuid, id: actor.id, name: actor.name, img: actor.img, type: actor.type })
        return this.document.update({ "system.biodata.members": JSON.stringify(members) })
      }
      if (actor.type === "party") {
        const relations = this.constructor.#parseJsonField(this.document.system.biodata.relationships)
        if (relations.some((r) => r.uuid === actor.uuid)) {
          return ui.notifications.warn(game.i18n.localize("WH.ui.relationAlreadyAdded"))
        }
        relations.push({ uuid: actor.uuid, id: actor.id, name: actor.name, img: actor.img, type: actor.type, relation: "neutral", visible: false })
        return this.document.update({ "system.biodata.relationships": JSON.stringify(relations) })
      }
    }

  }

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);
    this.element.addEventListener("input", WarheroPartySheet.#onFilterEquipment.bind(this));
    this.element.addEventListener("change", WarheroPartySheet.#onFilterEquipment.bind(this));
    this.element.addEventListener("click", WarheroPartySheet.#onClearFilterSearch.bind(this));
  }

  /**
   * Filter equipment items by search text, type, equipped status, and magical status.
   */
  static #onFilterEquipment(event) {
    const target = event.target;
    if (!target.matches(".item-filter-search, .item-filter-equipped, .item-filter-magical, .item-filter-type")) return;
    const section = target.closest(".party-equipment");
    if (!section) return;

    const search = (section.querySelector(".item-filter-search")?.value || "").toLowerCase();
    const filterType = section.querySelector(".item-filter-type")?.value || "";
    const showEquipped = section.querySelector(".item-filter-equipped")?.checked || false;
    const showMagical = section.querySelector(".item-filter-magical")?.checked || false;
    const hasFilters = search || filterType || showEquipped || showMagical;

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
      if (visible && showMagical && row.dataset.filterMagical !== "true") visible = false;
      row.classList.toggle("item-hidden", !visible);
    }
  }

  /**
   * Click on the clear icon → reset search and re-run filter.
   */
  static #onClearFilterSearch(event) {
    const target = event.target;
    if (!target.matches(".item-filter-clear")) return;
    const section = target.closest(".party-equipment");
    if (!section) return;
    const input = section.querySelector(".item-filter-search");
    if (input) {
      input.value = "";
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  /**
   * Consume one charge from a magical item and send chat warning if depleted.
   */
  static async #onUseCharge(event, target) {
    event.preventDefault();
    const itemId = target.closest("[data-item-id]")?.dataset.itemId;
    if (!itemId) return;
    const item = this.document.items.get(itemId);
    if (!item) return;

    const system = item.system;
    if (system.magiccharge === "notapplicable" || system.chargevalue <= 0) return;

    const newValue = system.chargevalue - 1;
    await item.update({ "system.chargevalue": newValue });

    if (newValue <= 0) {
      const content = await foundry.applications.handlebars.renderTemplate(
        "systems/fvtt-warhero/templates/chat-charge-depleted.html",
        {
          actorImg: this.actor.img,
          alias: this.actor.name,
          itemName: item.name,
        }
      );
      await WarheroUtility.createChatWithRollMode(this.actor.name, { content });
    }

    this.render();
  }

  static #parseJsonField(value) {
    if (Array.isArray(value)) return value
    if (typeof value !== "string") return []
    try {
      return JSON.parse(value) || []
    } catch {
      return []
    }
  }

  static async #resolveActorRef(ref) {
    if (!ref?.uuid) return null
    try {
      return await fromUuid(ref.uuid)
    } catch {
      return null
    }
  }

  static async #computeReferencedActorsMoney(entries) {
    const sums = await Promise.all(entries.map(async (entry) => {
      const actor = await this.#resolveActorRef(entry)
      return actor?.computeTotalMoney?.() || 0
    }))
    return sums.reduce((total, value) => total + value, 0)
  }

  static #parseAttributeMapping(value) {
    const defaultMapping = [
      { label: "Fisico", path: "statistics.str.value" },
      { label: "Istinto", path: "statistics.dex.value" },
      { label: "Mente", path: "statistics.min.value" },
      { label: "TS Fis", path: "statistics.str.save" },
      { label: "TS Ist", path: "statistics.dex.save" },
      { label: "TS Men", path: "statistics.min.save" },
      { label: "Conoscenze", path: "attributes.knowledge.value" },
      { label: "Parata", path: "secondary.parrybonustotal.value" },
      { label: "RD", path: "secondary.drbonustotal.value" },
      { label: "Iniziativa", path: "attributes.ini.value" }
    ]
    if (!value || typeof value !== "string") return defaultMapping
    const entries = value.split(",").map(s => s.trim()).filter(Boolean)
    if (!entries.length) return defaultMapping
    return entries.map((entry) => {
      const separator = entry.includes("=") ? "=" : entry.includes(":") ? ":" : null
      if (!separator) {
        const label = entry.trim()
        return { label, path: entry.trim() }
      }
      const [label, path] = entry.split(separator).map(s => s.trim())
      return { label: label || path, path: path || label }
    })
  }

  static async #enrichMembers(members, columns) {
    return await Promise.all(members.map(async (member) => {
      const actor = await this.#resolveActorRef(member)
      const mappedAttributes = columns.map((column) => {
        if (!actor || !column?.path) return "-"
        const path = column.path.replace(/^system\./, "")
        const value = foundry.utils.getProperty(actor.system, path)
        return value !== undefined && value !== null ? value : "-"
      })
      return {
        uuid: member.uuid,
        id: member.id,
        name: member.name,
        img: member.img,
        type: member.type,
        mappedAttributes,
      }
    }))
  }

  static #computeAttributeMaximums(members, columns) {
    return columns.map((column, index) => {
      let best = { value: "-", actor: "-" }
      for (const member of members) {
        const rawValue = member.mappedAttributes?.[index]
        if (rawValue === undefined || rawValue === null || rawValue === "-") continue
        const value = typeof rawValue === "object" ? JSON.stringify(rawValue) : rawValue
        const numericValue = parseFloat(value)
        const valueIsNumeric = typeof value === "number" || (!Number.isNaN(numericValue) && String(value).trim() !== "")
        const bestNumeric = parseFloat(best.value)
        const bestIsNumeric = !Number.isNaN(bestNumeric) && String(best.value).trim() !== ""

        if (best.value === "-") {
          best = { value, actor: member.name }
          continue
        }

        if (valueIsNumeric && bestIsNumeric) {
          if (numericValue > bestNumeric) {
            best = { value, actor: member.name }
          }
        } else if (valueIsNumeric && !bestIsNumeric) {
          best = { value, actor: member.name }
        } else if (!valueIsNumeric && !bestIsNumeric) {
          if (String(value) > String(best.value)) {
            best = { value, actor: member.name }
          }
        }
      }
      return {
        label: column.label,
        value: best.value,
        actor: best.actor,
      }
    })
  }
}
