/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */

import { WarheroUtility } from "../warhero-utility.js";

/* -------------------------------------------- */
export class WarheroActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["fvtt-warhero", "sheet", "actor"],
      template: "systems/fvtt-warhero/templates/actor-sheet.html",
      width: 720,
      height: 720,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "skills" }],
      dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }],
      editScore: true
    });
  }

  /* -------------------------------------------- */
  async getData() {

    const objectData = foundry.utils.duplicate(this.object.system)
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
      limited: this.object.limited,
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
      //moneys: foundry.utils.duplicate(this.actor.getMoneys()),
      description: await TextEditor.enrichHTML(this.object.system.biodata.description, { async: true }),
      notes: await TextEditor.enrichHTML(this.object.system.biodata.notes, { async: true }),
      options: this.options,
      owner: this.document.isOwner,
      editScore: this.options.editScore,
      isGM: game.user.isGM,
      config: game.system.warhero.config
    }
    if (this.actor.type == "party") {
      formData.partySlots = this.actor.buildPartySlots()
    } else {
      formData.equipmentContainers = this.actor.buildEquipmentsSlot()
      formData.bodyContainers = this.actor.buildBodySlot()
    }
    // Dynamic patch
    formData.system.secondary.counterspell.hasmax = false
    // Race mngt
    if (race && race.name) {
      formData.hpprogression = game.system.warhero.config.progressionList[race.system.hpprogresion]
    }
    this.formData = formData
    console.log("PC : ", formData, this.object);
    return formData;
  }


  /* -------------------------------------------- */
  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    html.bind("keydown", function (e) { // Ignore Enter in actores sheet
      if (e.keyCode === 13) return false;
    });

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item")
      let itemId = li.data("item-id")
      const item = this.actor.items.get(itemId);
      item.sheet.render(true);
    });
    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item")
      WarheroUtility.confirmDelete(this, li)
    })
    html.find('.item-add').click(ev => {
      let dataType = $(ev.currentTarget).data("type")
      let slotKey = $(ev.currentTarget).data("slot")
      this.actor.createEmbeddedDocuments('Item', [{ name: "NewItem", type: dataType, system: { slotlocation: slotKey } }], { renderSheet: true })
    })

    html.find('.equip-activate').click(ev => {
      const li = $(ev.currentTarget).parents(".item")
      let itemId = li.data("item-id")
      this.actor.equipActivate(itemId)
    });
    html.find('.equip-deactivate').click(ev => {
      const li = $(ev.currentTarget).parents(".item")
      let itemId = li.data("item-id")
      this.actor.equipDeactivate(itemId)
    });

    html.find('.subactor-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      let actorId = li.data("actor-id");
      let actor = game.actors.get(actorId);
      actor.sheet.render(true);
    });

    html.find('.subactor-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      let actorId = li.data("actor-id");
      this.actor.delSubActor(actorId);
    });
    html.find('.quantity-minus').click(event => {
      const li = $(event.currentTarget).parents(".item");
      this.actor.incDecQuantity(li.data("item-id"), -1);
    });
    html.find('.quantity-plus').click(event => {
      const li = $(event.currentTarget).parents(".item");
      this.actor.incDecQuantity(li.data("item-id"), +1);
    });
    html.find('.skill-use-minus').click(event => {
      const li = $(event.currentTarget).parents(".item");
      this.actor.incDecSkillUse(li.data("item-id"), -1);
    });
    html.find('.skill-use-plus').click(event => {
      const li = $(event.currentTarget).parents(".item");
      this.actor.incDecSkillUse(li.data("item-id"), +1);
    });


    html.find('.ammo-minus').click(event => {
      const li = $(event.currentTarget).parents(".item")
      this.actor.incDecAmmo(li.data("item-id"), -1);
    });
    html.find('.ammo-plus').click(event => {
      const li = $(event.currentTarget).parents(".item")
      this.actor.incDecAmmo(li.data("item-id"), +1)
    });

    html.find('.roll-this').click((event) => {
      const rollType = $(event.currentTarget).data("type")
      const statKey = $(event.currentTarget).data("key")
      this.actor.rollFromType(rollType, statKey)
    });
    html.find('.roll-save').click((event) => {
      const rollType = $(event.currentTarget).data("type")
      const statKey = $(event.currentTarget).data("key")
      this.actor.rollSaveFromType(rollType, statKey)
    });
    html.find('.roll-weapon').click((event) => {
      const li = $(event.currentTarget).parents(".item")
      const weaponId = li.data("item-id")
      this.actor.rollWeapon(weaponId)
    });
    html.find('.power-roll').click((event) => {
      const li = $(event.currentTarget).parents(".item")
      const powerId = li.data("item-id")
      this.actor.rollPower(powerId)
    });
    html.find('.roll-damage').click((event) => {
      const li = $(event.currentTarget).parents(".item")
      const weaponId = li.data("item-id")
      this.actor.rollDamage(weaponId)
    });
    html.find('.roll-damage-2hands').click((event) => {
      const li = $(event.currentTarget).parents(".item")
      const weaponId = li.data("item-id")
      this.actor.rollDamage(weaponId, true)
    });
    html.find('.lock-unlock-sheet').click((event) => {
      this.options.editScore = !this.options.editScore;
      this.render(true);
    });
    html.find('.item-link a').click((event) => {
      const itemId = $(event.currentTarget).data("item-id");
      const item = this.actor.getOwnedItem(itemId);
      item.sheet.render(true);
    });
    html.find('.item-equip').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.equipItem(li.data("item-id"));
      this.render(true);
    });

    html.find('.update-field').change(ev => {
      const fieldName = $(ev.currentTarget).data("field-name");
      let value = Number(ev.currentTarget.value);
      this.actor.update({ [`${fieldName}`]: value });
    });
  }

  /* -------------------------------------------- */
  /** @override */
  setPosition(options = {}) {
    const position = super.setPosition(options);
    const sheetBody = this.element.find(".sheet-body");
    const bodyHeight = position.height - 192;
    sheetBody.css("height", bodyHeight);
    return position;
  }

  /* -------------------------------------------- */
  async _onDropItem(event, dragData) {
    console.log(">>>>>> DROPPED!!!!")
    const item = fromUuidSync(dragData.uuid)
    if (item == undefined) {
      item = this.actor.items.get(item.id)
    }
    let ret = await this.actor.preprocessItem(event, item, true)
    if (ret) {
      super._onDropItem(event, dragData)
    }
  }

  /* -------------------------------------------- */
  /** @override */
  _updateObject(event, formData) {
    // Update the Actor
    return this.object.update(formData);
  }
}