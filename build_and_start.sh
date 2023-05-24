#!/usr/bin/env bash
set -euo pipefail

# Due to the way in which these environment files are loaded, invoking
# `docker compose` directly will not work. If you don't need a clean
# start, you can use a command like
# `docker compose --env-file ./app/.env --envfile ./app/.env.local up`
# to reload previously build containers

# TODO - revisit this block based on new docker envfile behavior in compose
# https://github.com/docker/compose/issues/7326
# if `--env-file` was not passed, load .env and .env.local
if [[ "$*" != *"--env-file"* ]]; then
    set -o allexport
    if [[ -f ./app/.env.docker ]]; then
        source ./app/.env.docker
    fi
    if [[ -f ./app/.env.local ]]; then
        source ./app/.env.local
    else
        echo ".env.local was not found. See documentation for details." 
        exit 1
    fi

    set +o allexport
fi

docker compose down
# If there's already a DB volume, we'll remove it; otherwise, ignore this failing
# docker volume rm cumulus-app_cumulus-dashboard-db-data || true
docker compose build
docker compose "$@" up
