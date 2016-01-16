#!/usr/bin/env bash

NODE_PATH=./node_modules/.bin

npm install
export NODE_ENV=production && \
$NODE_PATH/gulp pre-clean && NODE_PATH/gulp install && \
pm2 startOrRestart ecosystem.json