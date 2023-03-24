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
  
  partySlotNames : {
    storage: {nbslots: 2000, itemtype:"equipment", label: "WH.conf.partystorage"}
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
    armor:  {nbslots: 1, itemtype:"armor",label: "WH.conf.armor"},
    shield:  {nbslots: 1, itemtype:"shield",label: "WH.conf.shield"},
    belt:  {nbslots: 6, itemtype:"equipment", container: true, available: true, parent: undefined, label: "WH.conf.belt"},
    quiver:  {nbslots: 20, itemtype:"equipment",container: true, available: true, parent: undefined, label: "WH.conf.quiver"},
    backpack:  {nbslots: 12, itemtype:"equipment",container: true, available: true, parent: undefined, label: "WH.conf.backpack"},
    beltpouch1:  {nbslots: 4, itemtype:"equipment",container: true, available: true, parent: undefined, label: "WH.conf.beltpouch1"},
    beltpouch2:  {nbslots: 4, itemtype:"equipment", container: true, available: true, parent: undefined, label: "WH.conf.beltpouch2"},
    beltpouch3:  {nbslots: 4, itemtype:"equipment", container: true, available: true, parent: undefined, label: "WH.conf.beltpouch3"},
    scrollcase:  {nbslots: 17, itemtype:"equipment", container: true, available: false, parent: undefined, label: "WH.conf.scrollcase"},
    wandcase:  {nbslots: 10, itemtype:"equipment", container: true, available: false, parent: undefined, label: "WH.conf.wandcase"},
    potioncase:  {nbslots: 8, itemtype:"equipment", container: true, available: false, parent: undefined, label: "WH.conf.potioncase"},
    bagholding:  {nbslots: 30, itemtype:"equipment", container: true, available: false, parent: undefined, label: "WH.conf.bagholding"},
    quiverholding:  {nbslots: 9999, itemtype:"equipment", container: true, available: false, parent: undefined, label: "WH.conf.quiverholding"},
    backpackholding:  {nbslots: 90, itemtype:"equipment", container: true, available: false, parent: undefined, label: "WH.conf.backpackholding"},
    smallchest:  {nbslots: 6, itemtype:"equipment", container: true, available: false, parent: undefined, label: "WH.conf.smallchest"},
    mediumchest:  {nbslots: 12, itemtype:"equipment", container: true, available: false, parent: undefined, label: "WH.conf.mediumchest"},
    largechest:  {nbslots: 24, itemtype:"equipment", container: true, available: false, parent: undefined, label: "WH.conf.largechest"},
    hugechest:  {nbslots: 24, itemtype:"equipment", container: true, available: false, parent: undefined, label: "WH.conf.hugechest"},
  },

  progressionList: {
    "high": "High (+6HP/Lvl)",
    "medium": "Medium (+4HP/Lvl)",
    "low": "Low (+2 HP/Lvl)"
  },

  poisonApplication: {
    touch: "WH.ui.Touch", 
    ingestion: "WH.ui.Ingestion", 
    weapon: "WH.ui.Weapon"
  },

  saveType: {
    halfdmg: "WH.ui.halfdamage", 
    ignore: "WH.ui.ignoreeffect" 
  },

  conditionType : {
    generic: "WH.ui.generic",
    bless: "WH.ui.bless",
    spell: "WH.ui.spell",
    disease: "WH.ui.disease",
    poison: "WH.ui.poison",
    curse: "WH.u,i.curse"
  },

  conditionDuration: {
    permanent: "WH.ui.permanent",
    temporary: "WH.ui.temporary"
  },

  conditionSpecialDuration : {
    infinite: "WH.ui.infinite", 
    withineor: "WH.uiwithineor",
    beginr: "WH.ui.beginr", 
    nextr: "WH.ui.nextr", 
    nextcombat: "WH.ui.nextcombat",
    untilendcombat: "WH.ui.untilendcombat",
    beginturn: "WH.ui.beginturn",
    endturn: "WH.ui.endturn"
  },
  magicCharge: {
    notapplicable: "WH.ui.notapplicable",
    chargedaily: "WH.ui.chargedaily",
    chargelimited: "WH.ui.chargelimited",
  },
  identifiedState: {
    unknown: "WH.conf.unknown",
    yes:"WH.conf.yes",
    no:"WH.conf.no",
    notapplicable:"WH.conf.notapplicable"
  }

}