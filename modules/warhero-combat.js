import { WarheroUtility } from "./warhero-utility.js";

/* -------------------------------------------- */
export class WarheroCombat extends Combat {
  
  /* -------------------------------------------- */
  async rollInitiative(ids, formula = undefined, messageOptions = {} ) {
    ids = typeof ids === "string" ? [ids] : ids;
    for (let cId = 0; cId < ids.length; cId++) {
      const c = this.combatants.get(ids[cId]);
      let id = c._id || c.id;
      let initBonus = c.actor ? await c.actor.getInitiativeScore( this.id, id ) : -1;
      await this.updateEmbeddedDocuments("Combatant", [ { _id: id, initiative: initBonus } ]);
    }

    return this;
  }

  /* -------------------------------------------- */
  _onUpdate(changed, options, userId) {
  }

  /* -------------------------------------------- */
  static async checkTurnPosition() {
    while (game.combat.turn > 0) {
      await game.combat.previousTurn()
    }
  }
}