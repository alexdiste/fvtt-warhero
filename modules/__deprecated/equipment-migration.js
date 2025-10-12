/**
 * Migration utility for Equipment DataModel
 * Helps transition from template.json to DataModel system
 */

/**
 * Migration utility class for equipment items
 */
export class EquipmentMigration {

  /**
   * Check if an equipment item needs migration
   * @param {Object} itemData The item data to check
   * @returns {boolean} True if migration is needed
   */
  static needsMigration(itemData) {
    if (itemData.type !== "equipment") return false;

    // Add specific migration checks here
    // For example, if we change field names or add required fields

    // Check for legacy field names that need to be updated
    const legacyFields = [
      // Add any old field names that need migration
      // Example: "oldFieldName"
    ];

    return legacyFields.some(field => itemData.system?.hasOwnProperty(field));
  }

  /**
   * Migrate equipment data from old format to new DataModel format
   * @param {Object} itemData The item data to migrate
   * @returns {Object} The migrated item data
   */
  static migrateEquipmentData(itemData) {
    if (itemData.type !== "equipment") return itemData;

    console.log(`Migrating equipment item: ${itemData.name}`);

    // Create a deep copy to avoid mutating the original
    const migratedData = foundry.utils.deepClone(itemData);

    // Ensure all required fields exist with proper defaults
    const systemDefaults = {
      equiptype: "",
      cost: 0,
      quantity: 1,
      equipped: false,
      slotused: 1,
      slotlocation: "backpack",
      providedslot: 0,
      isidentified: "unknown",
      magiccharge: "notapplicable",
      chargevalue: 0,
      chargevaluemax: 0,
      description: ""
    };

    // Merge defaults with existing data
    migratedData.system = foundry.utils.mergeObject(
      systemDefaults,
      migratedData.system || {},
      { inplace: false }
    );

    // Specific field migrations (examples)

    // Example 1: If we had an old field called "itemtype" that should become "equiptype"
    // if (migratedData.system.itemtype !== undefined) {
    //   migratedData.system.equiptype = migratedData.system.itemtype;
    //   delete migratedData.system.itemtype;
    // }

    // Example 2: Convert old boolean magic field to new string format
    // if (typeof migratedData.system.ismagical === "boolean") {
    //   migratedData.system.magiccharge = migratedData.system.ismagical ? "unlimited" : "notapplicable";
    //   delete migratedData.system.ismagical;
    // }

    // Example 3: Ensure proper slot location values
    const validSlotLocations = ["backpack", "belt", "body", "hands", "head", "feet", "ring", "neck"];
    if (!validSlotLocations.includes(migratedData.system.slotlocation)) {
      migratedData.system.slotlocation = "backpack";
    }

    // Example 4: Ensure proper identification values
    const validIdentificationStates = ["unknown", "identified", "unidentified"];
    if (!validIdentificationStates.includes(migratedData.system.isidentified)) {
      migratedData.system.isidentified = "unknown";
    }

    // Example 5: Ensure proper magic charge values
    const validMagicChargeTypes = ["notapplicable", "charged", "unlimited", "consumed"];
    if (!validMagicChargeTypes.includes(migratedData.system.magiccharge)) {
      migratedData.system.magiccharge = "notapplicable";
    }

    // Validate numeric fields
    migratedData.system.cost = Math.max(0, Number(migratedData.system.cost) || 0);
    migratedData.system.quantity = Math.max(0, Number(migratedData.system.quantity) || 1);
    migratedData.system.slotused = Math.max(0, Number(migratedData.system.slotused) || 1);
    migratedData.system.providedslot = Math.max(0, Number(migratedData.system.providedslot) || 0);
    migratedData.system.chargevalue = Math.max(0, Number(migratedData.system.chargevalue) || 0);
    migratedData.system.chargevaluemax = Math.max(0, Number(migratedData.system.chargevaluemax) || 0);

    // Validate boolean fields
    migratedData.system.equipped = Boolean(migratedData.system.equipped);

    // Clean up HTML description
    if (typeof migratedData.system.description === "string") {
      // Ensure it's wrapped in HTML tags if it contains content
      const desc = migratedData.system.description.trim();
      if (desc && !desc.startsWith("<")) {
        migratedData.system.description = `<p>${desc}</p>`;
      }
    }

    console.log(`✓ Migrated equipment item: ${itemData.name}`);
    return migratedData;
  }

