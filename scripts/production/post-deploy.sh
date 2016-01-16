#!/usr/bin/env bash

NODE_PATH=./node_modules/.bin

npm install
export NODE_ENV=production && npm run build && pm2 startOrRestart ecosystem.json