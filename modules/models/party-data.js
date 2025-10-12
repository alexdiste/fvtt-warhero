/**
 * Warhero Party Data Model
 * Defines the data schema for party actors using Foundry DataModel API
 */

const fields = foundry.data.fields;

/**
 * Data model class for party actors
 * @extends foundry.abstract.TypeDataModel
 */
export class PartyData extends foundry.abstract.TypeDataModel {

  /**
   * Define the data schema for party actors
   * @returns {Object} The data schema definition
   */
  static defineSchema() {
    return {
      // Biographical data (inherited from template)
      biodata: new fields.SchemaField({
        class: new fields.StringField({
          initial: "",
          required: false,
          blank: true,
          label: "WH.ui.partytype",
          hint: "WH.ui.partytype.hint"
        }),
        age: new fields.NumberField({
          initial: 0,
          required: false,
          min: 0,
          integer: true,
          label: "WH.ui.founded",
          hint: "WH.ui.founded.hint"
        }),
        size: new fields.StringField({
          initial: "medium",
          required: false,
          blank: false,
          choices: {
            "small": "WH.ui.small",
            "medium": "WH.ui.medium",
            "large": "WH.ui.large",
            "huge": "WH.ui.huge"
          },
          label: "WH.ui.partysize",
          hint: "WH.ui.partysize.hint"
        }),
        weight: new fields.StringField({
          initial: "",
          required: false,
          blank: true,
          label: "WH.ui.totalweight",
          hint: "WH.ui.totalweight.hint"
        }),
        height: new fields.StringField({
          initial: "",
          required: false,
          blank: true,
          label: "WH.ui.territory",
          hint: "WH.ui.territory.hint"
        }),
        hair: new fields.StringField({
          initial: "",
          required: false,
          blank: true,
          label: "WH.ui.colors",
          hint: "WH.ui.colors.hint"
        }),
        sex: new fields.StringField({
          initial: "",
          required: false,
          blank: true,
          label: "WH.ui.alignment",
          hint: "WH.ui.alignment.hint"
        }),
        eyes: new fields.StringField({
          initial: "",
          required: false,
          blank: true,
          label: "WH.ui.reputation",
          hint: "WH.ui.reputation.hint"
        }),
        background: new fields.StringField({
          initial: "",
          required: false,
          blank: true,
          label: "WH.ui.background",
          hint: "WH.ui.background.hint"
        }),
        religion: new fields.StringField({
          initial: "",
          required: false,
          blank: true,
          label: "WH.ui.patron",
          hint: "WH.ui.patron.hint"
        }),
        description: new fields.HTMLField({
          initial: "",
          required: false,
          blank: true,
          label: "WH.ui.description",
          hint: "WH.ui.description.hint"
        }),
        notes: new fields.HTMLField({
          initial: "",
          required: false,
          blank: true,
          label: "WH.ui.notes",
          hint: "WH.ui.notes.hint"
        }),
        gmnotes: new fields.HTMLField({
          initial: "",
          required: false,
          blank: true,
          label: "WH.ui.gmnotes",
          hint: "WH.ui.gmnotes.hint"
        })
      }, {
        label: "WH.ui.partyinfo",
        hint: "WH.ui.partyinfo.hint"
      }),

      // Party members
      members: new fields.ArrayField(
        new fields.SchemaField({
          id: new fields.StringField({ required: false }),
          name: new fields.StringField({ required: false }),
          role: new fields.StringField({
            required: false,
            choices: {
              "leader": "WH.ui.leader",
              "member": "WH.ui.member",
              "companion": "WH.ui.companion",
              "hireling": "WH.ui.hireling"
            }
          }),
          active: new fields.BooleanField({ initial: true, required: false })
        }),
        {
          initial: [],
          required: false,
          label: "WH.ui.members",
          hint: "WH.ui.members.hint"
        }
      ),

      // Party resources
      resources: new fields.SchemaField({
        money: new fields.SchemaField({
          copper: new fields.NumberField({ initial: 0, required: false, min: 0, integer: true }),
          silver: new fields.NumberField({ initial: 0, required: false, min: 0, integer: true }),
          gold: new fields.NumberField({ initial: 0, required: false, min: 0, integer: true }),
          platinum: new fields.NumberField({ initial: 0, required: false, min: 0, integer: true })
        }, {
          label: "WH.ui.partymoney",
          hint: "WH.ui.partymoney.hint"
        }),
        supplies: new fields.SchemaField({
          food: new fields.NumberField({ initial: 0, required: false, min: 0, integer: true }),
          water: new fields.NumberField({ initial: 0, required: false, min: 0, integer: true }),
          ammunition: new fields.NumberField({ initial: 0, required: false, min: 0, integer: true }),
          torches: new fields.NumberField({ initial: 0, required: false, min: 0, integer: true })
        }, {
          label: "WH.ui.supplies",
          hint: "WH.ui.supplies.hint"
        })
      }, {
        label: "WH.ui.resources",
        hint: "WH.ui.resources.hint"
      }),

      // Party settings
      settings: new fields.SchemaField({
        shareResources: new fields.BooleanField({
          initial: true,
          required: false,
          label: "WH.ui.shareresources",
          hint: "WH.ui.shareresources.hint"
        }),
        shareExperience: new fields.BooleanField({
          initial: true,
          required: false,
          label: "WH.ui.shareexperience",
          hint: "WH.ui.shareexperience.hint"
        }),
        autoRest: new fields.BooleanField({
          initial: false,
          required: false,
          label: "WH.ui.autorest",
          hint: "WH.ui.autorest.hint"
        }),
        combatOrder: new fields.StringField({
          initial: "initiative",
          required: false,
          choices: {
            "initiative": "WH.ui.initiative",
            "dexterity": "WH.ui.dexterity",
            "custom": "WH.ui.custom"
          },
          label: "WH.ui.combatorder",
          hint: "WH.ui.combatorder.hint"
        })
      }, {
        label: "WH.ui.partysettings",
        hint: "WH.ui.partysettings.hint"
      })
    };
  }

}