/**
 * Warhero Trap Data Model
 * Defines the data schema for trap items using Foundry DataModel API
 */

import { WARHERO_CONFIG } from "../warhero-config.js";
const fields = foundry.data.fields;

/**
 * Data model class for trap items
 * @extends foundry.abstract.TypeDataModel
 */
export class TrapData extends foundry.abstract.TypeDataModel {

  /**
   * Define the data schema for trap items
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

      dcfind: new fields.NumberField({
        initial: 0,
        required: false,
        min: 0,
        integer: true,
        label: "WH.ui.dcfind",
        hint: "WH.ui.dcfind.hint"
      }),

      dcdisable: new fields.NumberField({
        initial: 0,
        required: false,
        min: 0,
        integer: true,
        label: "WH.ui.dcdisable",
        hint: "WH.ui.dcdisable.hint"
      }),

      throwtohit: new fields.NumberField({
        initial: 0,
        required: false,
        min: 0,
        integer: true,
        label: "WH.ui.throwtohit",
        hint: "WH.ui.throwtohit.hint"
      }),

      damageroll: new fields.StringField({
        initial: "",
        required: false,
        blank: true,
        label: "WH.ui.damageroll",
        hint: "WH.ui.damageroll.hint"
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
   * Prepare base data for the trap
   */
  prepareBaseData() {
    super.prepareBaseData();

    this.quantity = Math.max(0, this.quantity);
    this.slotused = Math.max(0, this.slotused);
    this.dcfind = Math.max(0, this.dcfind);
    this.dcdisable = Math.max(0, this.dcdisable);
    this.throwtohit = Math.max(0, this.throwtohit);
  }

  /**
   * Prepare derived data for the trap
   */
  prepareDerivedData() {
    super.prepareDerivedData();

    // Trap-specific properties
    this.totalCost = this.cost * this.quantity;
    this.effectiveSlotUsage = this.slotused * this.quantity;
    this.isIdentified = this.isidentified === "identified";
    this.isUnidentified = this.isidentified === "unidentified";
    this.hasFindDC = this.dcfind > 0;
    this.hasDisableDC = this.dcdisable > 0;
    this.hasAttackRoll = this.throwtohit > 0;
    this.hasDamage = this.damageroll && this.damageroll.trim() !== "";
    this.isUsable = this.quantity > 0;
    this.difficulty = this.getTrapdifficultyCategory();
  }

  /**
   * Get trap difficulty category based on DCs
   */
  getTrapdifficultyCategory() {
    const maxDC = Math.max(this.dcfind, this.dcdisable);
    if (maxDC === 0) return "unknown";
    if (maxDC <= 10) return "easy";
    if (maxDC <= 15) return "moderate";
    if (maxDC <= 20) return "hard";
    return "deadly";
  }

  /**
   * Validate trap data
   */
  validateJoint(options = {}) {
    super.validateJoint(options);

    // No specific validation needed for traps currently
  }

  /**
   * Migrate trap data
   */
  static migrateData(data) {
    return super.migrateData(data);
  }

  /**
   * Use the trap (deploy/trigger)
   */
  async use(options = {}) {
    if (!this.isUsable) {
      ui.notifications.warn("This trap cannot be used (no quantity remaining)");
      return false;
    }

    const updateData = {
      "system.quantity": Math.max(0, this.quantity - 1)
    };

    await this.parent.update(updateData);

    if (this.quantity - 1 <= 0) {
      ui.notifications.info(`${this.parent.name} has been deployed`);
    }

    return true;
  }
}