/**
 * Warhero Character Data Model
 * Defines the data schema for character actors using Foundry DataModel API
 */

import { WARHERO_CONFIG } from "../warhero-config.js";
const fields = foundry.data.fields;

/**
 * Data model class for character actors
 * @extends foundry.abstract.TypeDataModel
 */
export class CharacterData extends foundry.abstract.TypeDataModel {

  /**
   * Define the data schema for character actors
   * @returns {Object} The data schema definition
   */
  static defineSchema() {
    return {
      // Sub-actors (companions, familiars, etc.)
      subactors: new fields.ArrayField(
        new fields.StringField({ required: false }),
        {
          initial: [],
          required: false,
          label: "WH.ui.subactors",
          hint: "WH.ui.subactors.hint"
        }
      ),

      // Biographical data
      biodata: new fields.SchemaField({
        class: new fields.StringField({
          initial: "",
          required: false,
          blank: true,
          label: "WH.ui.class",
          hint: "WH.ui.class.hint"
        }),
        age: new fields.NumberField({
          initial: 0,
          required: false,
          min: 0,
          integer: true,
          label: "WH.ui.age",
          hint: "WH.ui.age.hint"
        }),
        size: new fields.StringField({
          initial: "medium",
          required: false,
          blank: false,
          choices: foundry.utils.duplicate(WARHERO_CONFIG.sizeOptions),
          label: "WH.ui.size",
          hint: "WH.ui.size.hint"
        }),
        weight: new fields.StringField({
          initial: "",
          required: false,
          blank: true,
          label: "WH.ui.weight",
          hint: "WH.ui.weight.hint"
        }),
        height: new fields.StringField({
          initial: "",
          required: false,
          blank: true,
          label: "WH.ui.height",
          hint: "WH.ui.height.hint"
        }),
        hair: new fields.StringField({
          initial: "",
          required: false,
          blank: true,
          label: "WH.ui.hair",
          hint: "WH.ui.hair.hint"
        }),
        sex: new fields.StringField({
          initial: "",
          required: false,
          blank: true,
          label: "WH.ui.sex",
          hint: "WH.ui.sex.hint"
        }),
        eyes: new fields.StringField({
          initial: "",
          required: false,
          blank: true,
          label: "WH.ui.eyes",
          hint: "WH.ui.eyes.hint"
        }),
        background: new fields.StringField({
          initial: "",
          required: false,
          blank: true,
          label: "WH.ui.background",
          hint: "WH.ui.background.hint"
        }),
        religion: new fields.StringField({
          initial: "",
          required: false,
          blank: true,
          label: "WH.ui.religion",
          hint: "WH.ui.religion.hint"
        }),
        description: new fields.HTMLField({
          initial: "",
          required: false,
          blank: true,
          label: "WH.ui.description",
          hint: "WH.ui.description.hint"
        }),
        notes: new fields.HTMLField({
          initial: "",
          required: false,
          blank: true,
          label: "WH.ui.notes",
          hint: "WH.ui.notes.hint"
        }),
        gmnotes: new fields.HTMLField({
          initial: "",
          required: false,
          blank: true,
          label: "WH.ui.gmnotes",
          hint: "WH.ui.gmnotes.hint"
        })
      }, {
        label: "WH.ui.biodata",
        hint: "WH.ui.biodata.hint"
      }),

      // Core statistics
      statistics: new fields.SchemaField({
        str: new fields.SchemaField({
          label: new fields.StringField({ initial: "WH.ui.Strength", required: false }),
          abbrev: new fields.StringField({ initial: "str", required: false }),
          style: new fields.StringField({ initial: "edit", required: false }),
          hassave: new fields.BooleanField({ initial: true, required: false }),
          roll: new fields.BooleanField({ initial: true, required: false }),
          save: new fields.NumberField({ initial: 0, required: false, integer: true }),
          value: new fields.NumberField({ initial: 0, required: false, integer: true })
        }),
        dex: new fields.SchemaField({
          label: new fields.StringField({ initial: "WH.ui.Dexterity", required: false }),
          abbrev: new fields.StringField({ initial: "dex", required: false }),
          style: new fields.StringField({ initial: "edit", required: false }),
          hassave: new fields.BooleanField({ initial: true, required: false }),
          roll: new fields.BooleanField({ initial: true, required: false }),
          save: new fields.NumberField({ initial: 0, required: false, integer: true }),
          value: new fields.NumberField({ initial: 0, required: false, integer: true })
        }),
        min: new fields.SchemaField({
          label: new fields.StringField({ initial: "WH.ui.Mind", required: false }),
          abbrev: new fields.StringField({ initial: "min", required: false }),
          style: new fields.StringField({ initial: "edit", required: false }),
          hassave: new fields.BooleanField({ initial: true, required: false }),
          roll: new fields.BooleanField({ initial: true, required: false }),
          save: new fields.NumberField({ initial: 0, required: false, integer: true }),
          value: new fields.NumberField({ initial: 0, required: false, integer: true })
        })
      }, {
        label: "WH.ui.statistics",
        hint: "WH.ui.statistics.hint"
      }),

      // Attributes
      attributes: new fields.SchemaField({
        hp: new fields.SchemaField({
          label: new fields.StringField({ initial: "WH.ui.HitPoints", required: false }),
          abbrev: new fields.StringField({ initial: "hp", required: false }),
          style: new fields.StringField({ initial: "edit", required: false }),
          hasmax: new fields.BooleanField({ initial: true, required: false }),
          isheader: new fields.BooleanField({ initial: true, required: false }),
          max: new fields.NumberField({ initial: 30, required: false, integer: true }),
          value: new fields.NumberField({ initial: 30, required: false, integer: true })
        }),
        knowledge: new fields.SchemaField({
          label: new fields.StringField({ initial: "WH.ui.Knowledge", required: false }),
          abbrev: new fields.StringField({ initial: "knowledge", required: false }),
          style: new fields.StringField({ initial: "edit", required: false }),
          hasmax: new fields.BooleanField({ initial: false, required: false }),
          roll: new fields.BooleanField({ initial: true, required: false }),
          max: new fields.NumberField({ initial: 0, required: false, integer: true }),
          value: new fields.NumberField({ initial: 0, required: false, integer: true })
        }),
        def: new fields.SchemaField({
          label: new fields.StringField({ initial: "WH.ui.Defence", required: false }),
          abbrev: new fields.StringField({ initial: "def", required: false }),
          style: new fields.StringField({ initial: "edit", required: false }),
          iscombat: new fields.BooleanField({ initial: true, required: false }),
          max: new fields.NumberField({ initial: 12, required: false, integer: true }),
          value: new fields.NumberField({ initial: 12, required: false, integer: true })
        }),
        txcm: new fields.SchemaField({
          label: new fields.StringField({ initial: "WH.ui.Throw2HitM", required: false }),
          abbrev: new fields.StringField({ initial: "txcm", required: false }),
          istxc: new fields.BooleanField({ initial: true, required: false }),
          style: new fields.StringField({ initial: "edit", required: false }),
          roll: new fields.BooleanField({ initial: true, required: false }),
          iscombat: new fields.BooleanField({ initial: true, required: false }),
          max: new fields.NumberField({ initial: 0, required: false, integer: true }),
          value: new fields.NumberField({ initial: 0, required: false, integer: true })
        }),
        txcr: new fields.SchemaField({
          label: new fields.StringField({ initial: "WH.ui.Throw2HitR", required: false }),
          abbrev: new fields.StringField({ initial: "txcr", required: false }),
          istxc: new fields.BooleanField({ initial: true, required: false }),
          style: new fields.StringField({ initial: "edit", required: false }),
          roll: new fields.BooleanField({ initial: true, required: false }),
          iscombat: new fields.BooleanField({ initial: true, required: false }),
          max: new fields.NumberField({ initial: 0, required: false, integer: true }),
          value: new fields.NumberField({ initial: 0, required: false, integer: true })
        }),
        mana: new fields.SchemaField({
          label: new fields.StringField({ initial: "WH.ui.Mana", required: false }),
          abbrev: new fields.StringField({ initial: "pm", required: false }),
          style: new fields.StringField({ initial: "edit", required: false }),
          hasmax: new fields.BooleanField({ initial: true, required: false }),
          isheader: new fields.BooleanField({ initial: true, required: false }),
          max: new fields.NumberField({ initial: 3, required: false, integer: true }),
          value: new fields.NumberField({ initial: 3, required: false, integer: true })
        }),
        ini: new fields.SchemaField({
          label: new fields.StringField({ initial: "WH.ui.Initiative", required: false }),
          abbrev: new fields.StringField({ initial: "ini", required: false }),
          style: new fields.StringField({ initial: "edit", required: false }),
          iscombat: new fields.BooleanField({ initial: true, required: false }),
          roll: new fields.BooleanField({ initial: true, required: false }),
          max: new fields.NumberField({ initial: 0, required: false, integer: true }),
          value: new fields.NumberField({ initial: 0, required: false, integer: true })
        }),
        movearth: new fields.SchemaField({
          label: new fields.StringField({ initial: "WH.ui.Movement", required: false }),
          abbrev: new fields.StringField({ initial: "mov", required: false }),
          style: new fields.StringField({ initial: "edit", required: false }),
          max: new fields.NumberField({ initial: 6, required: false, integer: true }),
          value: new fields.NumberField({ initial: 6, required: false, integer: true })
        }),
        movswim: new fields.SchemaField({
          label: new fields.StringField({ initial: "WH.ui.MovementSwim", required: false }),
          abbrev: new fields.StringField({ initial: "mov", required: false }),
          style: new fields.StringField({ initial: "edit", required: false }),
          max: new fields.NumberField({ initial: 0, required: false, integer: true }),
          value: new fields.NumberField({ initial: 0, required: false, integer: true })
        }),
        movfly: new fields.SchemaField({
          label: new fields.StringField({ initial: "WH.ui.MovementFly", required: false }),
          abbrev: new fields.StringField({ initial: "mov", required: false }),
          style: new fields.StringField({ initial: "edit", required: false }),
          max: new fields.NumberField({ initial: 0, required: false, integer: true }),
          value: new fields.NumberField({ initial: 0, required: false, integer: true })
        })
      }, {
        label: "WH.ui.attributes",
        hint: "WH.ui.attributes.hint"
      }),

      // Secondary attributes
      secondary: new fields.SchemaField({
        xp: new fields.SchemaField({
          label: new fields.StringField({ initial: "WH.ui.XP", required: false }),
          abbrev: new fields.StringField({ initial: "xp", required: false }),
          islevel: new fields.BooleanField({ initial: true, required: false }),
          style: new fields.StringField({ initial: "edit", required: false }),
          value: new fields.NumberField({ initial: 0, required: false, integer: true }),
          level: new fields.NumberField({ initial: 0, required: false, integer: true })
        }),
        malusmultiweapon: new fields.SchemaField({
          label: new fields.StringField({ initial: "WH.ui.malusmultiweapon", required: false }),
          abbrev: new fields.StringField({ initial: "malusmultiweapon", required: false }),
          iscombat: new fields.BooleanField({ initial: true, required: false }),
          style: new fields.StringField({ initial: "edit", required: false }),
          value: new fields.NumberField({ initial: 0, required: false, integer: true })
        }),
        drbonus: new fields.SchemaField({
          label: new fields.StringField({ initial: "WH.ui.drbonus", required: false }),
          abbrev: new fields.StringField({ initial: "drbonus", required: false }),
          style: new fields.StringField({ initial: "edit", required: false }),
          iscombat: new fields.BooleanField({ initial: true, required: false }),
          value: new fields.NumberField({ initial: 0, required: false, integer: true })
        }),
        drbonustotal: new fields.SchemaField({
          label: new fields.StringField({ initial: "WH.ui.drbonustotal", required: false }),
          abbrev: new fields.StringField({ initial: "drbonustotal", required: false }),
          disabled: new fields.BooleanField({ initial: true, required: false }),
          style: new fields.StringField({ initial: "edit", required: false }),
          iscombat: new fields.BooleanField({ initial: true, required: false }),
          value: new fields.NumberField({ initial: 0, required: false, integer: true })
        }),
        meleedamagebonus: new fields.SchemaField({
          label: new fields.StringField({ initial: "WH.ui.meleedamagebonus", required: false }),
          abbrev: new fields.StringField({ initial: "meleedamagebonus", required: false }),
          iscombat: new fields.BooleanField({ initial: true, required: false }),
          style: new fields.StringField({ initial: "edit", required: false }),
          value: new fields.NumberField({ initial: 0, required: false, integer: true })
        }),
        rangeddamagebonus: new fields.SchemaField({
          label: new fields.StringField({ initial: "WH.ui.rangeddamagebonus", required: false }),
          abbrev: new fields.StringField({ initial: "rangeddamagebonus", required: false }),
          iscombat: new fields.BooleanField({ initial: true, required: false }),
          style: new fields.StringField({ initial: "edit", required: false }),
          value: new fields.NumberField({ initial: 0, required: false, integer: true })
        }),
        parrybonus: new fields.SchemaField({
          label: new fields.StringField({ initial: "WH.ui.parrybonus", required: false }),
          abbrev: new fields.StringField({ initial: "parrybonus", required: false }),
          isparrybonus: new fields.BooleanField({ initial: true, required: false }),
          iscombat: new fields.BooleanField({ initial: true, required: false }),
          style: new fields.StringField({ initial: "edit", required: false }),
          value: new fields.NumberField({ initial: 0, required: false, integer: true })
        }),
        parrybonustotal: new fields.SchemaField({
          label: new fields.StringField({ initial: "WH.ui.parrybonustotal", required: false }),
          abbrev: new fields.StringField({ initial: "parrybonustotal", required: false }),
          disabled: new fields.BooleanField({ initial: true, required: false }),
          style: new fields.StringField({ initial: "edit", required: false }),
          iscombat: new fields.BooleanField({ initial: true, required: false }),
          roll: new fields.BooleanField({ initial: true, required: false }),
          value: new fields.NumberField({ initial: 0, required: false, integer: true })
        }),
        counterspell: new fields.SchemaField({
          label: new fields.StringField({ initial: "WH.ui.counterspell", required: false }),
          stat: new fields.StringField({ initial: "min", required: false }),
          abbrev: new fields.StringField({ initial: "counterspell", required: false }),
          style: new fields.StringField({ initial: "edit", required: false }),
          hasmax: new fields.BooleanField({ initial: false, required: false }),
          roll: new fields.BooleanField({ initial: true, required: false }),
          max: new fields.NumberField({ initial: 1, required: false, integer: true }),
          value: new fields.NumberField({ initial: 0, required: false, integer: true }),
          hasuse: new fields.BooleanField({ initial: true, required: false }),
          nbuse: new fields.NumberField({ initial: 0, required: false, integer: true }),
          maxuse: new fields.NumberField({ initial: 0, required: false, integer: true })
        }),
        createitem: new fields.SchemaField({
          label: new fields.StringField({ initial: "WH.ui.createitem", required: false }),
          abbrev: new fields.StringField({ initial: "createitem", required: false }),
          style: new fields.StringField({ initial: "edit", required: false }),
          value: new fields.NumberField({ initial: 0, required: false, integer: true })
        }),
        nblanguage: new fields.SchemaField({
          label: new fields.StringField({ initial: "WH.ui.languagesbonus", required: false }),
          abbrev: new fields.StringField({ initial: "nblanguage", required: false }),
          style: new fields.StringField({ initial: "edit", required: false }),
          disabled: new fields.BooleanField({ initial: true, required: false }),
          value: new fields.NumberField({ initial: 0, required: false, integer: true })
        })
      }, {
        label: "WH.ui.secondary",
        hint: "WH.ui.secondary.hint"
      })
    };
  }

