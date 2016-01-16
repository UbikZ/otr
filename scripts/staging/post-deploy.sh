#!/usr/bin/env bash

NODE_PATH=./node_modules

npm install
export NODE_ENV=staging && npm run build && npm test