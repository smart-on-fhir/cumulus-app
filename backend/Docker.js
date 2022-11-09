const Docker        = require("dockerode")
const { runSimple } = require("run-container")
const { Sequelize } = require("sequelize")
const { wait }      = require("./lib")


/**
 * @param {object} options
 * @param {object} options.docker
 * @param {string} options.docker.containerName
 * @param {string} [options.docker.dataDir]
 * @param {object} options.db
 * @param {import("sequelize").Options} options.db.options
 */
async function getDockerContainer(options)
{
    var container;

    try {
        container = await createContainer(options)
    }
    catch(error) {

        // Error: (HTTP code 409) unexpected - Conflict. The container name
        // "/cumulus" is already in use by container "...". You have to remove
        // (or rename) that container to be able to reuse that name. 
        // Happens after unexpected exit!
        if (error.statusCode === 409) {
            const docker = new Docker({ socketPath: '/var/run/docker.sock' })
            container = docker.getContainer(options.docker.containerName)
            await container.restart()
        }
        else {
            throw error;
        }
    }

    await waitForReady(container, options)
    return () => container.stop()
}

/**
 * @param {Docker.Container} container
 * @param {object} options
 * @param {object} options.docker
 * @param {string} options.docker.containerName
 * @param {string} [options.docker.dataDir]
 * @param {object} options.db
 * @param {import("sequelize").Options} options.db.options
 */
async function waitForReady(container, options) {
    let start = Date.now()
    while (true) {
        try {
            // @ts-ignore
            const connection = new Sequelize(options.db.options);
            await connection.authenticate();
            await connection.close();
            break
        } catch {
            if (Date.now() - start > 1000*60*5) {
                container.stop()
                throw new Error("Failed to connect to database in 5 minutes")
            }
            await wait(150)
        }
    }
}

/**
 * @param {object} options
 * @param {object} options.docker
 * @param {string} options.docker.containerName
 * @param {string} [options.docker.dataDir]
 * @param {object} options.db
 * @param {import("sequelize").Options} options.db.options
 */
async function createContainer(options) {
    return runSimple({
        name      : options.docker.containerName,
        image     : "postgres",
        autoRemove: true,
        ports: {
            "5432": String(options.db.options.port || "5432")
        },
        bindMounts: options.docker.dataDir ? {
            [ options.docker.dataDir ]: "/var/lib/postgresql/data"
        } : {},
        env: {
            POSTGRES_PASSWORD: options.db.options.password || "",
            POSTGRES_USER    : options.db.options.username || "",
            POSTGRES_DB      : options.db.options.database || ""
        },
        verbose: true
    });
}

module.exports = {
    getDockerContainer
};
