# dsytrf_rook: Translation Learnings

## Translation pitfalls

- The blocked driver is structurally identical to dsytrf (standard
  Bunch-Kaufman) — same loop, same panel-vs-unblocked dispatch, same
  IPIV offset adjustment. Modeling on `lib/lapack/base/dsytrf/lib/base.js`
  was straightforward; the only thing that differs is the choice of
  panel kernel (`dlasyf_rook` vs `dlasyf`) and unblocked kernel
  (`dsytf2_rook` vs `dsytf2`).
- Fortran's lower-case IPIV adjustment uses
  `IPIV(J) = IPIV(J) - K + 1` for negative entries (preserves the
  negative sign while shifting magnitude). In JS, with the
  bitwise-NOT convention, the equivalent is
  `IPIV[j] = ~( ~IPIV[j] + k )`. This is the same expression dsytrf
  uses; it works for rook pivoting because the negative encoding is
  per-row (each entry of a 2x2 block encodes its own swap target,
  not a shared block index).
- Hardcoded `NB = 32` (Fortran uses ILAENV); LWORK workspace queries
  are dropped entirely, so the JS signature drops `WORK`, `strideWORK`,
  `lwork` from both the BLAS-style wrapper and `ndarray.js`. The base
  allocates its own `Float64Array(N * NB)` per panel.

## Dependency interface surprises

- `dlasyf_rook` already returns `{ kb, info }` with the same convention
  as `dlasyf` and stores IPIV using the bitwise-NOT 0-based encoding.
  No translation table needed.
- `dsytf2_rook` returns INFO directly (1-based) and writes IPIV with
  the same encoding as the panel kernel. Drop-in compatible with the
  blocked-driver pattern.

## Coverage gaps

- `base.js` reaches 100% line / 100% branch / 100% function coverage
  with the fixture-based tests plus four 40x40 stress cases (lower
  blocked, upper blocked, lower indefinite forcing 2x2 pivots, upper
  indefinite forcing 2x2 pivots). No exclusions needed.

## Process notes

- `python bin/init_routine.py` overwrites `test/test.js` with the
  fixture-driven scaffold from `gen_test.py`, but the conformance gate
  expects `test/test.js` to be the export-checks file and computation
  tests to live in `test/test.ndarray.js`. After `init_routine.py`,
  rewrite `test/test.js` as the export-checks file and fold the
  fixture cases into `test/test.ndarray.js`.
- The auto-fixer (`bin/lint-fix.sh` / `eslint --fix`) reorders `var`
  declarations by length and can move `var X = expression( ..., X, ...)`
  declarations above their dependencies, producing invalid code.
  After running the fixer, always re-read each test file and verify
  declarations remain in execution order. Best to declare all `var`s
  at the top of each test function (uninitialized) and assign on
  separate lines below — this avoids the reorder-then-break trap.
- The `array-element-newline` rule is NOT in the gate's eslint-disable
  whitelist. Use single-line array literals (with `eslint-disable-line
  max-len` if too long) instead of the formatted multi-line layout.
