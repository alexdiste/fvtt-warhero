import { CrucibleUtility } from "./crucible-utility.js";

export const defaultItemImg = {
  skill: "systems/fvtt-crucible-rpg/images/icons/icon_skill.webp",
  armor: "systems/fvtt-crucible-rpg/images/icons/icon_armour.webp",
  weapon: "systems/fvtt-crucible-rpg/images/icons/icon_weapon.webp",
  equipment: "systems/fvtt-crucible-rpg/images/icons/icon_equipment.webp",
  race: "systems/fvtt-crucible-rpg/images/icons/icon_race.webp",
  money: "systems/fvtt-crucible-rpg/images/icons/icon_money.webp",
}

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class CrucibleItem extends Item {

  constructor(data, context) {
    if (!data.img) {
      data.img = defaultItemImg[data.type];
    }
    super(data, context);
  }

}