  /**
   * Prepare base data for the character
   */
  prepareBaseData() {
    super.prepareBaseData();

    // Ensure all numeric values are valid
    this.biodata.age = Math.max(0, this.biodata.age);

    // Statistics
    for (let stat of Object.values(this.statistics)) {
      stat.save = Math.max(0, stat.save);
      stat.value = Math.max(0, stat.value);
    }

    // Attributes
    for (let attr of Object.values(this.attributes)) {
      if (attr.max !== undefined) attr.max = Math.max(0, attr.max);
      if (attr.value !== undefined) attr.value = Math.max(0, attr.value);

      // Clamp current value to max if applicable
      if (attr.hasmax && attr.max > 0) {
        attr.value = Math.min(attr.value, attr.max);
      }
    }

    // Secondary attributes
    for (let sec of Object.values(this.secondary)) {
      if (sec.value !== undefined) sec.value = Math.max(0, sec.value);
      if (sec.max !== undefined) sec.max = Math.max(0, sec.max);
      if (sec.nbuse !== undefined) sec.nbuse = Math.max(0, sec.nbuse);
      if (sec.maxuse !== undefined) sec.maxuse = Math.max(0, sec.maxuse);
    }
  }

  /**
   * Prepare derived data for the character
   */
  prepareDerivedData() {
    super.prepareDerivedData();

    // Calculate derived combat values
    this._calculateCombatValues();

    // Calculate resource usage
    this._calculateResourceUsage();

    // Calculate totals
    this._calculateTotals();
  }

