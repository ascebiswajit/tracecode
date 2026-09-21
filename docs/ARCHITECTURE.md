# Architecture

The UI sends `{language, source}` to a module worker. The worker selects an adapter from the registry. The adapter parses and interprets the source, returning `{events, error}`. The UI moves a cursor through snapshots to implement reversible playback.

## Snapshot schema

```js
{
  line: 1,             // one-based source line
  label: "Initialize x",
  scopes: [{x: 1}],     // innermost first
  stack: ["global"],   // oldest frame first
  output: []           // cumulative console strings
}
```

Objects use `{ref, type, data}`; aliases retain the same ref ID. Cycles can use `{ref}` back-edges. Snapshots display at most 100 object keys. Function and undefined representations are display strings, so this is not a lossless JavaScript serialization format.

## Add a runtime

Register `{id, name, capabilities, trace}` with `registerPlugin` in engine.mjs. Add the language to the selector list if necessary. UI availability is derived from the registry, and worker dispatch must load the adapter too.

Each adapter needs real execution, source-line mapping, output/errors, stable reference identities, cancellation and resource limits. Add fixtures for loops, scope, mutation, recursion, invalid source and limits. Update support documentation only after validation.

The current interface is synchronous inside a worker. Async adapters require an awaited worker contract and event ordering rules. Framework adapters require instrumentation for state/render/lifecycle events; these are not currently implemented.

Native runtimes must run in independently isolated environments with memory, CPU, output, filesystem and network limits. Never run submitted native programs inside the web server process.
