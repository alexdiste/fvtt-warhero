const { HandlebarsApplicationMixin } = foundry.applications.api
import { WarheroUtility } from "../warhero-utility.js";

export default class WarheroActorSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2) {
  /**
   * Different sheet modes.r
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
    classes: ["fvtt-warhero", "sheet", "actor"],
    position: {
      width: 1400,
      height: "auto",
    },
    form: {
      submitOnChange: true,
    },
    window: {
      resizable: true,
    },
    dragDrop: [{ dragSelector: '[data-drag="true"], .rollable, .list-item', dropSelector: null }],
    actions: {
      editImage: WarheroActorSheet.#onEditImage,
      toggleSheet: WarheroActorSheet.#onToggleSheet,
      "item-edit": WarheroActorSheet.#onItemEdit,
      "item-delete": WarheroActorSheet.#onItemDelete,
      "item-add": WarheroActorSheet.#onItemAdd,
      "effect-delete": WarheroActorSheet.#onEffectDelete,
      "effect-toggle": WarheroActorSheet.#onEffectToggle,
      "create-effect": WarheroActorSheet.#onCreateActiveEffect,
      "quantity-minus": WarheroActorSheet.#onQuantityMinus,
      "quantity-plus": WarheroActorSheet.#onQuantityPlus,
      toChat: WarheroActorSheet.#toChat,

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
      actor: this.document,
      system: this.document.system,
      source: this.document.toObject(),
      isEditMode: this.isEditMode,
      isPlayMode: this.isPlayMode,
      isEditable: this.isEditable,
    }
    return context
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
        dragover: this._onDragOver.bind(this),
        drop: this._onDrop.bind(this),
      }
      return new foundry.applications.ux.DragDrop.implementation(d)
    })
  }

  /**
   * Callback actions which occur when a dragged element is dropped on a target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  async _onDrop(event) {
  }


  /**
   * Define whether a user is able to begin a dragstart workflow for a given drag selector
   * @param {string} selector       The candidate HTML selector for dragging
   * @returns {boolean}             Can the current user drag this selector?
   * @protected
   */
  _canDragStart(selector) {
    return true; //this.isEditable
  }

  /**
   * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
   * @param {string} selector       The candidate HTML selector for the drop target
   * @returns {boolean}             Can the current user drop on this selector?
   * @protected
   */
  _canDragDrop(selector) {
    return true //this.isEditable && this.document.isOwner
  }

  /**
   * Callback actions which occur when a dragged element is over a drop target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragOver(event) { }

  async _onDropItem(item) {
    console.log("Dropped item", item)
    let itemData = item.toObject()
    await this.document.createEmbeddedDocuments("Item", [itemData], { renderSheet: false })
  }

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
   * @this HellbornActorSheet
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

  static async #toChat(event, target) {
    const itemUuid = target.getAttribute("data-item-uuid")
    const item = fromUuidSync(itemUuid)
    if (!item) return
    let content = ""
    if (item.type === "perk") {
      content = await foundry.applications.handlebars.renderTemplate("systems/fvtt-hellborn/templates/chat-perk.hbs", item.toObject())
    }
    if (item.type === "malefica") {
      content = await foundry.applications.handlebars.renderTemplate("systems/fvtt-hellborn/templates/chat-malefica.hbs", item.toObject())
    }
    if (item.type === "ritual") {
      content = await foundry.applications.handlebars.renderTemplate("systems/fvtt-hellborn/templates/chat-ritual.hbs", item.toObject())
    }
    if (item.type === "species-trait") {
      content = await foundry.applications.handlebars.renderTemplate("systems/fvtt-hellborn/templates/chat-trait.hbs", item.toObject())
    }
    if (item.type === "tarot") {
      content = await foundry.applications.handlebars.renderTemplate("systems/fvtt-hellborn/templates/chat-tarot.hbs", item.toObject())
    }
    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: content,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
    }
    ChatMessage.create(chatData, { renderSheet: false })

  }

  /**
   * Edit an existing item within the Actor
   * Start with the uuid, if it's not found, fallback to the id (as Embedded item in the actor)
   * @this CthulhuEternalCharacterSheet
   * @param {PointerEvent} event The originating click event
   * @param {HTMLElement} target the capturing HTML element which defined a [data-action]
   */
  static async #onItemEdit(event, target) {
    const li = $(event.target).parents(".item")
    let itemId = li.data("item-id")
    let item = this.actor.items.get(itemId);
    if (!item) {
      item = this.actor.effects.get(itemId);
    }
    item.sheet.render(true);
  }

  /**
   * Delete an existing talent within the Actor
   * Use the uuid to display the talent sheet
   * @param {PointerEvent} event The originating click event
   * @param {HTMLElement} target the capturing HTML element which defined a [data-action]
   */
  static async #onItemDelete(event, target) {
    const li = $(target).parents(".item")
    WarheroUtility.confirmDelete(this, li, "Item")
  }

  static async #onEffectDelete(event, target) {
    const li = $(target).parents(".item")
    WarheroUtility.confirmDelete(this, li, "ActiveEffect")
  }

  static async #onEffectToggle(event, target) {
    const li = $(target).parents(".item");
    const effectId = li.data("item-id");
    const effect = this.actor.effects.get(effectId);
    if (!effect) return;
    await effect.update({ disabled: !effect.disabled });
  }

  static async #onCreateActiveEffect(event) {
    event.preventDefault();
    const a = event.currentTarget;
    const li = a.closest("li");
    let owner = this.document;

    let effect = await ActiveEffect.implementation.create(
      {
        name: game.i18n.format("DOCUMENT.New", { type: game.i18n.localize("DOCUMENT.ActiveEffect") }),
        transfer: false,
        img: "icons/svg/aura.svg",
        origin: owner.uuid,
        //"duration.rounds": 10,
        disabled: false,
        changes: [{}],
      },
      { parent: owner },
    );
    await owner.createEmbeddedDocuments("ActiveEffect", [effect.toObject()]);
  }

  static async #onItemAdd(event, target) {
    const dataType = target.getAttribute("data-type")
    const slotKey = target.getAttribute("data-slot")
    this.actor.createEmbeddedDocuments('Item', [{ name: "NewItem", type: dataType, system: { slotlocation: slotKey } }], { renderSheet: true })
  }

  static async #onQuantityMinus(event, target) {
    const li = $(target).parents(".item");
    this.actor.incDecQuantity(li.data("item-id"), -1);
  }

  static async #onQuantityPlus(event, target) {
    const li = $(target).parents(".item");
    this.actor.incDecQuantity(li.data("item-id"), +1);
  }
  // #endregion
}
