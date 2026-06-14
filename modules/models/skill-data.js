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

  static LOCALIZATION_PREFIXES = ["WH.Skill"];

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

      maxuseFormula: new fields.StringField({
        initial: "1",
        required: true,
        label: "WH.ui.maxuseFormula",
        hint: "WH.ui.maxuseFormula.hint"
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
  }

  /**
   * Prepare derived data for the skill
   */
  prepareDerivedData() {
    super.prepareDerivedData();

    // Compute max uses from formula (only when owned by an actor)
    this.maxuse = 0;
    if (!this.unlimited && this.parent?.parent) {
      const formula = (this.maxuseFormula && this.maxuseFormula.trim() !== "")
        ? this.maxuseFormula : "1";
      // Strip @system. prefix for backwards compat; use the actor's TypeDataModel
      // (which has post-effects values) as roll data.
      const clean = String(formula).replace(/@system\./g, "@");
      const roll = new Roll(clean, this.parent.parent?.system).evaluateSync();
      this.maxuse = roll.total;
    } else if (this.unlimited) {
      this.maxuse = Infinity;
    }

    // Skill-specific properties
    this.isUsable = this.unlimited || (this.maxuse > 0 && this.currentuse < this.maxuse);
    this.remainingUses = this.unlimited ? Infinity : Math.max(0, this.maxuse - this.currentuse);
    this.isExhausted = !this.unlimited && this.maxuse > 0 && this.currentuse >= this.maxuse;
    this.isRacial = this.raceskill;
    this.isClass = this.classskill;
    this.isGeneral = !this.raceskill && !this.classskill;
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
