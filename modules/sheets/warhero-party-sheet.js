import WarheroActorSheet from "./warhero-base-actor-sheet.js";

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
    }
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
    sheet: "equipment",
  }

  #getTabs() {
    const tabs = {
      equipment: { id: "equipment", group: "sheet", icon: "fa-solid fa-shapes", label: "WH.ui.equipment" },
      members: { id: "members", group: "sheet", icon: "fa-solid fa-users", label: "WH.ui.members" },
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
    const objectData = foundry.utils.duplicate(doc.system)

    const members = this.constructor.#parseJsonField(objectData.biodata.members)
    const relations = this.constructor.#parseJsonField(objectData.biodata.relationships)
    objectData.biodata.members = members
    objectData.biodata.relationships = relations

    const memberMoney = await this.constructor.#computeReferencedActorsMoney([...members, ...relations])

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
      members,
      relations,
      equipments: foundry.utils.duplicate(this.actor.getEquipmentsOnly()),
      enrichedDescription: await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.document.system.biodata.description, { async: true }),
      enrichedNotes: await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.document.system.biodata.notes, { async: true }),
      enrichedGmNotes: await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.document.system.biodata.gmnotes, { async: true }),
      options: this.options,
      owner: this.document.isOwner,
      editScore: this.options.editScore,
      isGM: game.user.isGM
    }
    formData.partySlots = this.actor.buildPartySlots()

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
        relations.push({ uuid: actor.uuid, id: actor.id, name: actor.name, img: actor.img, type: actor.type, relation: "neutral" })
        return this.document.update({ "system.biodata.relationships": JSON.stringify(relations) })
      }
    }

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
}
