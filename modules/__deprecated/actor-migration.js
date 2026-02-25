/**
 * Warhero Actor Migration Utilities
 * Helper functions for migrating actor data between system versions
 */

export class ActorMigration {

  /**
   * Migrate character data from template.json to DataModel
   * @param {Object} data - The legacy character data
   * @returns {Object} - The migrated character data
   */
  static migrateCharacterData(data) {
    const migrated = {};

    // Handle biodata template
    if (data.biodata) {
      migrated.biodata = { ...data.biodata };
    }

    // Handle core template with statistics and attributes
    if (data.statistics) {
      migrated.statistics = { ...data.statistics };
    }

    if (data.attributes) {
      migrated.attributes = { ...data.attributes };
    }

    if (data.secondary) {
      migrated.secondary = { ...data.secondary };
    }

    // Ensure numeric values are properly typed
    this._ensureNumericValues(migrated);

    // Handle deprecated fields
    this._handleDeprecatedFields(migrated, data);

    return migrated;
  }

  /**
   * Migrate party data from template.json to DataModel
   * @param {Object} data - The legacy party data
   * @returns {Object} - The migrated party data
   */
  static migratePartyData(data) {
    const migrated = {};

    // Handle biodata template (reused for party info)
    if (data.biodata) {
      migrated.biodata = { ...data.biodata };
    }

    // Initialize new party-specific fields if not present
    if (!migrated.members) {
      migrated.members = [];
    }

    if (!migrated.resources) {
      migrated.resources = {
        money: { copper: 0, silver: 0, gold: 0, platinum: 0 },
        supplies: { food: 0, water: 0, ammunition: 0, torches: 0 }
      };
    }

    if (!migrated.settings) {
      migrated.settings = {
        shareResources: true,
        shareExperience: true,
        autoRest: false,
        combatOrder: "initiative"
      };
    }

    return migrated;
  }

  /**
   * Ensure all numeric values are properly typed
   * @param {Object} data - The data to check
   * @private
   */
  static _ensureNumericValues(data) {
    // Statistics
    if (data.statistics) {
      for (let stat of Object.keys(data.statistics)) {
        const value = data.statistics[stat];
        if (typeof value === 'object' && value.value !== undefined) {
          data.statistics[stat].value = Number(value.value) || 0;
          data.statistics[stat].mod = Number(value.mod) || 0;
        }
      }
    }

    // Attributes
    if (data.attributes) {
      for (let attr of Object.keys(data.attributes)) {
        const value = data.attributes[attr];
        if (typeof value === 'object') {
          if (value.value !== undefined) data.attributes[attr].value = Number(value.value) || 0;
          if (value.max !== undefined) data.attributes[attr].max = Number(value.max) || 0;
          if (value.mod !== undefined) data.attributes[attr].mod = Number(value.mod) || 0;
        }
      }
    }

    // Secondary attributes
    if (data.secondary) {
      for (let sec of Object.keys(data.secondary)) {
        const value = data.secondary[sec];
        if (typeof value === 'object' && value.value !== undefined) {
          data.secondary[sec].value = Number(value.value) || 0;
        } else if (typeof value === 'string' && !isNaN(value)) {
          data.secondary[sec] = Number(value);
        }
      }
    }
  }

  /**
   * Handle deprecated or renamed fields
   * @param {Object} migrated - The migrated data object
   * @param {Object} original - The original data object
   * @private
   */
  static _handleDeprecatedFields(migrated, original) {
    // Example: Handle renamed fields
    // if (original.oldFieldName && !migrated.newFieldName) {
    //   migrated.newFieldName = original.oldFieldName;
    // }

    // Remove deprecated fields
    const deprecatedFields = [
      // Add any deprecated field names here
    ];

    for (let field of deprecatedFields) {
      if (migrated[field]) {
        delete migrated[field];
      }
    }
  }

  /**
   * Get migration version for actor data
   * @param {Object} data - The actor data
   * @returns {string} - The migration version
   */
  static getMigrationVersion(data) {
    return data.migrationVersion || "1.0.0";
  }

  /**
   * Set migration version for actor data
   * @param {Object} data - The actor data
   * @param {string} version - The migration version to set
   */
  static setMigrationVersion(data, version) {
    data.migrationVersion = version;
  }

  /**
   * Check if actor data needs migration
   * @param {Object} data - The actor data
   * @param {string} currentVersion - The current system version
   * @returns {boolean} - True if migration is needed
   */
  static needsMigration(data, currentVersion = "2.0.0") {
    const dataVersion = this.getMigrationVersion(data);
    return this._compareVersions(dataVersion, currentVersion) < 0;
  }

  /**
   * Compare two version strings
   * @param {string} version1 - First version
   * @param {string} version2 - Second version
   * @returns {number} - -1 if version1 < version2, 0 if equal, 1 if version1 > version2
   * @private
   */
  static _compareVersions(version1, version2) {
    const v1parts = version1.split('.').map(Number);
    const v2parts = version2.split('.').map(Number);

    for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
      const v1part = v1parts[i] || 0;
      const v2part = v2parts[i] || 0;

      if (v1part < v2part) return -1;
      if (v1part > v2part) return 1;
    }

    return 0;
  }
}

// Console utilities for testing migrations
if (typeof window !== "undefined") {
  window.ActorMigration = ActorMigration;
}