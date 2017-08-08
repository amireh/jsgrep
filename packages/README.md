This folder contains the runtime JavaScript sources needed by `jsgrep`.

`acorn*` 3rd-party packages are bundled because some patches are needed to 
make them work outside of node (e.g. in `jsgrep`'s plain v8 context.)