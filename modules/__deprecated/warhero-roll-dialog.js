import { WarheroUtility } from "../warhero-utility.js";

export class WarheroRollDialog extends Dialog {

  /* -------------------------------------------- */
  static async create(actor, rollData) {

    let options = { classes: ["WarheroDialog"], width: 420, height: 'fit-content', 'z-index': 99999 };
    let html = await foundry.applications.handlebars.renderTemplate('systems/fvtt-warhero/templates/roll-dialog-generic.html', rollData);

    return new WarheroRollDialog(actor, rollData, html, options);
  }

  /* -------------------------------------------- */
  constructor(actor, rollData, html, options, close = undefined) {
    let conf = {
      title: (rollData.mode == "skill") ? "Skill" : "Attribute",
      content: html,
      buttons: {
        roll: {
          icon: '<i class="fas fa-check"></i>',
          label: "Roll !",
          callback: () => { this.roll() }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancel",
          callback: () => { this.close() }
        }
      },
      close: close
    }

    super(conf, options);

    this.actor = actor;
    this.rollData = rollData;
  }

  /* -------------------------------------------- */
  roll() {
    WarheroUtility.rollWarhero(this.rollData)
  }

  /* -------------------------------------------- */
  async refreshDialog() {
    const content = await foundry.applications.handlebars.renderTemplate("systems/fvtt-warhero/templates/roll-dialog-generic.html", this.rollData)
    this.data.content = content
    this.render(true)
  }

  /* -------------------------------------------- */
  activateListeners(html) {
    super.activateListeners(html);

    var dialog = this;
    function onLoad() {
    }
    $(function () { onLoad(); });

    html.find('#powerLevel').change((event) => {
      this.rollData.powerLevel = event.currentTarget.value
    })
    html.find('#bonusMalus').change((event) => {
      this.rollData.bonusMalus = Number(event.currentTarget.value)
    })
    html.find('#usemWeaponMalus').change((event) => {
      this.rollData.usemWeaponMalus = event.currentTarget.checked
    })
  }
}