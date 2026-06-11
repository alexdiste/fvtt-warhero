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

  static LOCALIZATION_PREFIXES = ["WH.Character"];

  /**
   * Define the data schema for character actors
   * @returns {Object} The data schema definition
   */
  static defineSchema() {
    return {
      // Biographical data
      biodata: new fields.SchemaField({
        class: new fields.StringField({
          initial: "",
          required: false,
          blank: true,
          label: "WH.ui.class",
          hint: "WH.ui.class.hint"
        }),
        origin: new fields.StringField({
          initial: "",
          required: false,
          blank: true,
          label: "WH.ui.origin",
          hint: "WH.ui.origin.hint"
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
          choices: foundry.utils.deepClone(WARHERO_CONFIG.sizeOptions),
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
        temporaryhp: new fields.SchemaField({
          label: new fields.StringField({ initial: "WH.ui.TemporaryHitPoints", required: false }),
          abbrev: new fields.StringField({ initial: "thp", required: false }),
          style: new fields.StringField({ initial: "edit", required: false }),
          hasmax: new fields.BooleanField({ initial: false, required: false }),
          isheader: new fields.BooleanField({ initial: true, required: false }),
          max: new fields.NumberField({ initial: 0, required: false, integer: true }),
          value: new fields.NumberField({ initial: 0, required: false, integer: true })
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
        movcharge: new fields.SchemaField({
          label: new fields.StringField({ initial: "WH.ui.MovementCharge", required: false }),
          abbrev: new fields.StringField({ initial: "movcharge", required: false }),
          style: new fields.StringField({ initial: "edit", required: false }),
          max: new fields.NumberField({ initial: 0, required: false, integer: true }),
          value: new fields.NumberField({ initial: 0, required: false, integer: true })
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
        disarmbonus: new fields.SchemaField({
          label: new fields.StringField({ initial: "WH.ui.disarmbonus", required: false }),
          abbrev: new fields.StringField({ initial: "disarmbonus", required: false }),
          iscombat: new fields.BooleanField({ initial: true, required: false }),
          style: new fields.StringField({ initial: "edit", required: false }),
          value: new fields.NumberField({ initial: 0, required: false, integer: true })
        }),
        tripbonus: new fields.SchemaField({
          label: new fields.StringField({ initial: "WH.ui.tripbonus", required: false }),
          abbrev: new fields.StringField({ initial: "tripbonus", required: false }),
          iscombat: new fields.BooleanField({ initial: true, required: false }),
          style: new fields.StringField({ initial: "edit", required: false }),
          value: new fields.NumberField({ initial: 0, required: false, integer: true })
        }),
        defensivebonus: new fields.SchemaField({
          label: new fields.StringField({ initial: "WH.ui.defensivebonus", required: false }),
          abbrev: new fields.StringField({ initial: "defensivebonus", required: false }),
          iscombat: new fields.BooleanField({ initial: true, required: false }),
          style: new fields.StringField({ initial: "edit", required: false }),
          value: new fields.NumberField({ initial: 0, required: false, integer: true })
        }),
        percentbonus: new fields.SchemaField({
          label: new fields.StringField({ initial: "WH.ui.percentbonus", required: false }),
          abbrev: new fields.StringField({ initial: "percentbonus", required: false }),
          style: new fields.StringField({ initial: "edit", required: false }),
          value: new fields.NumberField({ initial: 0, required: false, integer: true }),
          rollD100: new fields.BooleanField({ initial: true, required: false }),
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

    // Stats
    for (let stat of Object.values(this.statistics)) {
      //stat.save = Math.max(0, stat.save);
      //stat.value = Math.max(0, stat.value);
    }

    // Attributes
    for (let [key, attr] of Object.entries(this.attributes)) {
      if (attr.max !== undefined) attr.max = Math.max(0, attr.max);
      if (attr.value !== undefined) attr.value = Math.max(0, attr.value);

      // Clamp current value to max if applicable.
      // Skip hp — its effective max is recomputed in prepareDerivedData() to
      // account for ActiveEffects on STR and on hp.max directly. Clamping
      // against the base max would drop valid HP when effects raise the ceiling.
      if (attr.hasmax && attr.max > 0 && key !== "hp") {
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
   * Prepare derived data for the character.
   *
   * Lifecycle reminder (Foundry v14):
   *   1. prepareBaseData()          — base values, before effects
   *   2. applyActiveEffects()       — Foundry mutates schema fields directly
   *   3. prepareDerivedData()       — computed / derived fields
   *
   * STR effects and direct hp.max effects both land between (1) and (3).
   * We recompute hp.max here from the (already-mutated) STR so that STR
   * debuffs/buffs flow through to HP. Direct ADD effects on hp.max are
   * summed separately and added on top. The final hp.max is the effective
   * (gameplay) value; the stored value in the DB is irrelevant because
   * prepareBaseData always overwrites it.
   */
  prepareDerivedData() {
    super.prepareDerivedData();

    // 1. Read STR after any ActiveEffect mutations
    const postStr = this.statistics?.str?.value ?? 0;
    const hpFromStr = 30 + Math.max(0, postStr) * 10;

    // 2. Sum direct ADD effects targeting system.attributes.hp.max
    const hpDirectEffects = this._getAdditiveEffectTotal("system.attributes.hp.max");

    // 3. Effective max = STR-derived portion + direct effect deltas
    this.attributes.hp.max = hpFromStr + hpDirectEffects;

    // 4. Clamp current value to the effective max (deferred from
    //    prepareBaseData because only now do we know the final value).
    if (this.attributes.hp.max > 0) {
      this.attributes.hp.value = Math.min(this.attributes.hp.value, this.attributes.hp.max);
    }

    // 5. Mark auto-computed fields so sheets can disable their inputs
    this.attributes.hp.maxLocked = true;

    // Calculate resource usage
    this._calculateResourceUsage();

    // Calculate totals
    this._calculateTotals();
  }

  /**
   * Sum the values of all ADD-mode ActiveEffect changes targeting a given key.
   * Handles both v14 (change.type) and v12/v13 (change.mode) formats.
   * @param {string} key  The effect change key (e.g. "system.attributes.hp.max")
   * @returns {number}
   * @private
   */
  _getAdditiveEffectTotal(key) {
    const effects = this.parent?.allApplicableEffects?.() ?? [];
    let total = 0;
    for (const effect of effects) {
      if (effect.disabled) continue;
      for (const change of effect.changes) {
        if (change.key !== key) continue;
        const t = change.type ?? (
          change.mode === undefined ? undefined :
          change.mode === 2 ? "add" : undefined
        );
        if (t !== "add") continue;
        const v = Number(change.value);
        if (Number.isFinite(v)) total += v;
      }
    }
    return total;
  }

  /**
   * Calculate resource usage and availability
   * @private
   */
  _calculateResourceUsage() {
    // hp.max is now the effective value (STR-derived + ActiveEffects)
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
    // hp.max is now the effective value (STR-derived + ActiveEffects)
    this.isAlive = this.attributes.hp.value > 0;
    this.isWounded = this.attributes.hp.value < this.attributes.hp.max;
  }


  /**
   * Migrate character data
   */
  static migrateData(data) {
    return super.migrateData(data);
  }
}
