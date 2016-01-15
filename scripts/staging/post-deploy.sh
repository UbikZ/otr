#!/usr/bin/env bash

npm install
gulp pre-clean && gulp install --env=staging && \
mocha ./test --env=staging
