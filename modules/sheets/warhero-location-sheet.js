import { WarheroUtility } from "../warhero-utility.js";
import { WarheroBaseItemSheet } from "./warhero-base-item-sheet.js";

/**
 * Warhero Location Sheet Application v2
 * Extends the basic ApplicationV2 with location-specific functionality
 * @extends {WarheroBaseItemSheet}
 */

export class WarheroLocationSheetV2 extends WarheroBaseItemSheet {

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["fvtt-warhero", "sheet", "item", "location"],
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
      template: `systems/fvtt-warhero/templates/items/partial-item-location-details.hbs`,
    },
  };

  /** @override */
  tabGroups = {
    sheet: "description",
  }
}