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
          label: "WH.ui.gmnotes"
        })
      })
    };
  }
}