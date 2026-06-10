/**
 * Warhero Location Data Model
 * Defines the data schema for location items using Foundry DataModel API
 */

const fields = foundry.data.fields;

/**
 * Data model class for location items
 * @extends foundry.abstract.TypeDataModel
 */
export class LocationData extends foundry.abstract.TypeDataModel {

  static LOCALIZATION_PREFIXES = ["WH.Location"];

  /**
   * Define the data schema for location items
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
   * Prepare base data for the location
   */
  prepareBaseData() {
    super.prepareBaseData();

  }

  /**
   * Prepare derived data for the location
   */
  prepareDerivedData() {
    super.prepareDerivedData();

  }

  /**
   * Migrate location data
   */
  static migrateData(data) {
    return super.migrateData(data);
  }
}
