# zlarfgp: Translation Learnings

## Translation pitfalls

- `zlarfgp` uses `BETA = SIGN(DLAPY3(...), ALPHR)` (no leading minus), whereas `zlarfg` uses `BETA = -SIGN(DLAPY3(...), ALPHR)`. This is the sign convention change that makes the final unscaled `beta` non-negative after the post-processing steps. Mixing these up silently produces a valid but differently-signed reflector.
- The x-is-small branch splits on `alphi === 0`: real-alpha gets the same flip-sign logic as `dlarfgp` (tau=0 or tau=2); complex-alpha takes a non-trivial `tau = 1 - alpha/|alpha|` path and zeros out `x` in place. `zlarfg` collapses both into a single trivial path since it allows complex `beta`.
- In the general branch's `beta >= 0` sub-case, the Fortran reuses `ALPHR` as a scratch variable for `|alpha+beta|^2 / Re(alpha+beta)`, then sets `ALPHA = (-ALPHR, ALPHI)` before the `1/alpha` division. Translating literally keeps the algebra readable; avoid "simplifying" the cancellation-avoidance trick, which is load-bearing for numerical stability.
- Fortran's `SIGN(A, 0)` returns `+|A|`, but JavaScript's `Math.sign(0)` returns `0`. Using `Math.sign(alphr) || 1.0` is mandatory — this is the same trap documented for `zlarfg`.

## Dependency interface surprises

- `zladiv` is implemented via `cmplx.divAt( dst, off, a, offA, b, offB )` on a scratch Float64Array — no standalone `zladiv` module is required at the call site.
- `zscal` takes a `Complex128` scalar (not a `Complex128Array`); the wrapper here copies the scaled 1/alpha into a module-level `Complex128Array(1)` scratch and passes `.get(0)`.

## Complex number handling

- `abs1` (i.e. `|Re|+|Im|`) is used by the BLAS Level-2/3 error analyses but **not** here — `zlarfgp` uses the true complex modulus for the `xnorm <= eps*|alpha|` test (via `cmplx.absAt`), matching the Fortran `ABS(ALPHA)` intrinsic.
- The denormal-TAU flush branch (Fortran lines ~200-230) is effectively unreachable in IEEE 754 double precision: entering the general branch requires `xnorm > eps*|alpha|`, so `|tau| >= xnorm^2/|alpha|^2 >= eps^2 ~ 1.2e-32`, which is ~260 orders of magnitude above `smlnum ~ 4.5e-292`. The branch is translated verbatim for faithfulness but accounts for the ~13% uncovered lines. An inline NOTE comment documents this at the branch.
- The Fortran test uses `EQUIVALENCE(alpha, alpha_real)` etc. to print complex interleaved pairs, matching the `Complex128Array` layout exactly — no transformation needed in `gen_test.py`.

## Coverage gaps

- `base.js` line coverage is ~87% and branch coverage ~87%, below the nominal 90%/85% targets. The uncovered ~13% is entirely inside the unreachable denormal-TAU flush branch described above. No input exists that can reach it in IEEE 754 double precision, so the gap is accepted and documented inline.

## Process notes

- The scaffolded `base.js` was already a complete implementation (not a stub), but the scaffolded `zlarfgp.js` / `ndarray.js` / `main.js` wrappers and `benchmark/*.js` had the **wrong arity** (did not account for `offsetAlpha` / `offsetTau`). This is a general risk with z-prefix wrappers when the generator assumes a single scalar in/out — verify wrapper arity against `base.js` before running tests.
- `gen_test.py` writes to `test/test.ndarray.js` by default but an earlier scaffolding step had written the test scaffold into `test/test.js`, clobbering the export-check template. Re-run `init_routine.py` or manually restore `test/test.js` to the three-assertion export-check template.
- The `codemod-tests.js` step in `bin/lint-fix.sh` injects an extra blank line after `'use strict';`, which then trips the stdlib `section-header-empty-lines` rule. The fix (for now) is to run `bin/lint.sh` (read-only) after `bin/lint-fix.sh` and manually undo the inserted blank line. A proper fix is to make the codemod skip the insertion when the preceding line is `'use strict';`.
