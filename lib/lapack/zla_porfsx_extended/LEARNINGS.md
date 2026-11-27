# zla_porfsx_extended: Translation Learnings

## Translation pitfalls

- **`signature.py` drops `NRHS`.** The generator consumes `NRHS` as the
  leading dim of `ERR_BNDS_NORM`/`ERR_BNDS_COMP` and omits it from the
  JavaScript parameter list, but `NRHS` is also the outer loop bound
  (`DO J = 1, NRHS`). It must be added back manually as an
  explicit `nrhs` parameter right after `N`. The scaffolded
  `*la_*rfsx_extended` stubs all inherit this bug — the wrappers
  (`ndarray.js`, `<routine>.js`) also needed the parameter threaded.
- **Duplicate parameter names.** The scaffold produces `Y, strideY2, offsetY`
  for the 2-D solution matrix *and* `y, strideY, offsetY` for the
  `DY` workspace, which is a syntax error under strict mode. Renamed
  the `DY` workspace to the `DY, strideDY, offsetDY` triple to match
  the Fortran name and eliminate the collision.
- **XBLAS not available.** The Fortran reference conditionally calls
  `BLAS_ZHEMV_X` / `BLAS_ZHEMV2_X` (extra-precision XBLAS routines)
  based on `y_prec_state`. These are not in `data/lapack-3.12.0/SRC/`
  and this port does not implement them. The JS algorithm falls back
  to the base-precision residual (`zhemv`) in all branches; `prec_type`
  is accepted for API parity but effectively ignored. For the Fortran
  test harness, I added thin `BLAS_ZHEMV_X`/`BLAS_ZHEMV2_X` stubs in
  `data/lapack-3.12.0/SRC/` that forward to `ZHEMV`, so the reference
  binary still links and produces fixture data consistent with the
  JS port.
- **ERR_BNDS_* indexing is 0-based `LA_LINRX_ERR_I = 1`.** Fortran's
  `LA_LINRX_ERR_I = 2` becomes `LA_LINRX_ERR_I = 1` in JavaScript.
  The routine only writes the *second* field of each error-bounds row.
- **Scaffolded benchmark is a trap.** The template allocates `N*N`
  Float64 arrays for every parameter — passing the signature 12 times
  OOMs at `N=10^6` (see the "Benchmark OOM trap" memory). Rewrote
  both benchmarks to construct a real HPD system, factor it once
  with `zpotrf`, and time the refinement step in isolation.

## Dependency interface surprises

- **`zla_lin_berr`** expects `(N, nz, nrhs, res, strideRES, offsetRES, ayb, strideAYB, offsetAYB, berr, strideBERR, offsetBERR)`.
  For the Fortran call `ZLA_LIN_BERR(N, N, 1, RES, AYB, BERR_OUT(J))`
  the `nz` guard is `N` (not `N+1` as in `zporfs`).
- **`zla_heamv`** takes `Complex128Array` for `A` and the real vector
  `y` as `Float64Array` (the running `|A|*|x|` accumulator), even
  though the Fortran signature looks uniformly complex. Getting the
  array types wrong silently produces `NaN` because the Float64 view
  and Complex128 view stride by different factors of 2.
- **`zpotrs` with `nrhs=1`** still requires both `strideB1` and
  `strideB2`; the second stride is unused but must be a valid number.
  I pass `(strideDY, strideDY * N)` for clarity.

## Complex number handling

- `DY` needs its own `Float64Array` view via `reinterpret(DY, 0)`.
  An earlier pass accidentally aliased it to `Yv` (the `Y` view) and
  silently returned wrong `DY_k` magnitudes while tests still passed
  on the well-conditioned matrices.
- All complex scalars (`±1`) are hoisted to module scope as
  `Complex128` constants (`CONE`, `MCONE`); no per-iteration
  allocations.
- The `CABS1` helper (`|Re| + |Im|`) is the sum-of-absolute-values
  used for backward error, **not** the Euclidean modulus. Inlined as
  `Math.abs(v[idx]) + Math.abs(v[idx+1])` via a local `cabs1` helper
  on a Float64 view.

## Coverage gaps

- Several branches are unreachable without pathological inputs:
  - `info !== 0` after `zpotrs` (impossible with HPD inputs and an
    already-factored `AF`).
  - `NOPROG_STATE → WORKING_STATE` transitions for `x_state`/`z_state`
    (require divergence history).
  - `dxrat > rthresh` and `dzrat > rthresh` branches (require non-
    monotone refinement progress, i.e. ill-conditioned inputs).
  - `y_prec_state = EXTRA_Y` branches (require `incr_prec` to fire
    twice in sequence and the `zla_wwaddw` doubled-single update to
    activate — the XBLAS-less port converges before reaching this
    state on all tested matrices).
- Final branch coverage on `base.js` is ~85% with the targeted
  `ithresh=1` and near-converged-`Y` tests. The remaining gap is
  intrinsic to the XBLAS-less implementation.
