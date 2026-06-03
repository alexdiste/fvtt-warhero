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
          hint: "WH.ui.partytypeHint"
        }),
        founded: new fields.NumberField({
          initial: new Date().getFullYear(),
          required: false,
          integer: true,
          label: "WH.ui.founded",
        }),
        members: new fields.StringField({
          initial: "[]",
          required: false,
          blank: true,
          label: "WH.ui.members",
          hint: "WH.ui.membersHint"
        }),
        relationships: new fields.StringField({
          initial: "[]",
          required: false,
          blank: true,
          label: "WH.ui.relations",
          hint: "WH.ui.relationsHint"
        }),
        description: new fields.HTMLField({
          initial: "",
          required: false,
          blank: true,
          label: "WH.ui.description"
        }),
        notes: new fields.HTMLField({
          initial: "",
          required: false,
          blank: true,
          label: "WH.ui.notes",
        }),
        gmnotes: new fields.HTMLField({
          initial: "",
          required: false,
          blank: true,
          label: "WH.ui.gmnotes",
          hint: "WH.ui.gmnotesHint"
        }),
        memberAttributes: new fields.StringField({
          initial: "Fisico=statistics.str.value, Istinto=statistics.dex.value, Mente=statistics.min.value, TS Fis=statistics.str.save, TS Ist=statistics.dex.save, TS Men=statistics.min.save, Conoscenze=attributes.knowledge.value, Parata=secondary.parrybonustotal.value, RD=secondary.drbonustotal.value, Iniziativa=attributes.ini.value",
          required: false,
          blank: true,
          label: "WH.ui.memberAttributes",
          hint: "WH.ui.memberAttributesHint"
        })
      })
    };
  }
}