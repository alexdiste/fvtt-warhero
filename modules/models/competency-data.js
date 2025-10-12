/**
 * Warhero Competency Data Model
 * Defines the data schema for competency items using Foundry DataModel API
 */

const fields = foundry.data.fields;
import { WARHERO_CONFIG } from "../warhero-config.js";

/**
 * Data model class for competency items
 * @extends foundry.abstract.TypeDataModel
 */
export class CompetencyData extends foundry.abstract.TypeDataModel {

  /**
   * Define the data schema for competency items
   * @returns {Object} The data schema definition
   */
  static defineSchema() {
    return {
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
   * Prepare base data for the competency
   */
  prepareBaseData() {
    super.prepareBaseData();

    // No specific base data preparation needed
  }

  /**
   * Prepare derived data for the competency
   */
  prepareDerivedData() {
    super.prepareDerivedData();

    // Competency-specific properties
    this.hasDescription = this.description && this.description.trim() !== "";
  }

  /**
   * Validate competency data
   */
  validateJoint(options = {}) {
    super.validateJoint(options);

    // No specific validation needed for competencies currently
  }

  /**
   * Migrate competency data
   */
  static migrateData(data) {
    return super.migrateData(data);
  }
}