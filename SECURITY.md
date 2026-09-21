# Security policy

Tracecode is an experimental educational interpreter, not a hardened service for executing hostile code.

The interpreter processes an AST without eval and intentionally exposes no network, DOM or filesystem APIs. Time, operation, snapshot and call-depth limits cover common runaway cases. Allocation limits and complete language semantics are not implemented. No independent security audit has been performed.

Only the current main branch is maintained.

If GitHub private vulnerability reporting is enabled, use **Security → Report a vulnerability**. Otherwise ask the maintainer to establish a private channel without disclosing exploit details publicly. Never include credentials or attack another person's deployment.

Execution-boundary changes require targeted tests and maintainer review.
