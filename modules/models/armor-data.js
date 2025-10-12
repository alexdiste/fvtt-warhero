/**
 * Warhero Armor Data Model
 * Defines the data schema for armor items using Foundry DataModel API
 */
import { WARHERO_CONFIG } from "../warhero-config.js";

const fields = foundry.data.fields;

/**
 * Data model class for armor items
 * @extends foundry.abstract.TypeDataModel
 */
export class ArmorData extends foundry.abstract.TypeDataModel {

  /**
   * Define the data schema for armor items
   * @returns {Object} The data schema definition
   */
  static defineSchema() {
    let armorChoices = {}
    for (const armorId in WARHERO_CONFIG.armorTypes) {
      armorChoices[armorId] = WARHERO_CONFIG.armorTypes[armorId].label;
    }
    let slotLocationChoices = {}
    for (const locId in WARHERO_CONFIG.slotNames) {
      let loc = WARHERO_CONFIG.slotNames[locId];
      slotLocationChoices[locId] = loc.label;
    }

    return {
      armortype: new fields.StringField({
        initial: "light",
        required: false,
        blank: false,
        choices: armorChoices,
        label: "WH.ui.armortype",
        hint: "WH.ui.armortype.hint"
      }),

      equipped: new fields.BooleanField({
        initial: false,
        required: false,
        label: "WH.ui.equipped",
        hint: "WH.ui.equipped.hint"
      }),

      damagereduction: new fields.NumberField({
        initial: 1,
        required: false,
        min: 0,
        integer: true,
        label: "WH.ui.damagereduction",
        hint: "WH.ui.damagereduction.hint"
      }),

      cost: new fields.NumberField({
        initial: 0,
        required: false,
        min: 0,
        integer: true,
        label: "WH.ui.cost",
        hint: "WH.ui.cost.hint"
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
        integer: true,
        label: "WH.ui.slotused",
        hint: "WH.ui.slotused.hint"
      }),

      slotlocation: new fields.StringField({
        initial: "armor",
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
   * Prepare base data for the armor
   */
  prepareBaseData() {
    super.prepareBaseData();

    this.quantity = Math.max(0, this.quantity);
    this.slotused = Math.max(0, this.slotused);
    this.damagereduction = Math.max(0, this.damagereduction);
    this.chargevalue = Math.max(0, this.chargevalue);
    this.chargevaluemax = Math.max(0, this.chargevaluemax);

    if (this.chargevaluemax > 0) {
      this.chargevalue = Math.min(this.chargevalue, this.chargevaluemax);
    }
  }

  /**
   * Prepare derived data for the armor
   */
  prepareDerivedData() {
    super.prepareDerivedData();

    this.isUsable = this.magiccharge === "notapplicable" ||
      this.magiccharge === "unlimited" ||
      (this.magiccharge === "charged" && this.chargevalue > 0);

    this.totalCost = this.cost * this.quantity;
    this.isMagical = this.magiccharge !== "notapplicable";
    this.effectiveSlotUsage = this.slotused * this.quantity;

    // Armor-specific properties
    this.isLight = this.armortype === "light";
    this.isMedium = this.armortype === "medium";
    this.isHeavy = this.armortype === "heavy";
    this.totalDamageReduction = this.damagereduction * this.quantity;
  }

  /**
   * Validate armor data
   */
  validateJoint(options = {}) {
    super.validateJoint(options);

    if (this.magiccharge === "charged" && this.chargevaluemax <= 0) {
      throw new foundry.data.validation.DataModelValidationFailure({
        unresolved: true,
        message: "Armor with 'charged' magic type must have a maximum charge value greater than 0"
      });
    }

    if (this.equipped && this.slotlocation === "backpack") {
      throw new foundry.data.validation.DataModelValidationFailure({
        unresolved: true,
        message: "Equipped armor cannot be stored in backpack"
      });
    }
  }

  /**
   * Migrate armor data
   */
  static migrateData(data) {
    return super.migrateData(data);
  }

  /**
   * Use the armor (for magical armors)
   */
  async use(options = {}) {
    if (!this.isUsable) {
      ui.notifications.warn("This armor cannot be used (no charges remaining or not usable)");
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
      updateData["system.slotlocation"] = "armor";
    } else if (!newEquippedState) {
      updateData["system.slotlocation"] = "backpack";
    }

    return await this.parent.update(updateData);
  }
}