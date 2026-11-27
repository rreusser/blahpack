# ztbcon: Translation Learnings

## Translation pitfalls

- Fortran test arrays must match LDAB to the declared array dimension. Using a single `ab(MAXLDAB, MAXN)` array with LDAB < MAXLDAB reads wrong memory offsets in column-major layout. Fixed by declaring separate arrays `ab3(3,N)`, `ab2(2,N)`, `ab1(1,N)` for each LDAB value.

## Dependency interface surprises

- zlatbs takes `normin` as `'no'`/`'yes'` (not `'N'`/`'Y'`), consistent with the stdlib-js long-form string convention.
- zlacn2 uses `KASE` as `Int32Array(1)` and `EST` as `Float64Array(1)` for reverse communication state; `ISAVE` is `Int32Array(3)`.
- The `scale` output from zlatbs is a `Float64Array(1)`, not a scalar return value.

## Automation opportunities

- The Fortran deps file generation (`deps.py`) misses transitive dependencies through zlatbs. Had to manually add `la_constants`, `la_xisnan`, `zladiv`, `dladiv` for compilation.

## Coverage gaps

- The `scale !== 1.0` overflow protection branch (early return when `scale < xnorm * smlnum`) is not exercised by the current test cases. Would require a near-singular or ill-conditioned band matrix to trigger.

## Complex number handling

- CABS1 (|re| + |im|) is a simple inline helper, same pattern as ztrcon.
- izamax returns a 0-based index into complex elements; the cabs1 call converts via `(ow + (ix * sw)) * 2` to index into the Float64 view.
