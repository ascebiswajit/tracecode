# Contributing

Thanks for helping people understand code. Documentation, reproducible bug reports, DSA examples, accessibility improvements and runtime fixes are welcome.

## Fork → branch → pull request

1. Fork [tracecode](https://github.com/ascebiswajit/tracecode).
2. Clone your fork and create a focused branch:
   ```sh
   git clone https://github.com/YOUR_USERNAME/tracecode.git
   cd tracecode
   git switch -c fix/short-description
   npm install
   npm start
   ```
3. Make a small, focused change. Add a regression test for interpreter behavior changes.
4. Run `npm run check && npm run build && npm test`.
5. Check desktop/mobile layout and keyboard controls for UI changes.
6. Commit and push to **your fork**, then open a pull request against upstream `main`.
7. Explain the problem, change and validation. Respond to review feedback.

Maintainers decide merges. Direct upstream write access is not required. Contributions are provided under the project's MIT license; retain attribution for third-party code.

## Good first contributions

- Add a supported DSA example with expected results.
- Document unsupported syntax with minimal reproductions.
- Improve keyboard focus, control labels and small-screen layouts.
- Test nested scopes, cycles and shared reference snapshots.

Discuss major refactors and language adapters in an issue first. Never present simulated output as actual execution. Keep the support matrix accurate.

## Implementation conventions

Use ES modules. Keep execution, UI and examples separate. Escape all rendered user content. Avoid eval and Function constructors. Preserve worker timeouts and operation limits. Do not include secrets, proprietary code, account identifiers or hosting manifests in contributions.

## Maintainer checklist

Repository settings are managed separately from code:

- Require pull requests and successful `test` CI for main.
- Require code-owner review if appropriate.
- Block force pushes and branch deletion.
- Enable private vulnerability reporting.
- Prefer squash merges and remove merged topic branches.
- Triage issues and label suitable first contributions.

CODEOWNERS suggests reviewers; it does not enforce review by itself. These settings are recommendations until configured in GitHub.
