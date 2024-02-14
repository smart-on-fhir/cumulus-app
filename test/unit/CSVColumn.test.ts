import { expect } from "chai"
import CSVColumn from "../../backend/DataManager/CSVColumn"
import { ColumnMetadata } from "../../backend/DataManager/lib"


describe("CSVColumn", () => {
    
    it ("Using unique name", async () => {
        const col = new CSVColumn("colName")
        expect(col.name).to.equal("colName")
        expect(col.dataType).to.equal("string")
        expect(col.label).to.equal("Col Name")
        expect(col.description).to.equal("")
    })

    it ("Using column metadata", async () => {
        const meta: ColumnMetadata = { dataType: "float", label: "Test Column", description: "desc" }
        const col = new CSVColumn("colName", meta)
        expect(col.name).to.equal("colName")
        expect(col.dataType).to.equal(meta.dataType)
        expect(col.label).to.equal(meta.label)
        expect(col.description).to.equal(meta.description)
    })

    it ("Using Boolean column from lib", async () => {
        const col = new CSVColumn("ed_note")
        expect(col.name).to.equal("ed_note")
        expect(col.dataType).to.equal("boolean")
        expect(col.label).to.equal("ED Note")
        expect(col.description).to.equal("ED Note was documented for the encounter (true/false)")
    })

    it ("Using Int column from lib", async () => {
        const col = new CSVColumn("enc_los_days")
        expect(col.name).to.equal("enc_los_days")
        expect(col.dataType).to.equal("integer")
        expect(col.label).to.equal("Encounter Los Days")
        expect(col.description).to.equal("LOS Length Of Stay (days)")
    })

    it ("Using day date column from lib", async () => {
        const col = new CSVColumn("end_date")
        expect(col.name).to.equal("end_date")
        expect(col.dataType).to.equal("date:YYYY-MM-DD")
        expect(col.label).to.equal("End Date")
        expect(col.description).to.equal("Day patient encounter ended")
    })

    it ("Using week date column from lib", async () => {
        const col = new CSVColumn("cond_week")
        expect(col.name).to.equal("cond_week")
        expect(col.dataType).to.equal("date:YYYY-MM-DD")
        expect(col.label).to.equal("Condition Week")
        expect(col.description).to.equal("Week condition recorded")
    })

    it ("Using month date column from lib", async () => {
        const col = new CSVColumn("cond_month")
        expect(col.name).to.equal("cond_month")
        expect(col.dataType).to.equal("date:YYYY-MM")
        expect(col.label).to.equal("Condition Month")
        expect(col.description).to.equal("Month condition recorded")
    })

    it ("Using year date column from lib", async () => {
        const col = new CSVColumn("cond_year")
        expect(col.name).to.equal("cond_year")
        expect(col.dataType).to.equal("date:YYYY")
        expect(col.label).to.equal("Condition Year")
        expect(col.description).to.equal("Year condition recorded")
    })
})