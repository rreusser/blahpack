# dsytrf_rk: Translation Learnings

## Translation pitfalls

- **Drop the WORK/LWORK parameters.** The scaffolded signature included
  `WORK, strideWORK, offsetWORK, lwork` because `signature.py` faithfully
  echoes the Fortran declaration. Per project convention, JS routines
  allocate workspace internally; we removed all four parameters from
  base.js, ndarray.js, the BLAS-style wrapper, the README, and the
  TypeScript type tests. The arity check in `test.dsytrf_rk.js` had
  to drop from `13` to `9` accordingly.
- **Lower-case IPIV adjustment must respect the bitwise-NOT 2x2 encoding.**
  In the lower-case loop, after the panel kernel returns, IPIV entries
  are panel-local. For 1x1 pivots we add `k - 1`. For 2x2 pivots
  (negative entries `~p_local`), the global value is `~(p_local + (k-1))`,
  not `~p_local + (k-1)` (which would be `~(p_local - (k-1))` after the
  identity `~x + c = ~(x - c)`). dsytrf has the same correction; we
  copied the pattern verbatim.
- **Post-panel row swaps in the upper case must not be skipped.** The
  existing `dsytrf` implementation at `lib/lapack/base/dsytrf/` happens
  to omit the upper-case post-panel `dswap` loop entirely (it relies on
  callers like dsytrs to do the deferred swaps). For `_rk` we MUST do
  the swap pass-through because callers (e.g., `dsytrs_3`) consume the
  E array and global IPIV directly and expect A to be already permuted.
  Always reproduce the full Fortran loop for both branches; do not
  carbon-copy `dsytrf` blindly.
- **Length and offset of post-panel dswap.** Upper case swaps over
  `N - K` columns starting at column `K + 1` (1-based). With our
  0-based loop variable `K_loop = K`, the offset is
  `offsetA + ipidx*sa1 + K*sa2` and length `N - K`. The lower case
  swaps over `K - 1` columns starting at column 1 — offset
  `offsetA + ipidx*sa1`, length `K - 1` (where `K` here is the 1-based
  Fortran loop index that is also the literal value we keep in the
  JS loop variable for clarity).

## Dependency interface surprises

- `dlasyf_rk` returns `{ kb, info }` (object), while `dsytf2_rk` returns
  a plain `info` integer (and writes pivot data into IPIV/E directly).
  Easy to swap by accident — always match the kernel's actual return
  shape.
- `dlasyf_rk` and `dsytf2_rk` both already write IPIV in the stdlib
  bitwise-NOT 2x2 encoding (no Fortran-style negative-1-based entries).
  The post-panel adjustment in dsytrf_rk therefore operates on those
  encoded values directly, never on Fortran-style negatives.
- `dswap` is called via base.js path
  (`../../../../blas/base/dswap/lib/base.js`) rather than the public
  package — same pattern as dsytrf.

## Coverage gaps

- The `N === 0` quick return in `base.js` (lines 81-83) is unreachable
  via tests that go through `ndarray.js`, since the wrapper short-circuits
  N===0 first. Direct base-level invocation isn't part of the test
  surface (per the project rule that tests target `lib/ndarray.js`,
  not `lib/base.js`). The branch is structurally trivial; final base.js
  coverage is 98.97% line / 90.91% branch — both above gate threshold.

## Test design notes

- For blocked-path coverage we use deterministic transcendental fills
  (`sin(i*c1) * cos(j*c2)` with diagonal boost) at N=33 (NB+1, exercises
  one full panel + 1-row unblocked tail) and N=50 (one full panel +
  larger unblocked tail). These avoid tied-norm pivot ambiguities while
  exercising every dispatch branch.
- Tolerances: 1e-13 for small N, 1e-11 for N>=33 (rounding accumulates
  through dgemm-based panel updates).
