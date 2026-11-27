# dlansb: Translation Learnings

## Translation pitfalls

- The one-norm and inf-norm are identical for symmetric matrices. The Fortran
  source handles both under a single branch (`NORM='I' or '1' or 'O'`). The JS
  translation maps both `'one-norm'` and `'inf-norm'` to the same code path.
- The upper-case one-norm/inf-norm branch for `uplo='upper'` does NOT
  zero-initialize WORK. Instead it sets `WORK(J) = SUM + |AB(K+1,J)|` on
  each column iteration, which implicitly initializes each element exactly
  once before it is read. Easy to misread as a bug if you expect pre-zeroing.
- The Frobenius norm counts off-diagonal elements twice (`SUM = 2*SUM`) before
  adding the diagonal via a separate DLASSQ call. The diagonal is located at
  row K (upper) or row 0 (lower) in band storage, and DLASSQ walks it with
  stride = LDAB (i.e. strideAB2 in ndarray convention).
- When K=0, the off-diagonal loop is skipped entirely and `l` is set to 0
  (lower convention row) regardless of uplo, since for a diagonal matrix both
  storage formats have the diagonal at `AB(1,j)` (Fortran) = row 0 (0-indexed).

## Dependency interface surprises

- dlassq returns `{ scl, sumsq }` rather than modifying in-place. Destructuring
  the return after each call is required.
- Compiling the Fortran test requires `la_constants` and `la_xisnan` in the deps
  file because `dlassq.f90` uses the `LA_XISNAN` Fortran module. The auto-generated
  deps file from `init_routine.py` missed these transitive module dependencies.

## Automation opportunities

- The deps generator (`deps.py` / `init_routine.py`) could detect `.f90` module
  `USE` statements and automatically include the module source files.

## Coverage gaps

- NaN propagation is not explicitly tested. The `value < temp || temp !== temp`
  pattern (NaN check) exists in all norm branches but is only exercised if a NaN
  appears in the band storage.

## Complex number handling

- N/A: dlansb is a real-valued routine.
