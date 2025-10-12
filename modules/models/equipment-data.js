
/**
 * Warhero Equipment Data Model
 * Defines the data schema for equipment items using Foundry DataModel API
 */
import { WARHERO_CONFIG } from "../warhero-config.js";
const fields = foundry.data.fields;

/**
 * Data model class for equipment items
 * @extends foundry.abstract.TypeDataModel
 */
export class EquipmentData extends foundry.abstract.TypeDataModel {

  /**
   * Define the data schema for equipment items
   * @returns {Object} The data schema definition
   */
  static defineSchema() {
    let slotLocationChoices = {}
    for (const locId in WARHERO_CONFIG.slotNames) {
      let loc = WARHERO_CONFIG.slotNames[locId];
      slotLocationChoices[locId] = loc.label;
    }

    return {
      // Type of equipment (armor, weapon, tool, etc.)
      equiptype: new fields.StringField({
        initial: "",
        required: false,
        blank: true,
        label: "WH.ui.equiptype",
        hint: "WH.ui.equiptype.hint"
      }),

      // Economic properties
      cost: new fields.NumberField({
        initial: 0,
        required: false,
        min: 0,
        integer: true,
        label: "WH.ui.cost",
        hint: "WH.ui.cost.hint"
      }),

      // Inventory properties
      quantity: new fields.NumberField({
        initial: 1,
        required: false,
        min: 0,
        integer: true,
        label: "WH.ui.quantity",
        hint: "WH.ui.quantity.hint"
      }),

      equipped: new fields.BooleanField({
        initial: false,
        required: false,
        label: "WH.ui.equipped",
        hint: "WH.ui.equipped.hint"
      }),

      // Slot management
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

      providedslot: new fields.NumberField({
        initial: 0,
        required: false,
        min: 0,
        integer: true,
        label: "WH.ui.providedslot",
        hint: "WH.ui.providedslot.hint"
      }),

      // Identification status
      isidentified: new fields.StringField({
        initial: "unknown",
        required: false,
        blank: false,
        choices: foundry.utils.duplicate(WARHERO_CONFIG.identifiedState),
        label: "WH.ui.isidentified",
        hint: "WH.ui.isidentified.hint"
      }),

      // Magic properties
      magiccharge: new fields.StringField({
        initial: "notapplicable",
        required: false,
        blank: false,
        choices: foundry.utils.duplicate(WARHERO_CONFIG.magicCharge),
        label: "WH.ui.magiccharge",
        hint: "WH.ui.magiccharge.hint"
      }),

      chargevalue: new fields.NumberField({
        initial: 0,
        required: false,
        min: 0,
        integer: true,
        label: "WH.ui.chargevalue",
        hint: "WH.ui.chargevalue.hint"
      }),

      chargevaluemax: new fields.NumberField({
        initial: 0,
        required: false,
        min: 0,
        integer: true,
        label: "WH.ui.chargevaluemax",
        hint: "WH.ui.chargevaluemax.hint"
      }),

      // Description
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
   * Prepare base data for the equipment
   * This runs before derived data preparation
   */
  prepareBaseData() {
    super.prepareBaseData();

    // Ensure quantity is at least 0
    this.quantity = Math.max(0, this.quantity);

    // Ensure slot values are valid
    this.slotused = Math.max(0, this.slotused);
    this.providedslot = Math.max(0, this.providedslot);

    // Ensure charge values are valid
    this.chargevalue = Math.max(0, this.chargevalue);
    this.chargevaluemax = Math.max(0, this.chargevaluemax);

    // Clamp charge value to max if max is set
    if (this.chargevaluemax > 0) {
      this.chargevalue = Math.min(this.chargevalue, this.chargevaluemax);
    }
  }

  /**
   * Prepare derived data for the equipment
   * This runs after base data preparation
   */
  prepareDerivedData() {
    super.prepareDerivedData();

    // Calculate if item is usable (has charges or doesn't need them)
    this.isUsable = this.magiccharge === "notapplicable" ||
      this.magiccharge === "unlimited" ||
      (this.magiccharge === "charged" && this.chargevalue > 0);

    // Calculate total cost (cost * quantity)
    this.totalCost = this.cost * this.quantity;

    // Calculate if item is magical
    this.isMagical = this.magiccharge !== "notapplicable";

    // Calculate effective slot usage (total slots used by this item stack)
    this.effectiveSlotUsage = this.slotused * this.quantity;
  }

  /**
   * Validate that the equipment data is coherent
   * @param {Object} options Validation options
   */
  validateJoint(options = {}) {
    super.validateJoint(options);

    // If magic charge is set to charged, ensure max charge is > 0
    if (this.magiccharge === "charged" && this.chargevaluemax <= 0) {
      throw new foundry.data.validation.DataModelValidationFailure({
        unresolved: true,
        message: "Equipment with 'charged' magic type must have a maximum charge value greater than 0"
      });
    }

    // If equipped is true, slot location should not be backpack
    if (this.equipped && this.slotlocation === "backpack") {
      throw new foundry.data.validation.DataModelValidationFailure({
        unresolved: true,
        message: "Equipped items cannot be stored in backpack"
      });
    }
  }

  /**
   * Migrate data from old template format to new DataModel format
   * @param {Object} data The data to migrate
   * @returns {Object} The migrated data
   */
  static migrateData(data) {
    // Handle any legacy field names or data structure changes here
    // This is called automatically when loading old data

    // Example: if we had an old field name that needs to be changed
    // if (data.oldFieldName !== undefined) {
    //   data.equiptype = data.oldFieldName;
    //   delete data.oldFieldName;
    // }

    return super.migrateData(data);
  }

  /**
   * Use the equipment item
   * This method can be called when the item is used/activated
   * @param {Object} options Options for using the item
   * @returns {Promise<boolean>} Whether the item was successfully used
   */
  async use(options = {}) {
    // Check if item can be used
    if (!this.isUsable) {
      ui.notifications.warn("This item cannot be used (no charges remaining or not usable)");
      return false;
    }

    // If item has charges, consume one
    if (this.magiccharge === "charged" && this.chargevalue > 0) {
      const updateData = {
        "system.chargevalue": this.chargevalue - 1
      };

      await this.parent.update(updateData);

      // Notify about charge consumption
      if (this.chargevalue - 1 <= 0) {
        ui.notifications.info(`${this.parent.name} has no charges remaining`);
      }
    }

    return true;
  }

  /**
   * Toggle the equipped status of the item
   * @returns {Promise<Item>} The updated item
   */
  async toggleEquipped() {
    const newEquippedState = !this.equipped;
    const updateData = {
      "system.equipped": newEquippedState
    };

    // If equipping, move out of backpack to appropriate slot if still in backpack
    if (newEquippedState && this.slotlocation === "backpack") {
      // Default to body slot for generic equipment
      updateData["system.slotlocation"] = "body";
    }
    // If unequipping, move to backpack
    else if (!newEquippedState) {
      updateData["system.slotlocation"] = "backpack";
    }

    return await this.parent.update(updateData);
  }
}