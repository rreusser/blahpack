# dlag2s: Translation Learnings

## Translation pitfalls

- `bin/signature.py` emitted two array parameters both named `A` (the input and
  output matrices collide when the Fortran names are `A` and `SA`). The
  scaffolded `base.js`, `ndarray.js`, `dlag2s.js`, and `README.md` all had to
  be rewritten by hand to rename the second matrix to `SA` / `strideSA1` /
  `strideSA2` / `offsetSA` / `LDSA`. This is a tooling bug, not a per-routine
  quirk — the same issue affects every routine with two (or more) matrix
  parameters (e.g., `dlacpy`, `dlat2s`). Worth teaching the signature generator
  to disambiguate by giving each matrix a distinct name.
- Fortran's `REAL(x)` cast rounds a double to IEEE 754 binary32. In JS this is
  `Math.fround(x)`. The output still lives in a `Float64Array` in this project
  (stdlib does have a `Float32Array` module, but storing single-precision
  values in a `Float64Array` preserves strict equality with Fortran fixture
  data via `Math.fround`). `3.14159265358979` becomes `3.141592741012573`
  under `fround` — the fixture confirms this is the exact Fortran output.
- `SLAMCH('O')` is the single-precision overflow threshold. Use
  `@stdlib/constants/float32/max` (≈ `3.4028234663852886e+38`) and check
  `x < -RMAX || x > RMAX` in one pass rather than introducing a helper.
- The Fortran `GO TO 30 … CONTINUE` is a simple "break out of nested loops".
  In JS this is just `return 1` at the overflow check, with `return 0` after
  the double loop.
- Quick-return semantics: with `M === 0` or `N === 0`, the double loop body
  never executes and the routine falls through to `info = 0`. No explicit
  quick-return branch is needed — the `for` loop bounds handle it naturally.

## Dependency interface surprises

- `slamch` appears in `bin/deps.py` output but is not a JS module in this
  project. Treat it as a constant source (hoist `RMAX` from
  `@stdlib/constants/float32/max`) rather than a dependency.

## Coverage gaps

- None. The branch count is tiny (one overflow check) and all branches are
  reachable with trivially constructed fixtures. Coverage is 100% line / 100%
  branch for `base.js`, `ndarray.js`, and `dlag2s.js`.

## Process notes

- The scaffolded `benchmark.js` and `benchmark.ndarray.js` both contained
  duplicated `var A = uniform(...)` declarations (another consequence of the
  signature-generator bug above) and needed to be rewritten to allocate a
  separate `SA` output buffer. The `N * N` allocation at `10^3` (default
  benchmark max) is only ~8 MB, so this routine did not hit the known
  benchmark OOM trap, but the duplicate-`var` shape would still fail ESLint.
- The scaffolded `examples/index.js` used `require( '@stdlib/lapack/base/dlag2s' )`
  which fails the `stdlib/require-file-extensions` rule. Match the `dlat2s`
  pattern: `require( './../lib' )`.
