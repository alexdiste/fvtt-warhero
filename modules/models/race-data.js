/**
 * Warhero Race Data Model
 * Defines the data schema for race items using Foundry DataModel API
 */

import { WARHERO_CONFIG } from "../warhero-config.js";
const fields = foundry.data.fields;

/**
 * Data model class for race items
 * @extends foundry.abstract.TypeDataModel
 */
export class RaceData extends foundry.abstract.TypeDataModel {

  /**
   * Define the data schema for race items
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
      }),

      hpprogresion: new fields.StringField({
        initial: "medium",
        required: false,
        blank: false,
        choices: foundry.utils.duplicate(WARHERO_CONFIG.progressionList),
        label: "WH.ui.hpprogresion",
        hint: "WH.ui.hpprogresion.hint"
      }),

      languages: new fields.StringField({
        initial: "",
        required: false,
        blank: true,
        label: "WH.ui.languages",
        hint: "WH.ui.languages.hint"
      }),

      attributebonus1: new fields.StringField({
        initial: "",
        required: false,
        blank: true,
        label: "WH.ui.attributebonus1",
        hint: "WH.ui.attributebonus1.hint"
      }),

      attributebonus4: new fields.StringField({
        initial: "",
        required: false,
        blank: true,
        label: "WH.ui.attributebonus4",
        hint: "WH.ui.attributebonus4.hint"
      }),

      attributebonus8: new fields.StringField({
        initial: "",
        required: false,
        blank: true,
        label: "WH.ui.attributebonus8",
        hint: "WH.ui.attributebonus8.hint"
      }),

      // Common class/race template properties
      weapons: new fields.SchemaField({
        short: new fields.BooleanField({
          initial: false,
          required: false,
          label: "WH.ui.weapons.short"
        }),
        long: new fields.BooleanField({
          initial: false,
          required: false,
          label: "WH.ui.weapons.long"
        }),
        twohanded: new fields.BooleanField({
          initial: false,
          required: false,
          label: "WH.ui.weapons.twohanded"
        }),
        shooting: new fields.BooleanField({
          initial: false,
          required: false,
          label: "WH.ui.weapons.shooting"
        }),
        polearm: new fields.BooleanField({
          initial: false,
          required: false,
          label: "WH.ui.weapons.polearm"
        }),
        throwing: new fields.BooleanField({
          initial: false,
          required: false,
          label: "WH.ui.weapons.throwing"
        })
      }, {
        label: "WH.ui.weapons",
        hint: "WH.ui.weapons.hint"
      }),

      armors: new fields.SchemaField({
        light: new fields.BooleanField({
          initial: false,
          required: false,
          label: "WH.ui.armors.light"
        }),
        medium: new fields.BooleanField({
          initial: false,
          required: false,
          label: "WH.ui.armors.medium"
        }),
        heavy: new fields.BooleanField({
          initial: false,
          required: false,
          label: "WH.ui.armors.heavy"
        })
      }, {
        label: "WH.ui.armors",
        hint: "WH.ui.armors.hint"
      }),

      shields: new fields.SchemaField({
        light: new fields.BooleanField({
          initial: false,
          required: false,
          label: "WH.ui.shields.light"
        }),
        medium: new fields.BooleanField({
          initial: false,
          required: false,
          label: "WH.ui.shields.medium"
        }),
        tower: new fields.BooleanField({
          initial: false,
          required: false,
          label: "WH.ui.shields.tower"
        })
      }, {
        label: "WH.ui.shields",
        hint: "WH.ui.shields.hint"
      })
    };
  }

  /**
   * Prepare base data for the race
   */
  prepareBaseData() {
    super.prepareBaseData();

    // Parse HP progression numeric value
    this.hpProgressionValue = parseInt(this.hpprogresion.replace('hp', '')) || 2;
  }

  /**
   * Prepare derived data for the race
   */
  prepareDerivedData() {
    super.prepareDerivedData();

    // Race-specific properties
    this.hasLanguages = this.languages && this.languages.trim() !== "";
    this.hasLevel1Bonus = this.attributebonus1 && this.attributebonus1.trim() !== "";
    this.hasLevel4Bonus = this.attributebonus4 && this.attributebonus4.trim() !== "";
    this.hasLevel8Bonus = this.attributebonus8 && this.attributebonus8.trim() !== "";

    // Parse language list
    this.languagesList = this.hasLanguages ?
      this.languages.split(',').map(lang => lang.trim()).filter(lang => lang) : [];

    // Weapon proficiencies
    this.weaponProficiencies = [];
    if (this.weapons.short) this.weaponProficiencies.push("short");
    if (this.weapons.long) this.weaponProficiencies.push("long");
    if (this.weapons.twohanded) this.weaponProficiencies.push("twohanded");
    if (this.weapons.shooting) this.weaponProficiencies.push("shooting");
    if (this.weapons.polearm) this.weaponProficiencies.push("polearm");
    if (this.weapons.throwing) this.weaponProficiencies.push("throwing");

    // Armor proficiencies
    this.armorProficiencies = [];
    if (this.armors.light) this.armorProficiencies.push("light");
    if (this.armors.medium) this.armorProficiencies.push("medium");
    if (this.armors.heavy) this.armorProficiencies.push("heavy");

    // Shield proficiencies
    this.shieldProficiencies = [];
    if (this.shields.light) this.shieldProficiencies.push("light");
    if (this.shields.medium) this.shieldProficiencies.push("medium");
    if (this.shields.tower) this.shieldProficiencies.push("tower");

    // Total proficiencies count
    this.totalProficiencies = this.weaponProficiencies.length +
      this.armorProficiencies.length +
      this.shieldProficiencies.length;
  }

  /**
   * Validate race data
   */
  validateJoint(options = {}) {
    super.validateJoint(options);

    // Validate HP progression value
    const validHPProgressions = ["hp2", "hp4", "hp6", "hp8"];
    if (!validHPProgressions.includes(this.hpprogresion)) {
      throw new foundry.data.validation.DataModelValidationFailure({
        unresolved: true,
        message: "Invalid HP progression value"
      });
    }
  }

  /**
   * Migrate race data
   */
  static migrateData(data) {
    return super.migrateData(data);
  }

  /**
   * Check if race grants proficiency with a weapon type
   */
  hasWeaponProficiency(weaponType) {
    return this.weapons[weaponType] === true;
  }

  /**
   * Check if race grants proficiency with an armor type
   */
  hasArmorProficiency(armorType) {
    return this.armors[armorType] === true;
  }

  /**
   * Check if race grants proficiency with a shield type
   */
  hasShieldProficiency(shieldType) {
    return this.shields[shieldType] === true;
  }

  /**
   * Get attribute bonus for a specific level
   */
  getAttributeBonusForLevel(level) {
    if (level >= 8 && this.attributebonus8) return this.attributebonus8;
    if (level >= 4 && this.attributebonus4) return this.attributebonus4;
    if (level >= 1 && this.attributebonus1) return this.attributebonus1;
    return "";
  }
}