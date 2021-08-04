#!/usr/bin/env bash

npm run db:create
npm run db:seed
node scripts/patchStations.js
