# zla_gerfsx_extended: Translation Learnings

## Translation pitfalls

- `signature.py` duplicates parameter names when the Fortran source has both a matrix `Y` and an array `DY`: it maps `DY(*)` to `y, strideY, offsetY`, colliding with the matrix `Y, strideY1, strideY2, offsetY`. The scaffolded `ndarray.js` and `zla_gerfsx_extended.js` wrappers were syntactically invalid (duplicate parameter name). Manually rename the `DY` parameter group to `DY, strideDY, offsetDY` in every wrapper file.
- The Fortran `BLAS_ZGEMV_X` / `BLAS_ZGEMV2_X` symbols are XBLAS extra-precision routines that are NOT shipped with reference LAPACK. Compiling `zla_gerfsx_extended.f` via `run_fortran.sh` fails with undefined references. Workaround: define `BLAS_ZGEMV_X` and `BLAS_ZGEMV2_X` as Fortran stubs at file scope (outside `program`) in the `test_zla_gerfsx_extended.f90` test file; they fall through to standard `ZGEMV`. The JS port mirrors this and also falls through to standard `zgemv` regardless of `prec_type`.
- The Fortran `BASE_RESIDUAL` branch (y_prec_state == 0) is unreachable from this entry point: `y_prec_state` is initialized to `EXTRA_RESIDUAL` and only ever increments. Collapsing the `BASE_RESIDUAL` and `EXTRA_RESIDUAL` branches (which are identical in the JS build without XBLAS) removed a dead branch and boosted branch coverage.
- `chla_transtype` and `ilatrans` DO exist as reference LAPACK `.f` files and must be added to `deps_zla_gerfsx_extended.txt` for Fortran linking, alongside `zla_geamv`, `zla_lin_berr`, `zla_wwaddw`, and standard BLAS deps (`zaxpy`, `zcopy`, `zgemv`, `zgetrf`, `zgetrs`, etc.).

## Dependency interface surprises

- `zla_lin_berr` writes `berr[ offsetBERR ]` when called with `nrhs=1`, so passing `offsetBERR = offsetBERR_OUT + jcol*strideBERR_OUT` stores the result at the correct per-column slot.
- `zla_geamv` uses complex-element strides for `A` (internally does `sa1 = strideA1 * 2`). When passing a column of `Y` (Complex128Array) as the `x` vector, use complex-element `strideY1` directly — do NOT pre-multiply by 2.
- `zla_wwaddw` signature is `(N, x, strideX, offsetX, y, strideY, offsetY, w, strideW, offsetW)` where `(x, y)` is the doubled-single accumulator and `w` is the addend. For in-place refinement: `x = Y`, `y = Y_TAIL`, `w = DY`.

## Complex number handling

- `Y`, `RES`, `DY`, `Y_TAIL` are `Complex128Array` at the API; the routine reinterprets `Y`, `DY`, `Y_TAIL` as `Float64Array` views for the elementwise `CABS1` norm computation (`|re| + |im|`) in the state-machine inner loop.
- Inner-loop CABS1 is inlined as `Math.abs(v[i]) + Math.abs(v[i+1])` on reinterpreted views (not a helper call) to avoid per-element function overhead.
- `B` is reinterpreted once at top-of-function to compute `AYB := |B_s|` without reinterpreting on every iteration (mirrors the stdlib performance pattern).

## Coverage gaps

- The componentwise state-machine (`x_state`/`z_state` × WORKING/UNSTABLE/NOPROG/CONV) has 4×4=16 potential transition paths. Natural convergence only exercises about half of them. The `rcond=0, ithresh=100` test forces `incr_prec` every iteration, driving `y_prec_state` to `EXTRA_Y` and reaching the `zla_wwaddw` update path. The `large rthresh` test forces a near-zero `dz_ub` which drives `z_state` into the `UNSTABLE → reset` branch. A few state transitions (`x_state NOPROG → WORKING` second chance, and the `final_dx_x` loop-exhausted assignment when still in WORKING state) remain uncovered because reference matrices converge in one iteration — accepted as unreachable without pathological inputs.

## Missing automation

- The scaffolded `<routine>.js` (BLAS-style layout wrapper) and matching `test.<routine>.js` for routines with 30+ parameters are essentially unusable without a full rewrite. The scaffolder drops `nrhs` and produces a collision of `Y` / `y`. Future work: teach `bin/scaffold.py` to detect when the Fortran signature has both a matrix and a vector that collapse to the same lowercase name, and force unique param names. Also teach it to retain `nrhs` as a top-level parameter.
- `bin/init_routine.py` auto-generates `deps_<routine>.txt` from JS dependency tree. It misses Fortran-only symbols (`chla_transtype`, `ilatrans`) and XBLAS-style externals. Future work: scan the `.f` source for `EXTERNAL` declarations and add them (or stub them).
- The scaffolded `benchmark.js` / `benchmark.ndarray.js` allocate `N*N` elements for many 1D buffers (BERR_OUT, C, IPIV, etc.) and loop from `10^1` to `10^3`, which is harmless here but was the `8TB-OOM` trap pattern called out in `project_benchmark_oom_trap`. I hand-rewrote both benchmarks to size each buffer correctly and to use `N = 4, 8` instead of `10, 100, 1000`. Consider making this the scaffold default.
