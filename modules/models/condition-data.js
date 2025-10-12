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
export class ConditionData extends foundry.abstract.TypeDataModel {

  /**
   * Define the data schema for condition items
   * @returns {Object} The data schema definition
   */
  static defineSchema() {
    return {
      conditiontype: new fields.StringField({
        initial: "",
        required: false,
        blank: true,
        label: "WH.ui.conditiontype",
        hint: "WH.ui.conditiontype.hint"
      }),

      duration: new fields.StringField({
        initial: "",
        required: false,
        blank: true,
        label: "WH.ui.duration",
        hint: "WH.ui.duration.hint"
      }),

      begin: new fields.StringField({
        initial: "",
        required: false,
        blank: true,
        label: "WH.ui.begin",
        hint: "WH.ui.begin.hint"
      }),

      specialduration: new fields.StringField({
        initial: "",
        required: false,
        blank: true,
        label: "WH.ui.specialduration",
        hint: "WH.ui.specialduration.hint"
      }),

      durationvalue: new fields.NumberField({
        initial: 0,
        required: false,
        min: 0,
        integer: true,
        label: "WH.ui.durationvalue",
        hint: "WH.ui.durationvalue.hint"
      }),

      durationunit: new fields.StringField({
        initial: "",
        required: false,
        blank: true,
        choices: {
          "": "",
          "rounds": "WH.ui.rounds",
          "minutes": "WH.ui.minutes",
          "hours": "WH.ui.hours",
          "days": "WH.ui.days",
          "permanent": "WH.ui.permanent"
        },
        label: "WH.ui.durationunit",
        hint: "WH.ui.durationunit.hint"
      }),

      shortdescription: new fields.StringField({
        initial: "",
        required: false,
        blank: true,
        label: "WH.ui.shortdescription",
        hint: "WH.ui.shortdescription.hint"
      }),

      dcsave: new fields.NumberField({
        initial: 0,
        required: false,
        min: 0,
        integer: true,
        label: "WH.ui.dcsave",
        hint: "WH.ui.dcsave.hint"
      }),

      incubationtime: new fields.StringField({
        initial: "",
        required: false,
        blank: true,
        label: "WH.ui.incubationtime",
        hint: "WH.ui.incubationtime.hint"
      }),

      diseaseduration: new fields.StringField({
        initial: "",
        required: false,
        blank: true,
        label: "WH.ui.diseaseduration",
        hint: "WH.ui.diseaseduration.hint"
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

    this.durationvalue = Math.max(0, this.durationvalue);
    this.dcsave = Math.max(0, this.dcsave);
  }

  /**
   * Prepare derived data for the condition
   */
  prepareDerivedData() {
    super.prepareDerivedData();

    // Condition-specific properties
    this.hasType = this.conditiontype && this.conditiontype.trim() !== "";
    this.hasDuration = this.duration && this.duration.trim() !== "";
    this.hasNumericDuration = this.durationvalue > 0 && this.durationunit !== "";
    this.isPermanent = this.durationunit === "permanent";
    this.hasIncubation = this.incubationtime && this.incubationtime.trim() !== "";
    this.isDisease = this.diseaseduration && this.diseaseduration.trim() !== "";
    this.hasSave = this.dcsave > 0;
  }

  /**
   * Validate condition data
   */
  validateJoint(options = {}) {
    super.validateJoint(options);

    // If duration value is set, duration unit should also be set
    if (this.durationvalue > 0 && !this.durationunit) {
      throw new foundry.data.validation.DataModelValidationFailure({
        unresolved: true,
        message: "Duration unit must be specified when duration value is set"
      });
    }
  }

  /**
   * Migrate condition data
   */
  static migrateData(data) {
    return super.migrateData(data);
  }

  /**
   * Apply the condition
   */
  async apply(options = {}) {
    ui.notifications.info(`Applied condition: ${this.parent.name}`);
    return true;
  }

  /**
   * Remove the condition
   */
  async remove(options = {}) {
    ui.notifications.info(`Removed condition: ${this.parent.name}`);
    return true;
  }
}