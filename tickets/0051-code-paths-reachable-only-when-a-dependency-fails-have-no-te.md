---
id: 0051
title: Code paths reachable only when a dependency fails have no tests, because no public input triggers them
status: open
area: harness
opened: 2026-11-20
---

## Problem

Some branches run only when a dependency misbehaves in a way no input can produce through the public API: an iteration limit an inner solver never hits in practice, or a failure code a well-behaved callee never returns. These branches are translated but never executed by any test, so a translation error in them is invisible. Line coverage reports them as uncovered, and the break-mutant check (ticket 0045) reports surviving mutants there. Before this ticket, such survivors were exempted as `UNREACHABLE (not equivalent)` in `test/break-mutants.equivalent.json`. That was an exemption list in all but name (CONVENTIONS T5), so the category is removed and the problem is tracked here.

Testing these paths needs a way to substitute a failing dependency, such as a test-only module hook like the in-memory loader `bin/break-mutants-loader.mjs` uses. Proving them reachable or unreachable is the alternative.

## Evidence

- `dlasq2` INFO = 2 path (the final Z repacking after the dqds iteration limit): about 300k fuzzed public inputs (n = 2..27, NaN/Inf/subnormal/extreme/graded) never reached it. `dlasq3` deflates NaN at once, and finite inputs converge well within 100·n iterations. The skip-after-break mutant there survives.
- `dsterf` QR iteration-limit exit (`lib/lapack/base/dsterf/lib/base.js`, break @2 of the QR loop; post-loop S is the label-150 unscale). A NaN in the block leaves it unscaled (anorm is NaN), and an Inf scales every entry to 0 or NaN, so QR is never chosen. Reaching it therefore needs a finite, scaled block whose QR iteration never converges. A search of about 5M random tridiagonals (N = 3..7, magnitudes 1e-300 to 1e308) found none. A finite stalling matrix exists for `dsteqr`/`zsteqr`/`dstqrb` (d = [1e110, 0, -1e70, 1e-120], e = [1e-90, -1e-140, -1e160]: an underflowing rotation leaves every sweep unchanged), but `dsterf`'s different deflation test converges on it. Since the module changed, the `mutants` CI gate fails on this survivor (2026-11-20).
- Likely more of the same shape: iteration-limit branches in other iterative routines, which the translate skill already lists as "accept as uncovered with inline TODO".

## Reproduce

```bash
node bin/break-mutants.mjs dlasq2 2>&1 | grep -E "SURVIVED|stale"
```
