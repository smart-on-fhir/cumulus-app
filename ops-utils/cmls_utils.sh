alias cmls_rm-db='docker rm  cumulus-dashboard-db && docker rmi docker-db'
alias cmls_rm-db-data='docker volume ls | grep "cumulus" | awk '{print $2}' | xargs docker volume rm'
alias cmls_rm-all='docker ps -a | grep "cumulus" | awk '{print $1}' | xargs docker rm'

cmls_setenv() {
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
}