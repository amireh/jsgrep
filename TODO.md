- [ ] optimize global contexts; nodejs context can be made into a template that
  is instantiated for each module
- [ ] require acorn & friends once and expose them to the global context
- [ ] look into https://github.com/chtefi/acorn-jsx-walk to see what kind of monkeying they're doing to get JSX traversal
- [ ] license: args
- [ ] look into minifying the JS to reduce binary size
- [ ] stream results from JS to reporter
- [ ] embed v8 data blobs (natives_blob.bin, snapshot_blob.bin) into binary
- [x] parse query only once per thread