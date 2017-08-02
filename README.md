# jsgrok

## Building

You will need CMake, the v8 sources, and nodejs (v7+). On Linux, you will also
need `xxd`.

**Building the `jsgrok-ql` JavaScript package**

The JavaScript runtime package is needed by the `jsgrok` binary (the C++ part)
in order to evaluate queries. The following script will pre-compile the
JavaScript into a single .js file which is then converted to a binary object
and will be embedded into the `jsgrok` binary by CMake.

    ./bin/build-jsgrok-ql.sh

**Building `jsgrok`**

    mkdir build
    cd build
    ccmake ..

Configure the build paramaters; turn on tests if needed, then run make:

    make -j5

## Tests

### `jsgrok` C++ tests

`jsgrok` tests can be run with the binary found at `build/jsgrok-tests`.
You must turn on `JSGROK_BUILD_TESTS` in cmake in order to generate the target.

### `jsgrok-ql` JavaScript tests

`jsgrok-ql` tests can be run with `npm`:

    (cd packages/jsgrok-ql && npm test)

During development, you can run the tests interactively in watch mode by
supplying `-w` and it's likely you'll want to use the `dot` reporter:

    (cd packages/jsgrok-ql && npm test -- -w --reporter dot)

The JavaScript tests are separated into two groups: tests for the grammar,
found under `packages/jsgrok-ql/grammar/__tests__` and tests for the evaluation
engine, found under `packages/jsgrok-ql/src/__tests__`.

## Hacking

You'll need a bunch of terminal sessions for this:

1. `jsgrok-ql` bundle build watcher:

    (cd packages/jsgrok-ql && npm run build-bundle:watch)

2. `jsgrok-ql` grammar build watcher:

    (cd packages/jsgrok-ql && npm run build-grammar:watch)

3. `jsgrok` build:

    (cd build && cmake -DJGROK_BUILD_TESTS=true .. && make -j10)

Optionally:

4.1. `jsgrok` tests

    build/jsgrok-tests

4.2. `jsgrok-ql` tests:

    (cd packages/jsgrok-ql; npm run test -- -w --reporter dot)