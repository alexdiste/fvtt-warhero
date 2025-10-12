/**
 * Global Migration utility for all Item DataModels
 * Helps transition from template.json to DataModel system
 */

/**
 * Global migration utility class for all item types
 */
export class ItemMigration {

  /**
   * Map of item types to their expected schemas
   */
  static itemSchemas = {
    equipment: {
      equiptype: "", cost: 0, quantity: 1, equipped: false, slotused: 1,
      slotlocation: "backpack", providedslot: 0, isidentified: "unknown",
      magiccharge: "notapplicable", chargevalue: 0, chargevaluemax: 0, description: ""
    },
    weapon: {
      weapontype: "short", damage: "1d6", damage2hands: "1d6", rollformula: "",
      damageformula: "", cost: 0, equipped: false, quantity: 1, slotused: 1,
      slotlocation: "weapon1", isidentified: "unknown", magiccharge: "notapplicable",
      chargevalue: 0, chargevaluemax: 0, description: ""
    },
    armor: {
      armortype: "light", equipped: false, damagereduction: 1, cost: 0,
      quantity: 1, slotused: 1, slotlocation: "armor", isidentified: "unknown",
      magiccharge: "notapplicable", chargevalue: 0, chargevaluemax: 0, description: ""
    },
    shield: {
      shieldtype: "light", parrybonus: 1, equipped: false, cost: 0,
      quantity: 1, slotused: 1, slotlocation: "shield", isidentified: "unknown",
      magiccharge: "notapplicable", chargevalue: 0, chargevaluemax: 0, description: ""
    },
    skill: {
      raceskill: false, classskill: false, unlimited: false, acquiredatlevel: 0,
      currentuse: 0, maxuse: 0, description: ""
    },
    power: {
      level: "", magicschool: "", description: ""
    },
    language: {
      shortdescription: "", description: ""
    },
    condition: {
      conditiontype: "", duration: "", begin: "", specialduration: "",
      durationvalue: 0, durationunit: "", shortdescription: "", dcsave: 0,
      incubationtime: "", diseaseduration: "", description: ""
    },
    class: {
      weapons: { short: false, long: false, twohanded: false, shooting: false, polearm: false, throwing: false },
      armors: { light: false, medium: false, heavy: false },
      shields: { light: false, medium: false, tower: false },
      issecondary: false, description: ""
    },
    race: {
      description: "", hpprogresion: "hp2", languages: "", attributebonus1: "",
      attributebonus4: "", attributebonus8: "",
      weapons: { short: false, long: false, twohanded: false, shooting: false, polearm: false, throwing: false },
      armors: { light: false, medium: false, heavy: false },
      shields: { light: false, medium: false, tower: false }
    },
    money: {
      quantity: 0, slotlocation: "backpack", description: ""
    },
    potion: {
      cost: 0, quantity: 1, slotused: 1, slotlocation: "backpack",
      isidentified: "unknown", alchemycost: "", preparetime: "",
      durationround: 0, description: ""
    },
    poison: {
      cost: 0, quantity: 1, slotused: 1, slotlocation: "backpack",
      isidentified: "unknown", application: "", preparecost: "", preparetime: "",
      damageroll: "", durationround: 0, savesdc: 0, savetype: "", description: ""
    },
    trap: {
      cost: 0, quantity: 1, slotused: 1, slotlocation: "backpack",
      isidentified: "unknown", dcfind: 0, dcdisable: 0, throwtohit: 0,
      damageroll: "", description: ""
    },
    classitem: {
      cost: 0, quantity: 1, slotused: 1, slotlocation: "backpack",
      isidentified: "unknown", class: "", mandatoryfor: "", description: ""
    },
    competency: {
      description: ""
    }
  };

  /**
   * Check if an item needs migration
   * @param {Object} itemData The item data to check
   * @returns {boolean} True if migration is needed
   */
  static needsMigration(itemData) {
    const schema = this.itemSchemas[itemData.type];
    if (!schema) return false;

    // Check if all required fields exist with proper types
    return this.hasInvalidFields(itemData.system || {}, schema);
  }

