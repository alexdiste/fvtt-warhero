/**
 * Warhero Skill Data Model
 * Defines the data schema for skill items using Foundry DataModel API
 */

import { WARHERO_CONFIG } from "../warhero-config.js";
const fields = foundry.data.fields;

/**
 * Data model class for skill items
 * @extends foundry.abstract.TypeDataModel
 */
export class SkillData extends foundry.abstract.TypeDataModel {

  /**
   * Define the data schema for skill items
   * @returns {Object} The data schema definition
   */
  static defineSchema() {
    return {
      raceskill: new fields.BooleanField({
        initial: false,
        required: false,
        label: "WH.ui.raceskill",
        hint: "WH.ui.raceskill.hint"
      }),

      classskill: new fields.BooleanField({
        initial: false,
        required: false,
        label: "WH.ui.classskill",
        hint: "WH.ui.classskill.hint"
      }),

      unlimited: new fields.BooleanField({
        initial: false,
        required: false,
        label: "WH.ui.unlimited",
        hint: "WH.ui.unlimited.hint"
      }),

      acquiredatlevel: new fields.NumberField({
        initial: 0,
        required: false,
        min: 0,
        integer: true,
        label: "WH.ui.acquiredatlevel",
        hint: "WH.ui.acquiredatlevel.hint"
      }),

      currentuse: new fields.NumberField({
        initial: 0,
        required: false,
        min: 0,
        integer: true,
        label: "WH.ui.currentuse",
        hint: "WH.ui.currentuse.hint"
      }),

      maxuse: new fields.NumberField({
        initial: 0,
        required: false,
        min: 0,
        integer: true,
        label: "WH.ui.maxuse",
        hint: "WH.ui.maxuse.hint"
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
   * Prepare base data for the skill
   */
  prepareBaseData() {
    super.prepareBaseData();

    this.acquiredatlevel = Math.max(0, this.acquiredatlevel);
    this.currentuse = Math.max(0, this.currentuse);
    this.maxuse = Math.max(0, this.maxuse);

    // Clamp current use to max use if max is set
    if (this.maxuse > 0) {
      this.currentuse = Math.min(this.currentuse, this.maxuse);
    }
  }

  /**
   * Prepare derived data for the skill
   */
  prepareDerivedData() {
    super.prepareDerivedData();

    // Skill-specific properties
    this.isUsable = this.unlimited || (this.maxuse > 0 && this.currentuse < this.maxuse);
    this.remainingUses = this.unlimited ? Infinity : Math.max(0, this.maxuse - this.currentuse);
    this.isExhausted = !this.unlimited && this.maxuse > 0 && this.currentuse >= this.maxuse;
    this.isRacial = this.raceskill;
    this.isClass = this.classskill;
    this.isGeneral = !this.raceskill && !this.classskill;
  }

  /**
   * Validate skill data
   */
  validateJoint(options = {}) {
    super.validateJoint(options);

    if (!this.unlimited && this.maxuse > 0 && this.currentuse > this.maxuse) {
      throw new foundry.data.validation.DataModelValidationFailure({
        unresolved: true,
        message: "Current use cannot exceed maximum use for limited skills"
      });
    }
  }

  /**
   * Migrate skill data
   */
  static migrateData(data) {
    return super.migrateData(data);
  }

  /**
   * Use the skill
   */
  async use(options = {}) {
    if (!this.isUsable) {
      ui.notifications.warn("This skill cannot be used (no uses remaining)");
      return false;
    }

    if (!this.unlimited && this.maxuse > 0) {
      const updateData = {
        "system.currentuse": this.currentuse + 1
      };

      await this.parent.update(updateData);

      if (this.currentuse + 1 >= this.maxuse) {
        ui.notifications.info(`${this.parent.name} has no uses remaining`);
      }
    }

    return true;
  }

  /**
   * Reset skill uses (typically done on rest)
   */
  async reset() {
    if (!this.unlimited && this.maxuse > 0) {
      const updateData = {
        "system.currentuse": 0
      };

      await this.parent.update(updateData);
      ui.notifications.info(`${this.parent.name} uses have been reset`);
    }

    return true;
  }
}