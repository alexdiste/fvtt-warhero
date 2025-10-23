/**
 * Warhero Weapon Data Model
 * Defines the data schema for weapon items using Foundry DataModel API
 */

import { WARHERO_CONFIG } from "../warhero-config.js";
const fields = foundry.data.fields;

/**
 * Data model class for weapon items
 * @extends foundry.abstract.TypeDataModel
 */
export class WeaponData extends foundry.abstract.TypeDataModel {

  /**
   * Define the data schema for weapon items
   * @returns {Object} The data schema definition
   */
  static defineSchema() {
    let slotLocationChoices = {}
    for (const locId in WARHERO_CONFIG.slotNames) {
      let loc = WARHERO_CONFIG.slotNames[locId];
      slotLocationChoices[locId] = loc.label;
    }
    let weaponTypeChoices = {}
    for (const wtId in WARHERO_CONFIG.weaponTypes) {
      let wt = WARHERO_CONFIG.weaponTypes[wtId];
      weaponTypeChoices[wtId] = wt.label;
    }
    return {
      weapontype: new fields.StringField({
        initial: "short",
        required: false,
        blank: false,
        choices: weaponTypeChoices,
        label: "WH.ui.weapontype",
        hint: "WH.ui.weapontype.hint"
      }),

      damage: new fields.StringField({
        initial: "1d6",
        required: false,
        blank: false,
        label: "WH.ui.damage",
        hint: "WH.ui.damage.hint"
      }),

      damage2hands: new fields.StringField({
        initial: "1d6",
        required: false,
        blank: false,
        label: "WH.ui.damage2hands",
        hint: "WH.ui.damage2hands.hint"
      }),

      isCustomAttackRoll: new fields.BooleanField({
        initial: false,
        required: false,
        label: "WH.ui.isCustomAttackRoll",
        hint: "WH.ui.isCustomAttackRoll.hint"
      }),

      rollformula: new fields.StringField({
        initial: "",
        required: false,
        blank: true,
        label: "WH.ui.rollformula",
        hint: "WH.ui.rollformula.hint"
      }),

      damageformula: new fields.StringField({
        initial: "",
        required: false,
        blank: true,
        label: "WH.ui.damageformula",
        hint: "WH.ui.damageformula.hint"
      }),

      cost: new fields.NumberField({
        initial: 0,
        required: false,
        min: 0,
        integer: true,
        label: "WH.ui.cost",
        hint: "WH.ui.cost.hint"
      }),

      equipped: new fields.BooleanField({
        initial: false,
        required: false,
        label: "WH.ui.equipped",
        hint: "WH.ui.equipped.hint"
      }),

      quantity: new fields.NumberField({
        initial: 1,
        required: false,
        min: 0,
        integer: true,
        label: "WH.ui.quantity",
        hint: "WH.ui.quantity.hint"
      }),

      slotused: new fields.NumberField({
        initial: 1,
        required: false,
        min: 0,
        integer: false,
        label: "WH.ui.slotused",
        hint: "WH.ui.slotused.hint"
      }),

      slotlocation: new fields.StringField({
        initial: "weapon1",
        required: false,
        blank: false,
        choices: slotLocationChoices,
        label: "WH.ui.slotlocation",
        hint: "WH.ui.slotlocation.hint"
      }),

      isidentified: new fields.StringField({
        initial: "unknown",
        required: false,
        blank: false,
        choices: foundry.utils.duplicate(WARHERO_CONFIG.identifiedState),
        label: "WH.ui.isidentified",
        hint: "WH.ui.isidentified.hint"
      }),

      magiccharge: new fields.StringField({
        initial: "notapplicable",
        required: false,
        blank: false,
        choices: foundry.utils.duplicate(WARHERO_CONFIG.magicCharge),
        label: "WH.ui.magiccharge",
        hint: "WH.ui.magiccharge.hint"
      }),

      chargevalue: new fields.NumberField({
        initial: 0,
        required: false,
        min: 0,
        integer: true,
        label: "WH.ui.chargevalue",
        hint: "WH.ui.chargevalue.hint"
      }),

      chargevaluemax: new fields.NumberField({
        initial: 0,
        required: false,
        min: 0,
        integer: true,
        label: "WH.ui.chargevaluemax",
        hint: "WH.ui.chargevaluemax.hint"
      }),

      description: new fields.HTMLField({
        initial: "",
        required: false,
        blank: true,
        label: "WH.ui.description",
        hint: "WH.ui.description.hint"
      })
    };
  }

  /**
   * Prepare base data for the weapon
   */
  prepareBaseData() {
    super.prepareBaseData();

    this.quantity = Math.max(0, this.quantity);
    this.slotused = Math.max(0, this.slotused);
    this.chargevalue = Math.max(0, this.chargevalue);
    this.chargevaluemax = Math.max(0, this.chargevaluemax);

    if (this.chargevaluemax > 0) {
      this.chargevalue = Math.min(this.chargevalue, this.chargevaluemax);
    }
  }

  /**
   * Prepare derived data for the weapon
   */
  prepareDerivedData() {
    super.prepareDerivedData();

    this.isUsable = this.magiccharge === "notapplicable" ||
      this.magiccharge === "unlimited" ||
      (this.magiccharge === "charged" && this.chargevalue > 0);

    this.totalCost = this.cost * this.quantity;
    this.isMagical = this.magiccharge !== "notapplicable";
    this.effectiveSlotUsage = this.slotused * this.quantity;

    // Weapon-specific properties
    this.isTwoHanded = this.weapontype === "twohanded";
    this.isRanged = ["shooting", "throwing"].includes(this.weapontype);
    this.isMelee = !this.isRanged;
  }

  /**
   * Validate weapon data
   */
  validateJoint(options = {}) {
    super.validateJoint(options);

    if (this.magiccharge === "charged" && this.chargevaluemax <= 0) {
      throw new foundry.data.validation.DataModelValidationFailure({
        unresolved: true,
        message: "Weapons with 'charged' magic type must have a maximum charge value greater than 0"
      });
    }

    if (this.equipped && this.slotlocation === "backpack") {
      throw new foundry.data.validation.DataModelValidationFailure({
        unresolved: true,
        message: "Equipped weapons cannot be stored in backpack"
      });
    }
  }

  /**
   * Migrate weapon data
   */
  static migrateData(data) {
    return super.migrateData(data);
  }

  /**
   * Use the weapon (for magical weapons)
   */
  async use(options = {}) {
    if (!this.isUsable) {
      ui.notifications.warn("This weapon cannot be used (no charges remaining or not usable)");
      return false;
    }

    if (this.magiccharge === "charged" && this.chargevalue > 0) {
      const updateData = {
        "system.chargevalue": this.chargevalue - 1
      };

      await this.parent.update(updateData);

      if (this.chargevalue - 1 <= 0) {
        ui.notifications.info(`${this.parent.name} has no charges remaining`);
      }
    }

    return true;
  }

  /**
   * Toggle the equipped status
   */
  async toggleEquipped() {
    const newEquippedState = !this.equipped;
    const updateData = {
      "system.equipped": newEquippedState
    };

    if (newEquippedState && this.slotlocation === "backpack") {
      updateData["system.slotlocation"] = "weapon1";
    } else if (!newEquippedState) {
      updateData["system.slotlocation"] = "backpack";
    }

    return await this.parent.update(updateData);
  }
}