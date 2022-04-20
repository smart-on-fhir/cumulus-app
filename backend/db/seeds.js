/**
 * @param {import("sequelize").Sequelize} connection
 */
module.exports = async (connection) => {

    const { models } = connection

    // Users ------------------------------------------------------------------
    await models.User.bulkCreate([
        // {
        //     role    : "user",
        //     username: "user1",
        //     password: "$2a$10$iqEw.w1rPqXwn9mEin9rg.hYLbbxdDKCrQrOnIMJHd7RL4ledplWi"
        // },
        // {
        //     role    : "user",
        //     username: "user2",
        //     password: "$2a$10$iqEw.w1rPqXwn9mEin9rg.XTLbZKCT7AjwGXQKqmP7xRe3wciFfOG"
        // },
        // {
        //     role    : "admin",
        //     username: "admin1",
        //     password: "$2a$10$iqEw.w1rPqXwn9mEin9rg.KNO.6C1rOHAxpvnk2JD66.labiZnyy6"
        // },
        // {
        //     role    : "admin",
        //     username: "admin2",
        //     password: "$2a$10$iqEw.w1rPqXwn9mEin9rg.XCcMZCyFKXGKkAqsUAn.7ux7ZVYRSB2"
        // },
        {
            role    : "admin",
            username: "Vlad",
            password: "$2a$10$CC5JlRcl5q2Nj7cd2TCoEekvO/GPOM.bzI2CvMAnKniPfHe1qI8RS"
        },
        {
            role    : "admin",
            username: "Bin",
            password: "$2a$10$PlcG6tgeJw5ltCQcneQhjuqKH8EdS0FVOU6bDSE9Idf4ZQXLMdu1G"
        },
        {
            role    : "admin",
            username: "Andy",
            password: "$2a$10$d75V9g4d0UzXbIT.WdKlOe96t7spk2EbzvuTSR8mJRGpiqbWESI2i"
        },
        {
            role    : "admin",
            username: "Jamie",
            password: "$2a$10$63M9WPcdGflCawGrzDNEOu3.Y9a34YX3PZ6abM7R/HCwZsg7qkcSG"
        },
        {
            role    : "admin",
            username: "Dan",
            password: "$2a$10$/jfy/tem2ZBSl4VOjCH6T.aHfqYvK6kE40JpP5zzgsDopy5uIBgJq"
        },
        {
            role    : "admin",
            username: "Ken",
            password: "$2a$10$0Hsj6JAI7jOy8uJKNWHXS.N3V.GHcNErBAh7T03VbpbFuv.N1N0Ju"
        },
        {
            role    : "user",
            username: "CumulusGuest",
            password: "$2a$10$7j/Pt6FK7LCWxY6dZr1HcO/dVBndSM8ucXH5wmVIxJqpKMmcZUaya"
        },
        {
            role    : "admin",
            username: "CumulusAdmin",
            password: "$2a$10$eDA0il4ysEoHzup6ikQ07eRahnd7BEICy4gTzS1ctX/hcnslgaXYq"
        }
    ]);

    // Data Sites -------------------------------------------------------------
    await models.DataSite.bulkCreate([
        {
            id: 1,
            name: "Boston Children's Hospital",
            description: "Short description of the Boston Children's Hospital data site"
        },
        {
            id: 2,
            name: "Beth Israel Deaconess Medical Center",
            description: "MIMIC (Medical Information Mart for Intensive Care)"
        },
        {
            id: 3,
            name: "RUSH",
            description: "Short description of the RUSH data site"
        }
    ]);
    await fixAutoIncrement(connection, models.DataSite.tableName, "id");
};

/**
 * @param {import("sequelize").Sequelize} connection
 * @param {string} tableName
 * @param {string} incrementColumnName
 */
async function fixAutoIncrement(connection, tableName, incrementColumnName) {
    await connection.query(
        `select setval(
            '"${tableName}_${incrementColumnName}_seq"',
            (select max("${incrementColumnName}") from "${tableName}"),
            true
        )`
    );
}

