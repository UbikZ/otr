#!/usr/bin/env bash

npm install && \
gulp pre-clean && gulp install --env=production && \
pm2 startOrRestart ecosystem.json --env=production