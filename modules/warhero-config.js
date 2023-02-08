export const WARHERO_CONFIG = {

  weaponTypes : {
    short: {damage: "1d6", label: "WH.conf.short"},
    long:  {damage: "1d8", label: "WH.conf.long"},
    twohanded:  {damage: "3d6", label: "WH.conf.twohanded"},
    polearm:  {damage: "1d6", label: "WH.conf.polearm"},
    shooting:  {damage: "2d6", label: "WH.conf.shooting"},
    throwing:  {damage: "1d8", label: "WH.conf.throwing"},
    special:  {damage: "1d6", label: "WH.conf.special"},
  },

  armorTypes : {
    light: {protection: "2", label: "WH.conf.lightarmor"},
    medium:  {protection: "4", label: "WH.conf.mediumarmor"},
    heavy:  {protection: "6", label: "WH.conf.heavyarmor"},
  },

  shieldTypes : {
    light: {parry: "1", label: "WH.conf.lightshield"},
    medium:  {parry: "3", label: "WH.conf.mediumshield"},
    tower:  {parry: "5", label: "WH.conf.towershield"},
  },

  slotNames : {
    head: {nbslots: 1, itemtype:"armor", label: "WH.conf.head"},
    cloak:  {nbslots: 1, itemtype:"equipment", label: "WH.conf.cloak"},
    weapon1:  {nbslots: 1, itemtype:"weapon", label: "WH.conf.weapon1"},
    weapon2:  {nbslots: 1, itemtype:"weapon", label: "WH.conf.weapon2"},
    gloves:  {nbslots: 1, itemtype:"equipment",label: "WH.conf.gloves"},
    ring:  {nbslots: 10, itemtype:"equipment",label: "WH.conf.ring"},
    dress:  {nbslots: 1, itemtype:"equipment",label: "WH.conf.dress"},
    boots:  {nbslots: 1, itemtype:"equipment",label: "WH.conf.boots"},
    belt:  {nbslots: 6, itemtype:"equipment",label: "WH.conf.belt"},
    quiver:  {nbslots: 20, itemtype:"equipment",label: "WH.conf.quiver"},
    armor:  {nbslots: 1, itemtype:"armor",label: "WH.conf.armor"},
    shield:  {nbslots: 1, itemtype:"shield",label: "WH.conf.shield"},
    backpack:  {nbslots: 12, itemtype:"equipment",label: "WH.conf.backpack"},
    beltpouch1:  {nbslots: 4, itemtype:"equipment",label: "WH.conf.beltpouch1"},
    beltpouch2:  {nbslots: 4, itemtype:"equipment", label: "WH.conf.beltpouch2"},
    beltpouch3:  {nbslots: 4, itemtype:"equipment", label: "WH.conf.beltpouch3"},
  },

  progressionList: {
    "high": "High (+6HP/Lvl)",
    "medium": "Medium (+4HP/Lvl)",
    "low": "Low (+2 HP/Lvl)"
  }

}