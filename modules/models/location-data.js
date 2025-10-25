/**
 * Warhero Condition Data Model
 * Defines the data schema for condition items using Foundry DataModel API
 */

const fields = foundry.data.fields;
import { WARHERO_CONFIG } from "../warhero-config.js";

/**
 * Data model class for condition items
 * @extends foundry.abstract.TypeDataModel
 */
export class LocationData extends foundry.abstract.TypeDataModel {

  /**
   * Define the data schema for condition items
   * @returns {Object} The data schema definition
   */
  static defineSchema() {
    return {
      shortdescription: new fields.StringField({
        initial: "",
        required: false,
        blank: true,
        label: "WH.ui.shortdescription",
        hint: "WH.ui.shortdescription.hint"
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
   * Prepare base data for the condition
   */
  prepareBaseData() {
    super.prepareBaseData();

  }

  /**
   * Prepare derived data for the condition
   */
  prepareDerivedData() {
    super.prepareDerivedData();

  }

  /**
   * Migrate condition data
   */
  static migrateData(data) {
    return super.migrateData(data);
  }

}