#!/usr/bin/env bash

NODE_BIN="$(pwd)/node_modules/.bin"
COMMAND="${NODE_BIN}/nearleyc grammar/jsgrok-ql.ne -o src/grammar.js"

exec $NODE_BIN/nodemon -e ne --watch grammar --exec $COMMAND