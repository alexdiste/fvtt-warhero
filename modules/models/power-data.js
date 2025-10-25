/**
 * Warhero Power Data Model
 * Defines the data schema for power items using Foundry DataModel API
 */

const fields = foundry.data.fields;
import { WARHERO_CONFIG } from "../warhero-config.js";

/**
 * Data model class for power items
 * @extends foundry.abstract.TypeDataModel
 */
export class PowerData extends foundry.abstract.TypeDataModel {

  /**
   * Define the data schema for power items
   * @returns {Object} The data schema definition
   */
  static defineSchema() {
    return {
      level: new fields.StringField({
        initial: "",
        required: false,
        blank: true,
        label: "WH.ui.level",
        hint: "WH.ui.level.hint"
      }),

      magicschool: new fields.StringField({
        initial: "",
        required: false,
        blank: true,
        label: "WH.ui.magicschool",
        hint: "WH.ui.magicschool.hint"
      }),

      isteleport: new fields.BooleanField({
        initial: false,
        required: false,
        label: "WH.ui.isteleport",
        hint: "WH.ui.isteleport.hint"
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
   * Prepare base data for the power
   */
  prepareBaseData() {
    super.prepareBaseData();

    // Parse level as number if it's a numeric string
    this.levelNumeric = parseInt(this.level) || 0;
  }

  /**
   * Prepare derived data for the power
   */
  prepareDerivedData() {
    super.prepareDerivedData();

    // Power-specific properties
    this.hasLevel = this.level && this.level.trim() !== "";
    this.hasSchool = this.magicschool && this.magicschool.trim() !== "";
    this.isMagical = this.hasSchool;
    this.isCantrip = this.level === "0" || this.level.toLowerCase() === "cantrip";
  }

  /**
   * Validate power data
   */
  validateJoint(options = {}) {
    super.validateJoint(options);

    // No specific validation needed for powers currently
  }

  /**
   * Migrate power data
   */
  static migrateData(data) {
    return super.migrateData(data);
  }

  /**
   * Use the power
   */
  async use(options = {}) {
    // Powers are typically always usable unless specific restrictions apply
    // Implementation depends on game system rules
    ui.notifications.info(`Using power: ${this.parent.name}`);
    return true;
  }
}