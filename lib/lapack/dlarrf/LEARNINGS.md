# dlarrf: Translation Learnings

## Translation pitfalls

- `SIGMA` is a scalar OUT parameter in Fortran. In the JS port it is passed as
  a `Float64Array` of length 1 (written to `sigma[0]`), following the
  `nsplit`/`tnrm` pattern from `dlarra`. The function itself then returns
  `INFO` as a plain integer (0 on success, 1 on failure to find a shift).
- `KTRYMAX = 1` in the reference code, so the retry loop runs at most twice
  before falling to either the `smlGrowth < fail` best-shift forcer path or
  the `info = 1` failure return. Tests that need to exercise the forcer or
  the `dorrr1` (RRR1/RRR2) heuristic must use clusters tight enough that
  `clwdth < mingap/128` AND choose a `spdiam` small enough that
  `growthBound = 8*spdiam` is exceeded by the initial LSIGMA/RSIGMA attempts.
- `dlamch` constants (`EPS`, `SAFMIN`) are hoisted to module scope per
  project convention. They are accessed through local variables (`eps`, `s`)
  inside the main loop to mirror the Fortran control flow without the cost
  of re-querying `dlamch` on every call.

## Dependency interface surprises

- `dcopy` here copies workspace → dplus/lplus when the right shift (SRIGHT)
  wins. The second `dcopy` call starts at `offsetWORK + ( N * strideWORK )`
  — i.e. the second half of the `2*N` workspace — so the caller must size
  `work` at `2*N` elements and never reuse `dplus`/`lplus` as workspace
  aliases.
- NaN detection uses `@stdlib/math/base/assert/is-nan` instead of the
  `x !== x` idiom so that the `no-self-compare` eslint rule stays happy
  (it is not on the project's eslint-disable whitelist).
