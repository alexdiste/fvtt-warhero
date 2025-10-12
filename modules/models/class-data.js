/**
 * Warhero Class Data Model
 * Defines the data schema for class items using Foundry DataModel API
 */

const fields = foundry.data.fields;

import { WARHERO_CONFIG } from "../warhero-config.js";
/**
 * Data model class for class items
 * @extends foundry.abstract.TypeDataModel
 */
export class ClassData extends foundry.abstract.TypeDataModel {

  /**
   * Define the data schema for class items
   * @returns {Object} The data schema definition
   */
  static defineSchema() {
    return {
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
      }),

      // Class-specific properties
      issecondary: new fields.BooleanField({
        initial: false,
        required: false,
        label: "WH.ui.issecondary",
        hint: "WH.ui.issecondary.hint"
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
   * Prepare base data for the class
   */
  prepareBaseData() {
    super.prepareBaseData();

    // No specific base data preparation needed
  }

  /**
   * Prepare derived data for the class
   */
  prepareDerivedData() {
    super.prepareDerivedData();

    // Class-specific properties
    this.isPrimary = !this.issecondary;
    this.isSecondary = this.issecondary;

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
   * Validate class data
   */
  validateJoint(options = {}) {
    super.validateJoint(options);

    // No specific validation needed for classes currently
  }

  /**
   * Migrate class data
   */
  static migrateData(data) {
    return super.migrateData(data);
  }

  /**
   * Check if class grants proficiency with a weapon type
   */
  hasWeaponProficiency(weaponType) {
    return this.weapons[weaponType] === true;
  }

  /**
   * Check if class grants proficiency with an armor type
   */
  hasArmorProficiency(armorType) {
    return this.armors[armorType] === true;
  }

  /**
   * Check if class grants proficiency with a shield type
   */
  hasShieldProficiency(shieldType) {
    return this.shields[shieldType] === true;
  }
}