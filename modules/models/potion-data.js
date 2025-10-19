/**
 * Warhero Potion Data Model
 * Defines the data schema for potion items using Foundry DataModel API
 */

const fields = foundry.data.fields;
import { WARHERO_CONFIG } from "../warhero-config.js";

/**
 * Data model class for potion items
 * @extends foundry.abstract.TypeDataModel
 */
export class PotionData extends foundry.abstract.TypeDataModel {

  /**
   * Define the data schema for potion items
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

      alchemycost: new fields.StringField({
        initial: "",
        required: false,
        blank: true,
        label: "WH.ui.alchemycost",
        hint: "WH.ui.alchemycost.hint"
      }),

      preparetime: new fields.StringField({
        initial: "",
        required: false,
        blank: true,
        label: "WH.ui.preparetime",
        hint: "WH.ui.preparetime.hint"
      }),

      durationround: new fields.NumberField({
        initial: 0,
        required: false,
        min: 0,
        integer: true,
        label: "WH.ui.durationround",
        hint: "WH.ui.durationround.hint"
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
   * Prepare base data for the potion
   */
  prepareBaseData() {
    super.prepareBaseData();

    this.quantity = Math.max(0, this.quantity);
    this.slotused = Math.max(0, this.slotused);
    this.durationround = Math.max(0, this.durationround);
  }

  /**
   * Prepare derived data for the potion
   */
  prepareDerivedData() {
    super.prepareDerivedData();

    // Potion-specific properties
    this.totalCost = this.cost * this.quantity;
    this.effectiveSlotUsage = this.slotused * this.quantity;
    this.isIdentified = this.isidentified === "identified";
    this.isUnidentified = this.isidentified === "unidentified";
    this.hasAlchemyCost = this.alchemycost && this.alchemycost.trim() !== "";
    this.hasPrepareTime = this.preparetime && this.preparetime.trim() !== "";
    this.hasDuration = this.durationround > 0;
    this.isUsable = this.quantity > 0;
  }

  /**
   * Validate potion data
   */
  validateJoint(options = {}) {
    super.validateJoint(options);

    // No specific validation needed for potions currently
  }

  /**
   * Migrate potion data
   */
  static migrateData(data) {
    return super.migrateData(data);
  }

  /**
   * Use the potion (consume one)
   */
  async use(options = {}) {
    if (!this.isUsable) {
      ui.notifications.warn("This potion cannot be used (no quantity remaining)");
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