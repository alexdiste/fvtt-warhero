/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
import { WarheroActorSheet } from "./warhero-actor-sheet.js";
import { WarheroUtility } from "../warhero-utility.js";

/* -------------------------------------------- */
export class WarheroPartySheet extends WarheroActorSheet {

  /** @override */
  static get defaultOptions() {

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["warhero-rpg", "sheet", "actor"],
      template: "systems/fvtt-warhero/templates/party-sheet.html",
      width: 640,
      height: 720,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats" }],
      dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }],
      editScore: true
    });
  }

  /* -------------------------------------------- */
  async getData() {

    const objectData = foundry.utils.duplicate(this.object.system)

    let formData = {
      title: this.title,
      id: this.actor.id,
      type: this.actor.type,
      img: this.actor.img,
      name: this.actor.name,
      editable: this.isEditable,
      cssClass: this.isEditable ? "editable" : "locked",
      system: objectData,
      limited: this.object.limited,
      totalMoney: this.actor.computeTotalMoney(),
      equipments: foundry.utils.duplicate(this.actor.getEquipmentsOnly()),
      //moneys: foundry.utils.duplicate(this.actor.getMoneys()),
      description: await TextEditor.enrichHTML(this.object.system.biodata.description, {async: true}),
      notes: await TextEditor.enrichHTML(this.object.system.biodata.notes, {async: true}),
      options: this.options,
      owner: this.document.isOwner,
      editScore: this.options.editScore,
      isGM: game.user.isGM
    }
    formData.partySlots = this.actor.buildPartySlots()

    this.formData = formData
    console.log("PARTY : ", formData, this.object);
    return formData;
  }
}