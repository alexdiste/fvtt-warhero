import { WarheroUtility } from "./warhero-utility.js";

export const defaultItemImg = {
  equipment: "systems/fvtt-warhero/images/icons/swap-bag.svg",
  race: "systems/fvtt-warhero/images/icons/dwarf-face.svg",
  weapon: "systems/fvtt-warhero/images/icons/crossed-swords.svg",
  armor: "systems/fvtt-warhero/images/icons/abdominal-armor.svg",
  shield: "systems/fvtt-warhero/images/icons/shield.svg",
  skill: "systems/fvtt-warhero/images/icons/deadly-strike.svg",  
  power: "systems/fvtt-warhero/images/icons/burning-meteor.svg",
  language: "systems/fvtt-warhero/images/icons/spiked-halo.svg",
  condition: "systems/fvtt-warhero/images/icons/aura.svg",  
  class: "systems/fvtt-warhero/images/icons/elf-helmet.svg",
  money: "systems/fvtt-warhero/images/icons/two-coins.svg",
  potion: "systems/fvtt-warhero/images/icons/potion-ball.svg",
  poison: "systems/fvtt-warhero/images/icons/vial.svg",
  trap: "systems/fvtt-warhero/images/icons/swap-bag.svg",
  classitem: "systems/fvtt-warhero/images/icons/swap-bag.svg",
  competency: "systems/fvtt-warhero/images/icons/battle-gear.svg"  
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