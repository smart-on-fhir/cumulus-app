const Docker        = require("dockerode")
const { runSimple } = require("run-container")
const config        = require("./config")
const { Sequelize } = require("sequelize")
const { wait }      = require("./lib")



async function getDockerContainer(name = config.docker.containerName)
{
    var container;

    try {
        container = await createContainer(name)
    }
    catch(error) {

        // Error: (HTTP code 409) unexpected - Conflict. The container name
        // "/cumulus" is already in use by container "...". You have to remove
        // (or rename) that container to be able to reuse that name. 
        // Happens after unexpected exit!
        if (error.statusCode === 409) {
            const docker = new Docker({ socketPath: '/var/run/docker.sock' })
            container = docker.getContainer(name)
            await container.restart()
        }
        else {
            throw error;
        }
    }
    
    await waitForReady()
    return () => container.stop()
}

async function waitForReady() {
    while (true) {
        try {
            // @ts-ignore
            const connection = new Sequelize(config.db.options);
            await connection.authenticate();
            await connection.close();
            break
        } catch {
            await wait(50)
        }
    }
}

async function createContainer(name) {
    const bindMounts = config.docker.dataDir ? {
        [config.docker.dataDir]: "/var/lib/postgresql/data"
    } : undefined;

    return runSimple({
        name,
        image: "postgres",
        autoRemove: true,
        ports: { "5432": "5432" },
        bindMounts,
        env: {
            POSTGRES_PASSWORD: config.db.options.password,
            POSTGRES_USER    : config.db.options.username,
            POSTGRES_DB      : config.db.options.database
        }
    });
}

module.exports = {
    getDockerContainer
};
