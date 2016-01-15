#!/usr/bin/env bash

npm install
gulp pre-clean && gulp install --env=staging && \
node app.js --env=staging &
PID=$!
mocha ./test
pkill -9 $PID