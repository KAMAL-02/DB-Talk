#!/bin/sh
set -e

echo "Checking if database is ready..."
node dist/scripts/db-ready.script.js

echo "Running database migrations..."
node dist/scripts/db-migrate.script.js

echo "Starting backend..."
exec node dist/index.js