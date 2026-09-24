# Tracecode

**See how your code thinks.** An open-source code visualization workspace for exploring execution, variables, references, scopes and call stacks.

[Contribute](CONTRIBUTING.md) · [Architecture](docs/ARCHITECTURE.md) · [Roadmap](docs/ROADMAP.md) · [Report a bug](https://github.com/ascebiswajit/tracecode/issues/new/choose)

> **Early teaching prototype:** real execution currently supports a restricted JavaScript subset only. Other languages in the selector are planned runtime adapters. This is not a full JavaScript engine or a hardened hostile-code sandbox.

## Website

The browser app is included in `src/`. The build creates a portable static website in `dist/`.

[Original hosted demo](https://tracecode-studio.biswajitnayak2402.chatgpt.site) — this deployment is owner-private and may require access. GitHub changes do not automatically update that deployment.

A manual GitHub Pages workflow is included. **A public Pages deployment is not yet confirmed.** See [deployment instructions](docs/DEPLOYMENT.md).

## Quick start

Requires **Node.js 22+**, npm, and a modern browser.

```sh
git clone https://github.com/ascebiswajit/tracecode.git
cd tracecode
npm install
npm start
```

Open **http://localhost:3000**. Acorn 8.18.0 is the only runtime dependency; the build copies its parser and MIT license into the static output.

```sh
npm run check
npm run build
npm test
```

## How to use

1. Choose JavaScript and paste code, or choose **Load example**.
2. Click **Run & Visualize** (⌘/Ctrl + Enter).
3. Use Play/Pause, Next, Previous, Reset, Speed and the timeline.
4. Inspect Memory & variables, Execution flow, Call stack, Output and Errors.
5. Open **Trace data** to inspect or download the recorded JSON.

Previous steps replay stored snapshots; they do not re-run code. Editing code requires a fresh run.

## Practice curriculum

Open **Practice** or **Explore exercises** to browse 60 shared exercises: 20 each at Level 1 (Foundations), Level 2 (Intermediate), and Level 3 (Advanced). Every language offers the same questions with language-specific starter syntax, sample inputs, expected results and hints. Search by title or topic. Starters are unfinished practice prompts, not worked solutions. JavaScript is still the only executable runtime, and advanced exercises can require unsupported syntax. Completed JavaScript demos remain under **Worked examples**.

## Included examples

- Array sum: loops, function arguments and array references.
- Recursive factorial: nested frames and return values.
- Shared references: mutations visible through aliases.
- Trapping rain water: a two-pointer DSA solution with ten test cases.

Rainwater expected results: **9, 3, 0, 0, 6, 0, 0, 0, 15, 7**.

Const bindings reject reassignment (including `+=` and `++`). Objects and arrays declared with const can still be mutated.

## Support matrix

| Capability | Status |
| --- | --- |
| JavaScript declarations, arithmetic, conditions, for/while loops | Core subset available |
| Simple functions, recursion, arrays, objects, references, scopes | Available |
| Console output, errors, execution timeline, call stack | Available |
| TypeScript, Python, Java, C, C++, Go, Rust, Kotlin, Swift | Not implemented |
| Async/await, event-loop and API tracing | Not implemented |
| React state, rendering and lifecycle tracing | Not implemented |
| Native memory addresses, allocation and garbage collection | Not measured; conceptual references only |

The interpreter does not implement full ECMAScript semantics: complete hoisting, destructuring, classes, modules, general exception handling and built-in objects are unsupported or incomplete. Unsupported syntax produces an error where detected. Display snapshots are limited to 100 keys per object.

## Structure

| Path | Purpose |
| --- | --- |
| `src/index.html`, `src/style.css`, `src/app.mjs` | Interface and visualizers |
| `src/engine.mjs` | AST interpreter, snapshots and runtime registry |
| `src/worker.mjs` | Worker execution boundary and adapter dispatch |
| `src/examples.mjs` | Runnable examples |
| `scripts/` | Static build and local server |
| `tests/` | Interpreter regression tests |
| `.github/` | CI, templates and code ownership |

## Execution boundaries

Code is interpreted in a dedicated browser worker without eval. The interpreter intentionally exposes no DOM, network or filesystem APIs. Limits include a two-second worker timeout, 20,000 operations, 1,500 snapshots and bounded call depth. These are prototype controls, not a complete security guarantee. Memory/allocation denial-of-service risks remain. See [SECURITY.md](SECURITY.md).

Code is not sent to an execution server. Google Fonts is requested for typography; system fonts are used when it is unavailable. Hosting providers may record ordinary access logs.

## Contributing

The website includes a **Contribute** page at `contribute.html` with local setup, fork/branch instructions, the pull-request workflow and links to project resources.

Everyone can fork the public repository and propose a pull request. Maintainers review and merge contributions; public visibility does not grant direct push access.

See [CONTRIBUTING.md](CONTRIBUTING.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), and [the roadmap](docs/ROADMAP.md). Please discuss new runtimes before implementation.

## License

[MIT](LICENSE), copyright 2026 ascebiswajit. Acorn is MIT-licensed separately; its license is retained in build output.

## Website pages

The homepage (`src/index.html`) explains the mission and invites contributions. Open the execution workspace at `visualizer.html`; the full contributor walkthrough is at `contribute.html`. All pages use relative links for subdirectory hosting.

## Learning path

Open `learn.html` for eight steps from first program to an open-source contribution. Each step includes a task, an AI tutor prompt, and three questions with expandable self-check answers. These are general learning activities, not an integrated AI service or an additional language runtime. Edit `src/learn.html` to improve the curriculum.