  /**
   * Calculate combat-related derived values
   * @private
   */
  _calculateCombatValues() {
    // Calculate total damage reduction
    this.secondary.drbonustotal.value = this.secondary.drbonus.value;

    // Calculate total parry bonus
    this.secondary.parrybonustotal.value = this.secondary.parrybonus.value;

    // Add equipment bonuses (would be calculated from equipped items)
    // This would be done in the actor's prepareDerivedData method
  }

  /**
   * Calculate resource usage and availability
   * @private
   */
  _calculateResourceUsage() {
    // HP percentage
    this.hpPercentage = this.attributes.hp.max > 0 ?
      (this.attributes.hp.value / this.attributes.hp.max) * 100 : 0;

    // Mana percentage
    this.manaPercentage = this.attributes.mana.max > 0 ?
      (this.attributes.mana.value / this.attributes.mana.max) * 100 : 0;

    // Counterspell usage
    this.counterspellAvailable = this.secondary.counterspell.maxuse > 0 ?
      this.secondary.counterspell.maxuse - this.secondary.counterspell.nbuse : 0;
  }

  /**
   * Calculate various totals and derived stats
   * @private
   */
  _calculateTotals() {
    // Calculate total languages known
    this.secondary.nblanguage.value = this.biodata.class ? 1 : 0; // Base + bonuses

    // Character is alive/conscious
    this.isAlive = this.attributes.hp.value > 0;
    this.isConscious = this.attributes.hp.value > 0;
    this.isWounded = this.attributes.hp.value < this.attributes.hp.max;

    // Magic user
    this.isMagicUser = this.attributes.mana.max > 0;
    this.hasMana = this.attributes.mana.value > 0;
  }

