import { WarheroUtility } from "../warhero-utility.js";

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class WarheroItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["fvtt-warhero", "sheet", "item"],
      template: "systems/fvtt-warhero/templates/item-sheet.html",
      dragDrop: [{ dragSelector: null, dropSelector: null }],
      width: 620,
      height: 550,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}]
    });
  }

  /* -------------------------------------------- */
  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();
    // Add "Post to chat" button
    // We previously restricted this to GM and editable items only. If you ever find this comment because it broke something: eh, sorry!
    buttons.unshift(
      {
        class: "post",
        icon: "fas fa-comment",
        onclick: ev => { }
      })
    return buttons
  }

  /* -------------------------------------------- */
  /** @override */
  setPosition(options = {}) {
    const position = super.setPosition(options);
    const sheetBody = this.element.find(".sheet-body");
    const bodyHeight = position.height - 192;
    sheetBody.css("height", bodyHeight);
    if (this.item.type.includes('weapon')) {
      position.width = 640;
    }
    return position;
  }

  /* -------------------------------------------- */
  async getData() {

    let objectData = foundry.utils.duplicate(this.object.system)

    let itemData = objectData
    let formData = {
      title: this.title,
      id: this.id,
      type: this.object.type,
      img: this.object.img,
      name: this.object.name,
      editable: this.isEditable,
      cssClass: this.isEditable ? "editable" : "locked",
      config: game.system.warhero.config,
      description: await TextEditor.enrichHTML(this.object.system.description, {async: true}),
      system: itemData,
      statistics: WarheroUtility.getActorStats(),
      limited: this.object.limited,
      options: this.options,
      owner: this.document.isOwner,
      isGM: game.user.isGM
    }
    this.options.editable = !(this.object.origin == "embeddedItem");
    console.log("ITEM DATA", formData, this);
    return formData;
  }


  /* -------------------------------------------- */
  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();
    buttons.unshift({
      class: "post",
      icon: "fas fa-comment",
      onclick: ev => this.postItem()
    });
    return buttons
  }

  /* -------------------------------------------- */
  postItem() {
    let chatData = foundry.utils.duplicate(WarheroUtility.data(this.item));
    if (this.actor) {
      chatData.actor = { id: this.actor.id };
    }
    // Don't post any image for the item (which would leave a large gap) if the default image is used
    if (chatData.img.includes("/blank.png")) {
      chatData.img = null;
    }
    // JSON object for easy creation
    chatData.jsondata = JSON.stringify(
      {
        compendium: "postedItem",
        payload: chatData,
      });

    renderTemplate('systems/fvtt-warhero/templates/post-item.html', chatData).then(html => {
      let chatOptions = WarheroUtility.chatDataSetup(html);
      ChatMessage.create(chatOptions)
    });
  }

  /* -------------------------------------------- */
  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;


    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.object.options.actor.getOwnedItem(li.data("item-id"));
      item.sheet.render(true);
    });
    html.find('.delete-subitem').click(ev => {
      this.deleteSubitem(ev);
    });

    // Update Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      let itemId = li.data("item-id");
      let itemType = li.data("item-type");
    });
  }



  /* -------------------------------------------- */
  get template() {
    let type = this.item.type;
    return `systems/fvtt-warhero/templates/item-${type}-sheet.html`;
  }

  /* -------------------------------------------- */
  /** @override */
  _updateObject(event, formData) {
    return this.object.update(formData)
  }
}