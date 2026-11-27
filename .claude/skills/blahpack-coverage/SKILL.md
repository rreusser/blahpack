---
name: blahpack-coverage
description: Run test coverage analysis
argument-hint: <routine>
---

Run test coverage analysis for a specific module. **NEVER run coverage
on the full test suite** — it produces thousands of lines.

For a specific module:
```bash
node --test --experimental-test-coverage lib/<pkg>/<routine>/test/test.js lib/<pkg>/<routine>/test/test.<routine>.js lib/<pkg>/<routine>/test/test.ndarray.js 2>&1 | tail -30
```

If the user asks about the whole codebase, iterate modules individually
and collect summaries — do NOT glob all test files into one command.

Parse the output and present a summary table of base.js coverage.
Flag any module below the CONVENTIONS T4 coverage floor as needing attention.
If the user asks about a specific module, show its uncovered lines
and suggest what test cases would cover them.