  /**
   * Batch migrate all equipment items in the world
   * Should be called during system migration or manually by GM
   * @returns {Promise<number>} Number of items migrated
   */
  static async migrateAllEquipment() {
    console.log("Starting batch migration of all equipment items...");

    let migratedCount = 0;
    const updates = [];

    // Migrate items in the world
    for (let item of game.items) {
      if (this.needsMigration(item.toObject())) {
        const migratedData = this.migrateEquipmentData(item.toObject());
        updates.push({
          _id: item.id,
          system: migratedData.system
        });
        migratedCount++;
      }
    }

    // Migrate items owned by actors
    for (let actor of game.actors) {
      const actorUpdates = [];
      for (let item of actor.items) {
        if (this.needsMigration(item.toObject())) {
          const migratedData = this.migrateEquipmentData(item.toObject());
          actorUpdates.push({
            _id: item.id,
            system: migratedData.system
          });
          migratedCount++;
        }
      }

      if (actorUpdates.length > 0) {
        await actor.updateEmbeddedDocuments("Item", actorUpdates);
      }
    }

    // Apply world item updates
    if (updates.length > 0) {
      await Item.updateDocuments(updates);
    }

    console.log(`✓ Batch migration complete. Migrated ${migratedCount} equipment items.`);
    return migratedCount;
  }

  /**
   * Validate that an equipment item data is compatible with the DataModel
   * @param {Object} itemData The item data to validate
   * @returns {Array<string>} Array of validation errors (empty if valid)
   */
  static validateEquipmentData(itemData) {
    if (itemData.type !== "equipment") return [];

    const errors = [];
    const system = itemData.system || {};

    // Check required numeric constraints
    if (system.cost < 0) errors.push("Cost cannot be negative");
    if (system.quantity < 0) errors.push("Quantity cannot be negative");
    if (system.slotused < 0) errors.push("Slot used cannot be negative");
    if (system.providedslot < 0) errors.push("Provided slot cannot be negative");
    if (system.chargevalue < 0) errors.push("Charge value cannot be negative");
    if (system.chargevaluemax < 0) errors.push("Max charge value cannot be negative");

    // Check choice field constraints
    const validSlotLocations = ["backpack", "belt", "body", "hands", "head", "feet", "ring", "neck"];
    if (system.slotlocation && !validSlotLocations.includes(system.slotlocation)) {
      errors.push(`Invalid slot location: ${system.slotlocation}`);
    }

    const validIdentificationStates = ["unknown", "identified", "unidentified"];
    if (system.isidentified && !validIdentificationStates.includes(system.isidentified)) {
      errors.push(`Invalid identification state: ${system.isidentified}`);
    }

    const validMagicChargeTypes = ["notapplicable", "charged", "unlimited", "consumed"];
    if (system.magiccharge && !validMagicChargeTypes.includes(system.magiccharge)) {
      errors.push(`Invalid magic charge type: ${system.magiccharge}`);
    }

    // Check logical constraints
    if (system.magiccharge === "charged" && system.chargevaluemax <= 0) {
      errors.push("Charged magic items must have a maximum charge value greater than 0");
    }

    if (system.equipped && system.slotlocation === "backpack") {
      errors.push("Equipped items cannot be stored in backpack");
    }

    return errors;
  }
}

// Make migration utility available globally for console use
window.EquipmentMigration = EquipmentMigration;