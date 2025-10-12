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
      width: 720,
      height: 720,
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
      equipments: foundry.utils.duplicate(this.actor.getEquipmentsOnly()),
      enrichedDescription: await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.document.system.biodata.description, { async: true }),
      enrichedNotes: await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.document.system.biodata.notes, { async: true }),
      options: this.options,
      owner: this.document.isOwner,
      editScore: this.options.editScore,
      isGM: game.user.isGM
    }
    formData.partySlots = this.actor.buildPartySlots()

    // merge context and formData
    Object.assign(context, formData)

    console.log("WarheroPartySheet | Context", context)
    return context
  }

  /** @override */
  async _preparePartContext(partId, context) {
    const doc = this.document
    context.systemFields = this.document.system.schema.fields
    switch (partId) {
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