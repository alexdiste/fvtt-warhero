export const WARHERO_CONFIG = {

  weaponTypes : {
    short: {damage: "1d6", label: "WH.conf.short"},
    long:  {damage: "1d8", label: "WH.conf.long"},
    twohanded:  {damage: "3d6", label: "WH.conf.twohanded"},
    shooting:  {damage: "2d6", label: "WH.conf.shooting"},
    throwing:  {damage: "1d8", label: "WH.conf.throwing"},
  },

  armorTypes : {
    light: {protection: "2", label: "WH.conf.lightarmor"},
    medium:  {protection: "4", label: "WH.conf.mediumarmor"},
    heavy:  {protection: "6", label: "WH.conf.heavyarmor"},
  },

  shieldTypes : {
    light: {parry: "+1", label: "WH.conf.lightshield"},
    medium:  {parry: "+3", label: "WH.conf.mediumshield"},
    tower:  {parry: "+5", label: "WH.conf.towershield"},
  }

}