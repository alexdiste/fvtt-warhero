const { HandlebarsApplicationMixin } = foundry.applications.api
import { WarheroUtility } from "../warhero-utility.js"

export class WarheroBaseItemSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {
  /**
   * Different sheet modes.
   * @enum {number}
   */
  static SHEET_MODES = { EDIT: 0, PLAY: 1 }

  constructor(options = {}) {
    super(options)
    this.#dragDrop = this.#createDragDropHandlers()
  }

  #dragDrop

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["fvtt-warhero", "item"],
    position: {
      width: 600,
      height: "auto",
    },
    form: {
      submitOnChange: true,
    },
    window: {
      resizable: true,
    },
    dragDrop: [{ dragSelector: "[data-drag]", dropSelector: null }],
    actions: {
      toggleSheet: WarheroBaseItemSheet.#onToggleSheet,
      editImage: WarheroBaseItemSheet.#onEditImage,
      "post-item": WarheroBaseItemSheet.#onPostItem,
      "show-image": WarheroBaseItemSheet.#onShowImage,
      "create-effect": WarheroBaseItemSheet.#onCreateActiveEffect,
      "effect-edit": WarheroBaseItemSheet.#onEffectEdit,
    },
  }

  /**
   * The current sheet mode.
   * @type {number}
   */
  _sheetMode = this.constructor.SHEET_MODES.PLAY

  /**
   * Is the sheet currently in 'Play' mode?
   * @type {boolean}
   */
  get isPlayMode() {
    return this._sheetMode === this.constructor.SHEET_MODES.PLAY
  }

  /**
   * Is the sheet currently in 'Edit' mode?
   * @type {boolean}
   */
  get isEditMode() {
    return this._sheetMode === this.constructor.SHEET_MODES.EDIT
  }

  /** @override */
  async _prepareContext() {
    const context = {
      fields: this.document.schema.fields,
      systemFields: this.document.system.schema.fields,
      item: this.document,
      system: this.document.system,
      source: this.document.toObject(),
      config: game.system.warhero.config,
      statistics: WarheroUtility.getActorStats(),
      enrichedDescription: await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.document.system.description, { async: true }),
      effects: this.document.effects.map(eff => eff.toObject()),
      isEditMode: this.isEditMode,
      isPlayMode: this.isPlayMode,
      isEditable: this.isEditable,
      options: this.options,
      owner: this.document.isOwner,
      isGM: game.user.isGM
    }
    context.tabs = this.#getTabs()
    return context
  }

  /**
   * Prepare an array of form header tabs.
   * @returns {Record<string, Partial<ApplicationTab>>}
   */
  #getTabs() {
    const tabs = {
      description: { id: "description", group: "sheet", icon: "fa-solid fa-compass", label: "WH.ui.description" },
      details: { id: "details", group: "sheet", icon: "fa-solid fa-graduation-cap", label: "WH.ui.details" },
    }
    if (this.document.type === "armor") {
      tabs.effects = { id: "effects", itemType: "effect", group: "sheet", icon: "fa-solid fa-heart-pulse", label: "WH.ui.effects" }
    }

    for (const v of Object.values(tabs)) {
      v.active = this.tabGroups[v.group] === v.id
      v.cssClass = v.active ? "active" : ""
    }
    return tabs
  }

  /** @override */
  async _preparePartContext(partId, context) {
    const doc = this.document
    context.systemFields = this.document.system.schema.fields
    switch (partId) {
      case "description":
        context.tab = context.tabs.description
        break
      case "details":
        context.tab = context.tabs.details
        break;
      case "effects":
        context.tab = context.tabs.effects
        break;
    }
    return context
  }

  /**
   * Handle posting skill to chat
   * @param {Event} event - The triggering event
   * @param {HTMLElement} target - The target element
   */
  static async #onPostItem(event, target) {
    event.preventDefault();

    const doc = this.document;
    let chatData = foundry.utils.duplicate(doc.toObject());

    if (doc.actor) {
      chatData.actor = { id: doc.actor.id };
    }

    // Don't post default image
    if (chatData.img.includes("/blank.png")) {
      chatData.img = null;
    }

    // Create JSON data for easy recreation
    chatData.jsondata = JSON.stringify({
      compendium: "postedItem",
      payload: chatData,
    });

    const html = await renderTemplate('systems/fvtt-warhero/templates/post-item.html', chatData);
    const chatOptions = WarheroUtility.chatDataSetup(html);
    await ChatMessage.create(chatOptions);
  }

  /**
    * Handle showing skill image
    * @param {Event} event - The triggering event
    * @param {HTMLElement} target - The target element
    */
  static async #onShowImage(event, target) {
    event.preventDefault();

    const doc = this.document;
    new ImagePopout(doc.img, {
      title: doc.name,
      uuid: doc.uuid
    }).render(true);
  }

  static async #onCreateActiveEffect(event, target) {
    let owner = this.document;
    const effectData = {
      name: "New Effect",
      img: "icons/svg/aura.svg",
      origin: owner.uuid,
      disabled: false,
      changes: [],
      duration: {},
      flags: {}
    };
    await owner.createEmbeddedDocuments("ActiveEffect", [effectData]);
  }

  static async #onEffectEdit(event, target) {
    const li = $(event.target).parents(".item")
    let effectId = li.data("item-id")
    let effect = this.document.effects.get(effectId);
    console.log("Editing effect", this.document.effects, effect);
    if (!effect) return;
    effect.sheet.render(true);
  }

  /** @override */
  _onRender(context, options) {
    this.#dragDrop.forEach((d) => d.bind(this.element))
  }

  // #region Drag-and-Drop Workflow
  /**
   * Create drag-and-drop workflow handlers for this Application
   * @returns {DragDrop[]}     An array of DragDrop handlers
   * @private
   */
  #createDragDropHandlers() {
    return this.options.dragDrop.map((d) => {
      d.permissions = {
        dragstart: this._canDragStart.bind(this),
        drop: this._canDragDrop.bind(this),
      }
      d.callbacks = {
        dragstart: this._onDragStart.bind(this),
        dragover: this._onDragOver.bind(this),
        drop: this._onDrop.bind(this),
      }
      return new foundry.applications.ux.DragDrop.implementation(d)
    })
  }

  /**
   * Define whether a user is able to begin a dragstart workflow for a given drag selector
   * @param {string} selector       The candidate HTML selector for dragging
   * @returns {boolean}             Can the current user drag this selector?
   * @protected
   */
  _canDragStart(selector) {
    return this.isEditable
  }

  /**
   * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
   * @param {string} selector       The candidate HTML selector for the drop target
   * @returns {boolean}             Can the current user drop on this selector?
   * @protected
   */
  _canDragDrop(selector) {
    return this.isEditable && this.document.isOwner
  }

  /**
   * Callback actions which occur at the beginning of a drag start workflow.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragStart(event) {
    const el = event.currentTarget
    if ("link" in event.target.dataset) return

    // Extract the data you need
    let dragData = null

    if (!dragData) return

    // Set data transfer
    event.dataTransfer.setData("text/plain", JSON.stringify(dragData))
  }

  /**
   * Callback actions which occur when a dragged element is over a drop target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragOver(event) { }

  /**
   * Callback actions which occur when a dragged element is dropped on a target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  async _onDrop(event) { }

  // #endregion

  // #region Actions
  /**
   * Handle toggling between Edit and Play mode.
   * @param {Event} event             The initiating click event.
   * @param {HTMLElement} target      The current target of the event listener.
   */
  static #onToggleSheet(event, target) {
    const modes = this.constructor.SHEET_MODES
    this._sheetMode = this.isEditMode ? modes.PLAY : modes.EDIT
    this.render()
  }

  /**
   * Handle changing a Document's image.
   *
   * @this WarheroBaseItemSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @returns {Promise}
   * @private
   */
  static async #onEditImage(event, target) {
    const attr = target.dataset.edit
    const current = foundry.utils.getProperty(this.document, attr)
    const { img } = this.document.constructor.getDefaultArtwork?.(this.document.toObject()) ?? {}
    const fp = new FilePicker({
      current,
      type: "image",
      redirectToRoot: img ? [img] : [],
      callback: (path) => {
        this.document.update({ [attr]: path })
      },
      top: this.position.top + 40,
      left: this.position.left + 10,
    })
    return fp.browse()
  }
  // #endregion
}
