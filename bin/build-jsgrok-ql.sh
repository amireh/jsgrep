#!/usr/bin/env bash

BINARY_OUTPUT="$(pwd)/src/jsgrok-ql.cpp"
JS_DIR="$(pwd)/packages/jsgrok-ql/dist"
JS_SOURCE="jsgrok-ql.js"

# references:
# - https://stackoverflow.com/questions/13660850/is-it-possible-to-store-binary-files-inside-an-exe
# - https://stackoverflow.com/questions/4864866/c-c-with-gcc-statically-add-resource-files-to-executable-library
# - https://stackoverflow.com/questions/5316152/store-data-in-executable
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