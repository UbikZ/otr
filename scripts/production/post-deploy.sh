#!/usr/bin/env bash

NODE_PATH=./node_modules/.bin

npm install
export NODE_ENV=production && npm build && pm2 startOrRestart ecosystem.json