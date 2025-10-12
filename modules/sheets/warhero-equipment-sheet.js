import { WarheroUtility } from "../warhero-utility.js";
import { WarheroBaseItemSheet } from "./warhero-base-item-sheet.js";

/**
 * Warhero Item Sheet Application v2
 * Extends the basic ApplicationV2 with item-specific functionality
 * @extends {foundry.applications.sheets.ItemSheetV2}
 */

export class WarheroEquipmentSheetV2 extends WarheroBaseItemSheet {

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["fvtt-warhero", "sheet", "item"],
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
      template: `systems/fvtt-warhero/templates/items/partial-item-equipment-details.hbs`,
    },
  };

  /** @override */
  tabGroups = {
    sheet: "description",
  }
}