  /**
   * Validate character data
   */
  validateJoint(options = {}) {
    super.validateJoint(options);

    // Validate HP values
    if (this.attributes.hp.value > this.attributes.hp.max) {
      throw new foundry.data.validation.DataModelValidationFailure({
        unresolved: true,
        message: "Current HP cannot exceed maximum HP"
      });
    }

    // Validate mana values
    if (this.attributes.mana.value > this.attributes.mana.max) {
      throw new foundry.data.validation.DataModelValidationFailure({
        unresolved: true,
        message: "Current mana cannot exceed maximum mana"
      });
    }

    // Validate counterspell usage
    if (this.secondary.counterspell.nbuse > this.secondary.counterspell.maxuse) {
      throw new foundry.data.validation.DataModelValidationFailure({
        unresolved: true,
        message: "Counterspell uses cannot exceed maximum uses"
      });
    }
  }

  /**
   * Migrate character data
   */
  static migrateData(data) {
    return super.migrateData(data);
  }

  /**
   * Rest the character (restore resources)
   */
  async rest(type = "short") {
    const updateData = {};

    if (type === "long") {
      // Long rest - restore all resources
      updateData["system.attributes.hp.value"] = this.attributes.hp.max;
      updateData["system.attributes.mana.value"] = this.attributes.mana.max;
      updateData["system.secondary.counterspell.nbuse"] = 0;
    } else {
      // Short rest - restore partial resources
      const hpRestore = Math.floor(this.attributes.hp.max * 0.25);
      updateData["system.attributes.hp.value"] = Math.min(
        this.attributes.hp.max,
        this.attributes.hp.value + hpRestore
      );
    }

    return await this.parent.update(updateData);
  }

  /**
   * Spend mana
   */
  async spendMana(amount) {
    if (amount <= 0 || amount > this.attributes.mana.value) return false;

    const updateData = {
      "system.attributes.mana.value": this.attributes.mana.value - amount
    };

    await this.parent.update(updateData);
    return true;
  }

  /**
   * Take damage
   */
  async takeDamage(amount, type = "normal") {
    if (amount <= 0) return false;

    // Apply damage reduction
    let finalDamage = Math.max(0, amount - this.secondary.drbonustotal.value);

    const updateData = {
      "system.attributes.hp.value": Math.max(0, this.attributes.hp.value - finalDamage)
    };

    await this.parent.update(updateData);
    return true;
  }

  /**
   * Heal damage
   */
  async heal(amount) {
    if (amount <= 0) return false;

    const updateData = {
      "system.attributes.hp.value": Math.min(
        this.attributes.hp.max,
        this.attributes.hp.value + amount
      )
    };

    await this.parent.update(updateData);
    return true;
  }
}