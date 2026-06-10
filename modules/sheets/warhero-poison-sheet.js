import { WarheroBaseItemSheet } from "./warhero-base-item-sheet.js";

/**
 * Warhero Poison Sheet Application v2
 * Extends the basic ApplicationV2 with poison-specific functionality
 * @extends {WarheroBaseItemSheet}
 */

export class WarheroPoisonSheetV2 extends WarheroBaseItemSheet {

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["fvtt-warhero", "sheet", "item", "poison"],
    position: {
      width: 620
    },
    window: {
      contentClasses: ["fvtt-warhero"],
    },
  };

  /** @override */
  static PARTS = {
    main: {
      template: "systems/fvtt-warhero/templates/items/item-sheet-header.hbs",
    },
    tabs: {
      template: "templates/generic/tab-navigation.hbs",
    },
    description: {
      template: "systems/fvtt-warhero/templates/items/partial-item-description.hbs",
    },
    details: {
      template: `systems/fvtt-warhero/templates/items/partial-item-poison-details.hbs`,
    },
    effects: {
      template: "systems/fvtt-warhero/templates/items/partial-item-generic-effect.hbs",
    },
  };

  /** @override */
  tabGroups = {
    sheet: "description",
  }
}
