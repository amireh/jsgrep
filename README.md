# jsgrep

## Installation

Currently, no binaries are available for use and `jsgrep` must be built from
source.

## Building from source

Prerequisites:

- CMake (2.8+)
- V8 source
- Node.js (v7+)
- `xxd`

### Building V8

Refer to https://github.com/v8/v8/wiki/Building-with-GN#build-instructions-raw-workflow

Run `gn args out.gn/x64.release` and paste the following config:

```shell
is_debug = false
enable_nacl = false
enable_nacl_nonsfi = false
exclude_unwind_tables = true
icu_use_data_file = false
is_component_build = false
is_official_build = true
msan_track_origins = 0
symbol_level = 0
use_udev = false
v8_enable_i18n_support = false
v8_use_external_startup_data = false
v8_static_library = true
```

To see the list of available options, run:

    gn args out.gn/x64.release --list

To compile, run ninja:

    ninja -C out.gn/x64.release v8

### Building `jsgrep-ql`

The JavaScript runtime package is needed by the `jsgrep` binary (the C++ part)
in order to evaluate queries. The following snippet will pre-compile the
JavaScript into a single .js file which is then converted to a binary object
and will be embedded into the `jsgrep` binary by CMake.

```shell
(cd packages/jsgrep-ql; npm install && npm run build)
```

### Building `jsgrep`

The environment variable `V8_DIR` must be set to the *source* directory of
V8 which you built.

You'll need to run cmake to generate the makefile then run make.

```shell
mkdir build
(cd build; cmake .. && make -j5)
```

If you want to customize the build parameters, run `ccmake ..` instead of
`cmake..`.

## Tests

### `jsgrep` C++ tests

`jsgrep` tests can be run with the binary found at `build/jsgrep-tests`.
You must turn on `JSGREP_BUILD_TESTS` in cmake in order to generate the target.

### `jsgrep-ql` JavaScript tests

`jsgrep-ql` tests can be run with `npm`:

    (cd packages/jsgrep-ql && npm test)

During development, you can run the tests interactively in watch mode by
supplying `-w` and it's likely you'll want to use the `dot` reporter:

    (cd packages/jsgrep-ql && npm test -- -w --reporter dot)

## Hacking

You'll need a bunch of terminal sessions for this:

1. `jsgrep-ql` grammar build watcher:

The following will watch any changes you make to `jsgrep-ql/grammar/jsgrep-
ql.ne` and run `nearleyc` to generate the compiled grammar.

```shell
(cd packages/jsgrep-ql && npm run build-grammar:watch)
```

The output will be found at `jsgrep-ql/src/grammar.js` and it is required in
order to build the JS bundle.

2. `jsgrep-ql` bundle build watcher:

The following command will watch any changes to the evaluation source files
`jsgrep-ql/src/**/*.js` and re-compile the bundle that will be used by the C++
backend.

```shell
(cd packages/jsgrep-ql && npm run build-bundle:watch)
```

The output will be found under `jsgrep-ql/dist/jsgrep-ql.js`.

3. `jsgrep` build:

Now that you have the JS bundle ready (grammar embedded), you can compile the
C++ backend:

```shell
(cd build && cmake .. && make -j10)
```

The output will be found at `build/jsgrep`.

4. [OPTIONAL] `jsgrep` tests

If you want to run the C++ tests too, tell cmake to generate that target:

```shell
(cd build && cmake -DJSGREP_BUILD_TESTS=true .. && make -j10)
```

The binary will be found at `build/jsgrep-tests`.

5. [OPTIONAL] `jsgrep-ql` tests:

If you want to run the JavaScript engine tests, the following snippet will re-
run the tests anytime the source files change:

```shell
(cd packages/jsgrep-ql; npm run test:watch)
```

## License

The MIT license. Copyright 2017 Ahmad Amireh <ahmad@amireh.net>. See COPYING.

Libraries linked to by `jsgrep` and their respective licenses:

- [args](https://github.com/Taywee/args) - MIT