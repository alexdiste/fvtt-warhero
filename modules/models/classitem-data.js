/**
 * Warhero ClassItem Data Model
 * Defines the data schema for classitem items using Foundry DataModel API
 */

const fields = foundry.data.fields;
import { WARHERO_CONFIG } from "../warhero-config.js";

/**
 * Data model class for classitem items
 * @extends foundry.abstract.TypeDataModel
 */
export class ClassItemData extends foundry.abstract.TypeDataModel {

  /**
   * Define the data schema for classitem items
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
        integer: true,
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

      class: new fields.StringField({
        initial: "",
        required: false,
        blank: true,
        label: "WH.ui.class",
        hint: "WH.ui.class.hint"
      }),

      mandatoryfor: new fields.StringField({
        initial: "",
        required: false,
        blank: true,
        label: "WH.ui.mandatoryfor",
        hint: "WH.ui.mandatoryfor.hint"
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
   * Prepare base data for the classitem
   */
  prepareBaseData() {
    super.prepareBaseData();

    this.quantity = Math.max(0, this.quantity);
    this.slotused = Math.max(0, this.slotused);
  }

  /**
   * Prepare derived data for the classitem
   */
  prepareDerivedData() {
    super.prepareDerivedData();

    // ClassItem-specific properties
    this.totalCost = this.cost * this.quantity;
    this.effectiveSlotUsage = this.slotused * this.quantity;
    this.isIdentified = this.isidentified === "identified";
    this.isUnidentified = this.isidentified === "unidentified";
    this.hasClass = this.class && this.class.trim() !== "";
    this.hasMandatory = this.mandatoryfor && this.mandatoryfor.trim() !== "";
    this.isMandatory = this.hasMandatory;
    this.isUsable = this.quantity > 0;

    // Parse class and mandatory lists
    this.classList = this.hasClass ?
      this.class.split(',').map(cls => cls.trim()).filter(cls => cls) : [];
    this.mandatoryList = this.hasMandatory ?
      this.mandatoryfor.split(',').map(cls => cls.trim()).filter(cls => cls) : [];
  }

  /**
   * Validate classitem data
   */
  validateJoint(options = {}) {
    super.validateJoint(options);

    // No specific validation needed for classitems currently
  }

  /**
   * Migrate classitem data
   */
  static migrateData(data) {
    return super.migrateData(data);
  }

  /**
   * Check if item is usable by a specific class
   */
  isUsableByClass(className) {
    if (!this.hasClass) return true; // No restriction
    return this.classList.includes(className);
  }

  /**
   * Check if item is mandatory for a specific class
   */
  isMandatoryForClass(className) {
    if (!this.hasMandatory) return false;
    return this.mandatoryList.includes(className);
  }

  /**
   * Use the classitem
   */
  async use(options = {}) {
    if (!this.isUsable) {
      ui.notifications.warn("This item cannot be used (no quantity remaining)");
      return false;
    }

    // Class items are typically not consumed on use, but could have special effects
    ui.notifications.info(`Using class item: ${this.parent.name}`);
    return true;
  }
}