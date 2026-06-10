import { WarheroBaseItemSheet } from "./warhero-base-item-sheet.js";

/**
 * Warhero Money Sheet Application v2
 * Extends the basic ApplicationV2 with money-specific functionality
 * @extends {WarheroBaseItemSheet}
 */

export class WarheroMoneySheetV2 extends WarheroBaseItemSheet {

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["fvtt-warhero", "sheet", "item", "money"],
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
      template: `systems/fvtt-warhero/templates/items/partial-item-money-details.hbs`,
    },
  };

  /** @override */
  tabGroups = {
    sheet: "description",
  }
}