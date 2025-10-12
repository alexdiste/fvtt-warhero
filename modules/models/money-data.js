/**
 * Warhero Money Data Model
 * Defines the data schema for money items using Foundry DataModel API
 */
import { WARHERO_CONFIG } from "../warhero-config.js";

const fields = foundry.data.fields;

/**
 * Data model class for money items
 * @extends foundry.abstract.TypeDataModel
 */
export class MoneyData extends foundry.abstract.TypeDataModel {

  /**
   * Define the data schema for money items
   * @returns {Object} The data schema definition
   */
  static defineSchema() {
    let slotLocationChoices = {}
    for (const locId in WARHERO_CONFIG.slotNames) {
      let loc = WARHERO_CONFIG.slotNames[locId];
      slotLocationChoices[locId] = loc.label;
    }
    return {
      quantity: new fields.NumberField({
        initial: 0,
        required: false,
        min: 0,
        integer: true,
        label: "WH.ui.quantity",
        hint: "WH.ui.quantity.hint"
      }),

      slotlocation: new fields.StringField({
        initial: "backpack",
        required: false,
        blank: false,
        choices: slotLocationChoices,
        label: "WH.ui.slotlocation",
        hint: "WH.ui.slotlocation.hint"
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
   * Prepare base data for the money
   */
  prepareBaseData() {
    super.prepareBaseData();

    this.quantity = Math.max(0, this.quantity);
  }

  /**
   * Prepare derived data for the money
   */
  prepareDerivedData() {
    super.prepareDerivedData();

    // Money-specific properties
    this.isEmpty = this.quantity === 0;
    this.hasValue = this.quantity > 0;
  }

  /**
   * Validate money data
   */
  validateJoint(options = {}) {
    super.validateJoint(options);

    // No specific validation needed for money currently
  }

  /**
   * Migrate money data
   */
  static migrateData(data) {
    return super.migrateData(data);
  }

  /**
   * Add money
   */
  async add(amount) {
    if (amount <= 0) return false;

    const updateData = {
      "system.quantity": this.quantity + amount
    };

    await this.parent.update(updateData);
    return true;
  }

  /**
   * Subtract money
   */
  async subtract(amount) {
    if (amount <= 0 || amount > this.quantity) return false;

    const updateData = {
      "system.quantity": Math.max(0, this.quantity - amount)
    };

    await this.parent.update(updateData);
    return true;
  }
}