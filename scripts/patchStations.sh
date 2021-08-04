#!/usr/bin/env bash

export POSTGRES_USER="clanus"
export POSTGRES_DB="mlid"
export POSTGRES_PASSWORD="password"
export POSTGRES_HOST="lan-wx-db.chimlwu7ixbj.us-east-2.rds.amazonaws.com"
node scripts/patchStations.js

