import { Sequelize } from "sequelize";

export class Agent {

    baseUrl: string;

    dbUrl: string;

    connection: Sequelize;

    static connections: Record<string, Agent> = {}

    static for({ baseUrl, dbUrl }: { baseUrl: string, dbUrl: string }) {
        const key = baseUrl + ">>" + dbUrl
        let instance = Agent.connections[key]
        if (!instance) {
            instance = Agent.connections[key] = new Agent(baseUrl, dbUrl)
        }
        return instance
    }

    constructor(baseUrl: string, dbUrl: string) {
        this.baseUrl = baseUrl
        this.dbUrl   = dbUrl
    }

    /**
     * @asserts this.connection
     */
    async connect() {
        if (!this.connection) {
            const connection = new Sequelize(this.dbUrl, {
                logQueryParameters: true,
                logging: false,
                dialectOptions: {
                    ssl: this.dbUrl.indexOf("@localhost") > 0 ? false : {
                        requestCert: false,
                        require: false,
                        rejectUnauthorized: false
                    }
                }
            });
        
            await connection.authenticate();

            this.connection = connection;
        }
    }

    async disconnect() {
        if (this.connection) {
            await this.connection.close();
        }
    }

    async query(sql: string, options: any) {
        if (!this.connection) {
            await this.connect()
        }
        return this.connection?.query(sql, options)
    }
}