import { QueryInterface } from "sequelize";
import { DataTypes } from "sequelize"
    

export async function up(queryInterface: QueryInterface) {

    const cols = await queryInterface.describeTable("Views");

    if (!('rating' in cols)) {
        await queryInterface.addColumn('Views', 'rating', {
            type        : DataTypes.FLOAT,
            defaultValue: 0,
            allowNull   : false
        });
    }

    if (!('votes' in cols)) {
        await queryInterface.addColumn('Views', 'votes', {
            type        : DataTypes.INTEGER,
            defaultValue: 0,
            allowNull   : false
        });
    }

    if (!('normalizedRating' in cols)) {
        await queryInterface.addColumn('Views', 'normalizedRating', {
            type        : DataTypes.FLOAT,
            defaultValue: 0,
            allowNull   : false
        });
    }
}

export async function down(queryInterface: QueryInterface) {
    const cols = await queryInterface.describeTable("Views");

    if ('rating' in cols) {
        await queryInterface.removeColumn('Views', 'rating');
    }
    
    if ('votes' in cols) {
        await queryInterface.removeColumn('Views', 'votes');
    }
    
    if ('normalizedRating' in cols) {
        await queryInterface.removeColumn('Views', 'normalizedRating');
    }
}
