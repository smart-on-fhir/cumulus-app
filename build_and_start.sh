#!/usr/bin/env bash
set -euo pipefail
# echo on
#set -x

# if `--env-file` was not passed, load .env and .env.local
if [[ "$*" != *"--env-file"* ]]; then
    set -o allexport
    if [[ -f .env.docker ]]; then
        source .env.docker
    fi
    if [[ -f .env.local ]]; then
        source .env.local
    else
        echo ".env.local was not found. See documentation for details." 
        exit 1
    fi

    set +o allexport
fi

cd docker
docker compose "$@" up 