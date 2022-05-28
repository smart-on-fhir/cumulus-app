const Docker        = require("dockerode")
const { runSimple } = require("run-container")
const config        = require("./config")
const { debuglog }  = require("util")
const debug         = debuglog('app:db')

const POSTGRES_READY_LOG = /database system is ready to accept connections/;


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
    
    await waitForReady(container)
    return () => container.stop()
}

// Resolves when POSTGRES_READY_LOG appears for the second time in the logs
function waitForReady(container) {
    debug('Waiting...')

    return new Promise((resolve, reject) => {
        container.logs({
            follow: true,
            stdout: true,
            stderr: true
        }, function (err, stream) {
            if (err) return reject(err)
            let logCount = 0
            let expectedCount = 2
            stream
                .once('data', function onStart() {
                    debug("Timer set")
                    this.timer = setTimeout(function () {
                        debug("Timeout")
                        stream.push(Buffer.from('!stop!'))
                        reject(new Error('Docker startup timed out'))
                    }, 50000).unref()
                })
                .on('data', function (data) {
                    const text = data.toString('utf8')

                    if (text.includes("PostgreSQL Database directory appears to contain a database; Skipping initialization")) {
                        expectedCount = 1
                    }

                    if (POSTGRES_READY_LOG.test(text)) {

                        if (++logCount === expectedCount) {
                            clearTimeout(this.timer)
                            // this.timer = null;
                            // Stops following logs.
                            // @ see https://github.com/apocas/dockerode/blob/master/examples/logs.js#L29
                            stream.push(Buffer.from('!stop!'))
                            setTimeout(() => resolve(true), 100);
                        }
                    }
                })
                // .on('error', function (e) {
                //     this.timer && clearTimeout(this.timer)
                //     reject(e)
                // })
        })
    })
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
