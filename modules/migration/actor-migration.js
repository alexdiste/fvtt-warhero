/* Copied from __deprecated */

/**
 * Warhero Actor Migration Utilities
 * Helper functions for migrating actor data between system versions
 */

export class ActorMigration {
// ...existing code...
}

// Console utilities for testing migrations
if (typeof window !== "undefined") {
  window.ActorMigration = ActorMigration;
}
