#!/usr/bin/env bash

npm install
export NODE_ENV=staging && \
gulp pre-clean && gulp install && \
mocha ./test
