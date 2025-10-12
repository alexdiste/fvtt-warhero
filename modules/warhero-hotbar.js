export class WarheroHotbar {

  static async addToHotbar(item, slot) {
    let command = `game.system.fvtt-warhero.WarheroHotbar.rollMacro("${item.name}", "${item.type}");`;
    let macro = game.macros.contents.find(m => (m.name === item.name) && (m.command === command));
    if (!macro) {
      macro = await Macro.create({
        name: item.name,
        type: "script",
        img: item.img,
        command: command
      }, { displaySheet: false })
    }
    await game.user.assignHotbarMacro(macro, slot);
  }

  /**
   * Create a macro when dropping an entity on the hotbar
   * Item      - open roll dialog for item
   * Actor     - open actor sheet
   * Journal   - open journal sheet
   */
  static initDropbar() {

    Hooks.on("hotbarDrop", (bar, documentData, slot) =>  {

      // Create item macro if rollable item - weapon, spell, prayer, trait, or skill
      if (documentData.type == "Item") {
        let item = fromUuidSync(documentData.uuid)
        if (item == undefined) {
          item = this.actor.items.get(documentData.uuid)
        }
        if (item && (item.type =="weapon" || item.type =="skill")) {
          this.addToHotbar(item, slot)
          return false
        }
      }

      return true;
    });
  }

  /** Roll macro */
  static rollMacro(itemName, itemType, bypassData) {
    const speaker = ChatMessage.getSpeaker()
    let actor
    if (speaker.token) actor = game.actors.tokens[speaker.token]
    if (!actor) actor = game.actors.get(speaker.actor)
    if (!actor) {
      return ui.notifications.warn(`Select your actor to run the macro`)
    }

    let item = actor.items.find(it => it.name === itemName && it.type == itemType)
    if (!item) {
      return ui.notifications.warn(`Unable to find the item of the macro in the current actor`)
    }

    // Trigger the item roll
    if (item.type === "weapon") {
      return actor.rollWeapon(item.id)
    }
    if (item.type === "skill") {
      return actor.rollSkill(item.id)
    }
  }
}