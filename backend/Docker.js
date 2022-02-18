const Docker       = require("dockerode")
const config       = require("./config")
const { debuglog } = require("util")
const debug        = debuglog('app:db')

const POSTGRES_READY_LOG = /database system is ready to accept connections/;


async function getDockerContainer(name = config.docker.containerName, restart = false)
{
    const docker = new Docker();

    let container;
    try {
        container = await createContainer(docker, name)
        await container.start()
        
    } catch (e) {
        // Docker returns a 409 when the container is already running.
        // This happens if the test suite exits before cleanup.
        if (e.statusCode === 409) {
            container = docker.getContainer(name)
            if (restart) {
                await container.restart()
            }
        } else {
            throw e
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
            stream
                .once('data', function onStart() {
                    debug("Timer set")
                    this.timer = setTimeout(function () {
                        debug("Timeout")
                        stream.push(Buffer.from('!stop!'))
                        reject(new Error('Docker startup timed out'))
                    }, 50000)
                })
                .on('data', function (data) {
                    const text = data.toString('utf8')

                    if (POSTGRES_READY_LOG.test(text)) {
                        logCount++
                        if (logCount == 2) {
                            clearTimeout(this.timer)
                            this.timer = null;
                            // Stops following logs.
                            // @ see https://github.com/apocas/dockerode/blob/master/examples/logs.js#L29
                            stream.push(Buffer.from('!stop!'))
                            resolve(true)
                        }
                    }
                })
                .on('error', function (e) {
                    this.timer && clearTimeout(this.timer)
                    reject(e)
                })
        })
    })
}

function createContainer(docker, name = config.docker.containerName) {
    return docker.createContainer({
        name,
        Image: 'postgres',
        Env: [
            `POSTGRES_PASSWORD='${config.db.options.password}'`,
            `POSTGRES_USERNAME='${config.db.options.username}'`,
            `POSTGRES_DB='${config.db.options.database}'`,
        ],
        HostConfig: {
            AutoRemove: true,
            PortBindings: {
                "5432/tcp": [{ HostPort: `${config.db.options.port}` }],
            }
        }
    });
}

module.exports = {
    getDockerContainer
};
