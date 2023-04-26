FROM postgres:14

COPY  01_cumulus_schema.sql  /docker-entrypoint-initdb.d/
COPY  02_cumulus_seed_data.sql  /docker-entrypoint-initdb.d/