  /**
   * Check if data has invalid fields compared to schema
   * @param {Object} data The data to check
   * @param {Object} schema The expected schema
   * @returns {boolean} True if invalid fields found
   */
  static hasInvalidFields(data, schema) {
    for (const [key, expectedValue] of Object.entries(schema)) {
      if (typeof expectedValue === 'object' && expectedValue !== null && !Array.isArray(expectedValue)) {
        // Nested object, check recursively
        if (!data[key] || typeof data[key] !== 'object') {
          return true;
        }
        if (this.hasInvalidFields(data[key], expectedValue)) {
          return true;
        }
      } else {
        // Simple field, check type compatibility
        if (data[key] === undefined) {
          return true;
        }
        const expectedType = typeof expectedValue;
        const actualType = typeof data[key];
        if (expectedType === 'number' && actualType === 'string' && !isNaN(data[key])) {
          // String numbers are acceptable for number fields
          continue;
        }
        if (expectedType !== actualType) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Migrate item data from old format to new DataModel format
   * @param {Object} itemData The item data to migrate
   * @returns {Object} The migrated item data
   */
  static migrateItemData(itemData) {
    const schema = this.itemSchemas[itemData.type];
    if (!schema) {
      console.warn(`No migration schema found for item type: ${itemData.type}`);
      return itemData;
    }

    console.log(`Migrating ${itemData.type} item: ${itemData.name}`);

    // Create a deep copy to avoid mutating the original
    const migratedData = foundry.utils.deepClone(itemData);

    // Ensure system exists
    if (!migratedData.system) {
      migratedData.system = {};
    }

    // Apply schema defaults and fix types
    migratedData.system = this.applySchemaDefaults(migratedData.system, schema);

    // Type-specific migrations
    migratedData.system = this.applyTypeSpecificMigrations(migratedData.system, itemData.type);

    console.log(`✓ Migrated ${itemData.type} item: ${itemData.name}`);
    return migratedData;
  }

  /**
   * Apply schema defaults and fix field types
   * @param {Object} data The data to fix
   * @param {Object} schema The schema to apply
   * @returns {Object} The fixed data
   */
  static applySchemaDefaults(data, schema) {
    const result = foundry.utils.deepClone(data);

    for (const [key, defaultValue] of Object.entries(schema)) {
      if (typeof defaultValue === 'object' && defaultValue !== null && !Array.isArray(defaultValue)) {
        // Nested object
        if (!result[key] || typeof result[key] !== 'object') {
          result[key] = {};
        }
        result[key] = this.applySchemaDefaults(result[key], defaultValue);
      } else {
        // Simple field
        if (result[key] === undefined) {
          result[key] = defaultValue;
        } else {
          // Fix type if necessary
          result[key] = this.coerceType(result[key], typeof defaultValue);
        }
      }
    }

    return result;
  }

  /**
   * Coerce a value to the expected type
   * @param {*} value The value to coerce
   * @param {string} expectedType The expected type
   * @returns {*} The coerced value
   */
  static coerceType(value, expectedType) {
    if (typeof value === expectedType) return value;

    switch (expectedType) {
      case 'number':
        const num = Number(value);
        return isNaN(num) ? 0 : num;
      case 'boolean':
        return Boolean(value);
      case 'string':
        return String(value || '');
      default:
        return value;
    }
  }

  /**
   * Apply type-specific migrations
   * @param {Object} data The system data
   * @param {string} type The item type
   * @returns {Object} The migrated data
   */
  static applyTypeSpecificMigrations(data, type) {
    const result = foundry.utils.deepClone(data);

    switch (type) {
      case 'equipment':
      case 'weapon':
      case 'armor':
      case 'shield':
        // Ensure proper slot locations
        if (result.slotlocation && !this.isValidSlotLocation(result.slotlocation, type)) {
          result.slotlocation = this.getDefaultSlotLocation(type);
        }
        break;

      case 'condition':
        // Ensure proper duration units
        if (result.durationunit && !this.isValidDurationUnit(result.durationunit)) {
          result.durationunit = "";
        }
        break;

      case 'poison':
        // Ensure proper save types
        if (result.savetype && !this.isValidSaveType(result.savetype)) {
          result.savetype = "";
        }
        break;

      case 'race':
        // Ensure proper HP progression
        if (result.hpprogresion && !this.isValidHPProgression(result.hpprogresion)) {
          result.hpprogresion = "hp2";
        }
        break;
    }

    return result;
  }

  /**
   * Check if slot location is valid for item type
   */
  static isValidSlotLocation(location, type) {
    const validLocations = {
      equipment: ["backpack", "belt", "body", "hands", "head", "feet", "ring", "neck"],
      weapon: ["weapon1", "weapon2", "backpack"],
      armor: ["armor", "backpack"],
      shield: ["shield", "backpack"]
    };
    return validLocations[type]?.includes(location) || false;
  }

  /**
   * Get default slot location for item type
   */
  static getDefaultSlotLocation(type) {
    const defaults = {
      equipment: "backpack",
      weapon: "weapon1",
      armor: "armor",
      shield: "shield"
    };
    return defaults[type] || "backpack";
  }

  /**
   * Check if duration unit is valid
   */
  static isValidDurationUnit(unit) {
    return ["", "rounds", "minutes", "hours", "days", "permanent"].includes(unit);
  }

  /**
   * Check if save type is valid
   */
  static isValidSaveType(saveType) {
    return ["", "str", "dex", "min", "cha"].includes(saveType);
  }

  /**
   * Check if HP progression is valid
   */
  static isValidHPProgression(progression) {
    return ["hp2", "hp4", "hp6", "hp8"].includes(progression);
  }

  /**
   * Batch migrate all items in the world
   * @returns {Promise<number>} Number of items migrated
   */
  static async migrateAllItems() {
    console.log("Starting batch migration of all items...");

    let migratedCount = 0;
    const updates = [];

    // Migrate items in the world
    for (let item of game.items) {
      if (this.needsMigration(item.toObject())) {
        const migratedData = this.migrateItemData(item.toObject());
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
          const migratedData = this.migrateItemData(item.toObject());
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

    console.log(`✓ Batch migration complete. Migrated ${migratedCount} items.`);
    return migratedCount;
  }

  /**
   * Validate all items in the world
   * @returns {Object} Validation results
   */
  static validateAllItems() {
    console.log("Validating all items...");

    let totalErrors = 0;
    let checkedItems = 0;
    const errorsByType = {};

    // Check world items
    for (let item of game.items) {
      const errors = this.validateItem(item);
      checkedItems++;
      if (errors.length > 0) {
        totalErrors += errors.length;
        if (!errorsByType[item.type]) errorsByType[item.type] = 0;
        errorsByType[item.type] += errors.length;
        console.warn(`❌ ${item.name} (${item.id}):`, errors);
      }
    }

    // Check actor items
    for (let actor of game.actors) {
      for (let item of actor.items) {
        const errors = this.validateItem(item);
        checkedItems++;
        if (errors.length > 0) {
          totalErrors += errors.length;
          if (!errorsByType[item.type]) errorsByType[item.type] = 0;
          errorsByType[item.type] += errors.length;
          console.warn(`❌ ${item.name} (${item.id}) on ${actor.name}:`, errors);
        }
      }
    }

    const results = { checkedItems, totalErrors, errorsByType };

    if (totalErrors === 0) {
      console.log(`✅ All ${checkedItems} items are valid!`);
    } else {
      console.log(`❌ Found ${totalErrors} validation errors in ${checkedItems} items.`);
      console.table(errorsByType);
    }

    return results;
  }

  /**
   * Validate a single item
   * @param {Item} item The item to validate
   * @returns {Array<string>} Array of validation errors
   */
  static validateItem(item) {
    const errors = [];
    const data = item.toObject();
    const schema = this.itemSchemas[data.type];

    if (!schema) {
      errors.push(`Unknown item type: ${data.type}`);
      return errors;
    }

    if (this.needsMigration(data)) {
      errors.push("Item needs migration to new DataModel format");
    }

    return errors;
  }
}

// Make migration utility available globally
window.ItemMigration = ItemMigration;