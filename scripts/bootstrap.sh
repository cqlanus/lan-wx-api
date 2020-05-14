#!/usr/bin/env bash

npm install
npm run db:create
npm run db:seed
node scripts/patchStations.js
npm run dev
