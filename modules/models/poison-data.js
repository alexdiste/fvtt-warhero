/**
 * Warhero Poison Data Model
 * Defines the data schema for poison items using Foundry DataModel API
 */

const fields = foundry.data.fields;
import { WARHERO_CONFIG } from "../warhero-config.js";

/**
 * Data model class for poison items
 * @extends foundry.abstract.TypeDataModel
 */
export class PoisonData extends foundry.abstract.TypeDataModel {

  /**
   * Define the data schema for poison items
   * @returns {Object} The data schema definition
   */
  static defineSchema() {
    let slotLocationChoices = {}
    for (const locId in WARHERO_CONFIG.slotNames) {
      let loc = WARHERO_CONFIG.slotNames[locId];
      slotLocationChoices[locId] = loc.label;
    }
    return {
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
        integer: false,
        label: "WH.ui.slotused",
        hint: "WH.ui.slotused.hint"
      }),

      slotlocation: new fields.StringField({
        initial: "backpack",
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

      application: new fields.StringField({
        initial: "",
        required: false,
        blank: true,
        choices: foundry.utils.duplicate(WARHERO_CONFIG.poisonApplication),
        label: "WH.ui.application",
        hint: "WH.ui.application.hint"
      }),

      preparecost: new fields.StringField({
        initial: "",
        required: false,
        blank: true,
        label: "WH.ui.preparecost",
        hint: "WH.ui.preparecost.hint"
      }),

      preparetime: new fields.StringField({
        initial: "",
        required: false,
        blank: true,
        label: "WH.ui.preparetime",
        hint: "WH.ui.preparetime.hint"
      }),

      damageroll: new fields.StringField({
        initial: "",
        required: false,
        blank: true,
        label: "WH.ui.damageroll",
        hint: "WH.ui.damageroll.hint"
      }),

      durationround: new fields.NumberField({
        initial: 0,
        required: false,
        min: 0,
        integer: true,
        label: "WH.ui.durationround",
        hint: "WH.ui.durationround.hint"
      }),

      savesdc: new fields.NumberField({
        initial: 0,
        required: false,
        min: 0,
        integer: true,
        label: "WH.ui.savesdc",
        hint: "WH.ui.savesdc.hint"
      }),

      savetype: new fields.StringField({
        initial: "",
        required: false,
        blank: true,
        choices: foundry.utils.duplicate(WARHERO_CONFIG.saveType),
        label: "WH.ui.savetype",
        hint: "WH.ui.savetype.hint"
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
   * Prepare base data for the poison
   */
  prepareBaseData() {
    super.prepareBaseData();

    this.quantity = Math.max(0, this.quantity);
    this.slotused = Math.max(0, this.slotused);
    this.durationround = Math.max(0, this.durationround);
    this.savesdc = Math.max(0, this.savesdc);
  }

  /**
   * Prepare derived data for the poison
   */
  prepareDerivedData() {
    super.prepareDerivedData();

    // Poison-specific properties
    this.totalCost = this.cost * this.quantity;
    this.effectiveSlotUsage = this.slotused * this.quantity;
    this.isIdentified = this.isidentified === "identified";
    this.isUnidentified = this.isidentified === "unidentified";
    this.hasApplication = this.application && this.application.trim() !== "";
    this.hasPrepareTime = this.preparetime && this.preparetime.trim() !== "";
    this.hasPrepareCost = this.preparecost && this.preparecost.trim() !== "";
    this.hasDamage = this.damageroll && this.damageroll.trim() !== "";
    this.hasDuration = this.durationround > 0;
    this.hasSave = this.savesdc > 0 && this.savetype !== "";
    this.isUsable = this.quantity > 0;
  }

  /**
   * Validate poison data
   */
  validateJoint(options = {}) {
    super.validateJoint(options);

    // If save DC is set, save type should also be set
    if (this.savesdc > 0 && !this.savetype) {
      throw new foundry.data.validation.DataModelValidationFailure({
        unresolved: true,
        message: "Save type must be specified when save DC is set"
      });
    }
  }

  /**
   * Migrate poison data
   */
  static migrateData(data) {
    return super.migrateData(data);
  }

  /**
   * Use the poison (apply/consume one dose)
   */
  async use(options = {}) {
    if (!this.isUsable) {
      ui.notifications.warn("This poison cannot be used (no quantity remaining)");
      return false;
    }

    const updateData = {
      "system.quantity": Math.max(0, this.quantity - 1)
    };

    await this.parent.update(updateData);

    if (this.quantity - 1 <= 0) {
      ui.notifications.info(`${this.parent.name} has been consumed`);
    }

    return true;
  }
}