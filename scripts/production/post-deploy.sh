#!/usr/bin/env bash

npm install
export NODE_ENV=production && \
gulp pre-clean && gulp install && \
pm2 startOrRestart ecosystem.json