import { WarheroUtility } from "./warhero-utility.js";

export const defaultItemImg = {
  equipment: "systems/fvtt-warhero/images/icons/swap-bag.svg",
  race: "systems/fvtt-warhero/images/icons/razze.webp",
  weapon: "systems/fvtt-warhero/images/icons/two-handed-sword.svg",
  armor: "systems/fvtt-warhero/images/icons/difesa.webp",
  shield: "systems/fvtt-warhero/images/icons/difensiva.webp",
  skill: "systems/fvtt-warhero/images/icons/talenti.webp",  
  power: "systems/fvtt-warhero/images/icons/magia.webp",
  language: "systems/fvtt-warhero/images/icons/linguaggi.webp",
  condition: "systems/fvtt-warhero/images/icons/stordenti.webp",  
  class: "systems/fvtt-warhero/images/icons/classe.webp",
  money: "systems/fvtt-warhero/images/icons/two-coins.svg",
  potion: "systems/fvtt-warhero/images/icons/swap-bag.svg",
  poison: "systems/fvtt-warhero/images/icons/swap-bag.svg",
  trap: "systems/fvtt-warhero/images/icons/swap-bag.svg",
  classitem: "systems/fvtt-warhero/images/icons/swap-bag.svg",
  competency: "systems/fvtt-warhero/images/icons/swap-bag.svg"  
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
