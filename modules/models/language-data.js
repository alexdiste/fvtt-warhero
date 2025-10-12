/**
 * Warhero Language Data Model
 * Defines the data schema for language items using Foundry DataModel API
 */

const fields = foundry.data.fields;

/**
 * Data model class for language items
 * @extends foundry.abstract.TypeDataModel
 */
export class LanguageData extends foundry.abstract.TypeDataModel {

  /**
   * Define the data schema for language items
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
   * Prepare base data for the language
   */
  prepareBaseData() {
    super.prepareBaseData();

    // No specific base data preparation needed
  }

  /**
   * Prepare derived data for the language
   */
  prepareDerivedData() {
    super.prepareDerivedData();

    // Language-specific properties
    this.hasShortDescription = this.shortdescription && this.shortdescription.trim() !== "";
    this.hasDescription = this.description && this.description.trim() !== "";
  }

  /**
   * Validate language data
   */
  validateJoint(options = {}) {
    super.validateJoint(options);

    // No specific validation needed for languages currently
  }

  /**
   * Migrate language data
   */
  static migrateData(data) {
    return super.migrateData(data);
  }
}