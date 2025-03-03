import Docker        from "dockerode"
import { runSimple } from "run-container"
import { Sequelize } from "sequelize"
import { Config }    from "../types"
import { wait }      from"../lib"
import * as logger   from "../services/logger"

const RETRY_DELAY   = 1000  // 1s
const RETRY_TIMEOUT = 10000 // 10s


export async function getDockerContainer(options: Config)
{
    var container: Docker.Container;

    try {
        container = await createContainer(options)
    }
    catch(error) {

        // Error: (HTTP code 409) unexpected - Conflict. The container name
        // "/cumulus" is already in use by container "...". You have to remove
        // (or rename) that container to be able to reuse that name. 
        // Happens after unexpected exit!
        if ((error as any).statusCode === 409) {
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

async function waitForReady(container: Docker.Container, options: Config) {
    let start = Date.now()
    while (true) {
        try {
            const connection = new Sequelize(options.db.options);
            await connection.authenticate();
            await connection.close();
            break
        } catch {
            if (Date.now() - start > RETRY_TIMEOUT) {
                if (container) {
                    await container.stop().catch(e => {
                        console.log("Failed to stop the container", e.message)
                    })
                }
                throw new Error(`Failed to connect to database in ${RETRY_TIMEOUT.toLocaleString()} ms`)
            }

            logger.verbose(`Failed to connect to database. Retrying in ${RETRY_DELAY.toLocaleString()} ms`)
            await wait(RETRY_DELAY)
        }
    }
}

export async function createContainer(options: Config): Promise<Docker.Container> {

    // docker run -it 
    //   -v /Users/vlad/dev/cumulus-app/backend/db/postgres-data:/var/lib/postgresql/data
    //   -e POSTGRES_PASSWORD=********
    //   -e POSTGRES_USER=postgres
    //   -e POSTGRES_DB=cumulus
    //   -p 5432:5432
    //   postgres:14

    return await runSimple({
        name      : options.docker.containerName,
        image     : "postgres:14",
        autoRemove: true,
        ports: {
            "5432": String(options.db.options.port || "5432")
        },
        env: {
            POSTGRES_PASSWORD: options.db.options.password || "",
            POSTGRES_USER    : options.db.options.username || "",
            POSTGRES_DB      : options.db.options.database || ""
        },
        verbose: true
    });
}
