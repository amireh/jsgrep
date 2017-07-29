#!/usr/bin/env bash

BINARY_OUTPUT="$(pwd)/src/jsgrok-ql.cpp"
JS_DIR="$(pwd)/packages/jsgrok-ql/dist"
JS_SOURCE="jsgrok-ql.js"

function generate_binary_xxd {
  xxd -i $1 > $2
}

(
  cd packages/jsgrok-ql

  npm run build
)

(
  cd "${JS_DIR}"

  generate_binary_xxd "${JS_SOURCE}" $BINARY_OUTPUT
)