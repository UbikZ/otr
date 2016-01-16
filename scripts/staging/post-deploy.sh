#!/usr/bin/env bash

NODE_PATH=./node_modules

npm install
export NODE_ENV=staging && \
$NODE_PATH/.bin/gulp pre-clean && $NODE_PATH/.bin/gulp install && \
$NODE_PATH/.bin/istanbul cover $NODE_PATH/mocha/bin/_mocha test