import { WarheroUtility } from "./warhero-utility.js";

export const defaultItemImg = {
  skill: "systems/fvtt-warhero/images/icons/skills.svg",
  armor: "systems/fvtt-warhero/images/icons/difesa.webp",
  weapon: "systems/fvtt-warhero/images/icons/two-handed-sword.svg",
  equipment: "systems/fvtt-warhero/images/icons/swap-bag.svg",
  shield: "systems/fvtt-warhero/images/icons/difensiva.webp",
  race: "systems/fvtt-warhero/images/icons/razze.webp",
  class: "systems/fvtt-warhero/images/icons/classe.webp",
  money: "systems/fvtt-warhero/images/icons/two-coins.svg",
  power: "systems/fvtt-warhero/images/icons/magia.webp",
  condition: "systems/fvtt-warhero/images/icons/stordenti.webp",
}

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class WarheroItem extends Item {

  constructor(data, context) {
    if (!data.img) {
      data.img = defaultItemImg[data.type];
    }
    super(data, context);
  }

}
