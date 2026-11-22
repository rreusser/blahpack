---
id: 0055
title: Known problems recorded as code or test comments escape the every-problem-is-a-ticket check
status: resolved
area: process
opened: 2026-11-20
resolved: 2026-11-22
---

## Problem

CONVENTIONS P1 says every known problem is a ticket, and `ci:tickets` enforces it for CONVENTIONS rows, docs, skills and PR descriptions. It does not look at comments in code or tests. A known defect can therefore be written down as a comment next to a weakened test, which looks like the problem is handled while nothing tracks it.

## Evidence

- `lib/lapack/base/zhbgst/test/test.ndarray.js`: "NOTE: The kb >= 2 path has known translation issues producing larger drift", with the tests weakened to "info = 0 and finite". The underlying error is up to 1e-1 (ticket 0053). Found only by break-mutant triage.
- `grep -rniE "known (translation )?issue|known bug|drift|FIXME|XXX" lib/*/base/*/test/*.js` without a `ticket NNNN` citation: 3 hits (2026-11-20).

## Reproduce

```bash
grep -rniE "known (translation )?issue|known bug|FIXME" lib/*/base/*/test/*.js | grep -viE "ticket [0-9]{4}"
```

## Resolution

Comments in module code are now covered by P1. `tickets.js check` (CI `ci:tickets`) scans every comment block in lib/*/base/*/** (code, tests, examples, benchmarks). A block that admits a known problem (TODO/FIXME/XXX, hack/workaround, "known issue/bug/limitation", "not implemented/supported/correct", "differs from the reference", drift, "is broken/wrong") must cite an open ticket. Implemented as `codeCommentProblems` in bin/tickets-coverage.js, with unit tests in lint/tickets-coverage.test.cjs (gated by test:lint-rules), and recorded in the P1 enforcer column. The first run found 15 untracked admissions: a real bug in 10 public wrappers (ticket 0060), a weakened zgeevx test (ticket 0061), two zhbgst coverage-only tests (now cite ticket 0053), a missing zunhr_col description (written), and dseupd docs that called faithful ARPACK behaviour "not implemented" (rewritten).
