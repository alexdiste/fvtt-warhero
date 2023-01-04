/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */

import { CrucibleUtility } from "./crucible-utility.js";

/* -------------------------------------------- */
export class CrucibleActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {

    return mergeObject(super.defaultOptions, {
      classes: ["fvtt-crucible-rpg", "sheet", "actor"],
      template: "systems/fvtt-crucible-rpg/templates/actor-sheet.html",
      width: 960,
      height: 720,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "skills" }],
      dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }],
      editScore: true
    });
  }

  /* -------------------------------------------- */
  async getData() {
    const objectData = this.object.system
    let actorData = duplicate(objectData)

    let formData = {
      title: this.title,
      id: this.actor.id,
      type: this.actor.type,
      img: this.actor.img,
      name: this.actor.name,
      editable: this.isEditable,
      cssClass: this.isEditable ? "editable" : "locked",
      data: actorData,
      limited: this.object.limited,
      skills: this.actor.getSkills( ),
      weapons: this.actor.checkAndPrepareEquipments( duplicate(this.actor.getWeapons()) ),
      armors: this.actor.checkAndPrepareEquipments( duplicate(this.actor.getArmors())),
      shields: this.actor.checkAndPrepareEquipments( duplicate(this.actor.getShields())),
      spells: this.actor.checkAndPrepareEquipments( duplicate(this.actor.getLore())),
      equipments: this.actor.checkAndPrepareEquipments(duplicate(this.actor.getEquipmentsOnly()) ),
      equippedWeapons: this.actor.checkAndPrepareEquipments(duplicate(this.actor.getEquippedWeapons()) ),
      equippedArmor: this.actor.getEquippedArmor(),
      equippedShield: this.actor.getEquippedShield(),
      feats: duplicate(this.actor.getFeats()),
      subActors: duplicate(this.actor.getSubActors()),
      race: duplicate(this.actor.getRace()),
      moneys: duplicate(this.actor.getMoneys()),
      encCapacity: this.actor.getEncumbranceCapacity(),
      saveRolls: this.actor.getSaveRoll(),
      conditions: this.actor.getConditions(),
      description: await TextEditor.enrichHTML(this.object.system.biodata.description, {async: true}),
      notes: await TextEditor.enrichHTML(this.object.system.biodata.notes, {async: true}),
      containersTree: this.actor.containersTree,
      encCurrent: this.actor.encCurrent,
      options: this.options,
      owner: this.document.isOwner,
      editScore: this.options.editScore,
      isGM: game.user.isGM
    }
    this.formData = formData;

    console.log("PC : ", formData, this.object);
    return formData;
  }


  /* -------------------------------------------- */
  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;
    
    html.bind("keydown", function(e) { // Ignore Enter in actores sheet
      if (e.keyCode === 13) return false;
    });  

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item")
      let itemId = li.data("item-id")
      const item = this.actor.items.get( itemId );
      item.sheet.render(true);
    });
    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item")
      CrucibleUtility.confirmDelete(this, li)
    })
    html.find('.item-add').click(ev => {
      let dataType = $(ev.currentTarget).data("type")
      this.actor.createEmbeddedDocuments('Item', [{ name: "NewItem", type: dataType }], { renderSheet: true })
    })
        
    html.find('.equip-activate').click(ev => {
      const li = $(ev.currentTarget).parents(".item")
      let itemId = li.data("item-id")
      this.actor.equipActivate( itemId)
    });      
    html.find('.equip-deactivate').click(ev => {
      const li = $(ev.currentTarget).parents(".item")
      let itemId = li.data("item-id")
      this.actor.equipDeactivate( itemId)
    });      

    html.find('.subactor-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      let actorId = li.data("actor-id");
      let actor = game.actors.get( actorId );
      actor.sheet.render(true);
    });
    
    html.find('.subactor-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      let actorId = li.data("actor-id");
      this.actor.delSubActor(actorId);
    });
    html.find('.quantity-minus').click(event => {
      const li = $(event.currentTarget).parents(".item");
      this.actor.incDecQuantity( li.data("item-id"), -1 );
    } );
    html.find('.quantity-plus').click(event => {
      const li = $(event.currentTarget).parents(".item");
      this.actor.incDecQuantity( li.data("item-id"), +1 );
    } );

    html.find('.ammo-minus').click(event => {
      const li = $(event.currentTarget).parents(".item")
      this.actor.incDecAmmo( li.data("item-id"), -1 );
    } );
    html.find('.ammo-plus').click(event => {
      const li = $(event.currentTarget).parents(".item")
      this.actor.incDecAmmo( li.data("item-id"), +1 )
    } );
            
    html.find('.roll-ability').click((event) => {
      const abilityKey = $(event.currentTarget).data("ability-key");
      this.actor.rollAbility(abilityKey);
    });
    html.find('.roll-skill').click((event) => {
      const li = $(event.currentTarget).parents(".item")
      const skillId = li.data("item-id")
      this.actor.rollSkill(skillId)
    });    

    html.find('.roll-weapon').click((event) => {
      const li = $(event.currentTarget).parents(".item");
      const skillId = li.data("item-id")
      this.actor.rollWeapon(skillId)
    });
    html.find('.roll-armor-die').click((event) => {
      this.actor.rollArmorDie()
    });
    html.find('.roll-shield-die').click((event) => {
      this.actor.rollShieldDie()
    });
    html.find('.roll-target-die').click((event) => {
      this.actor.rollDefenseRanged()
    });
    
    html.find('.roll-save').click((event) => {
      const saveKey = $(event.currentTarget).data("save-key")
      this.actor.rollSave(saveKey)
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
      this.actor.equipItem( li.data("item-id") );
      this.render(true);      
    });

    html.find('.update-field').change(ev => {
      const fieldName = $(ev.currentTarget).data("field-name");
      let value = Number(ev.currentTarget.value);
      this.actor.update( { [`${fieldName}`]: value } );
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
      item = this.actor.items.get( item.id )
    }
    let ret = await this.actor.preprocessItem( event, item, true )
    if ( ret ) {
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
