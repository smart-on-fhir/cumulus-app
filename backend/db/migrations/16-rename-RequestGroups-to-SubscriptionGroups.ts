import { QueryTypes } from "sequelize";
import { MigrationFunction } from "../../types"


export const up: MigrationFunction = async ({ context: queryInterface }) => {
    if (!(await queryInterface.tableExists("SubscriptionGroups"))) {
        await queryInterface.sequelize.query(`ALTER TABLE RequestGroups RENAME TO SubscriptionGroups`, { type: QueryTypes.RAW, raw: true });
    }
}

export const down: MigrationFunction = async ({ context: queryInterface }) => {
    if (!(await queryInterface.tableExists("RequestGroups"))) {
        await queryInterface.sequelize.query(`ALTER TABLE SubscriptionGroups RENAME TO RequestGroups`, { type: QueryTypes.RAW, raw: true });
    }
}