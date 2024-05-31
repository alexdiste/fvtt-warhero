/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
import { WarheroActorSheet } from "./warhero-actor-sheet.js";
import { WarheroUtility } from "./warhero-utility.js";

/* -------------------------------------------- */
export class WarheroNPCSheet extends WarheroActorSheet {

  /** @override */
  static get defaultOptions() {

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["warhero-rpg", "sheet", "actor"],
      template: "systems/fvtt-warhero/templates/monster-sheet.html",
      width: 640,
      height: 720,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats" }],
      dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }],
      editScore: true
    });
  }

}
