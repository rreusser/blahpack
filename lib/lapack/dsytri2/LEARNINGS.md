# dsytri2: Translation Learnings

## Translation pitfalls

- `dsytri2` is a pure dispatcher in the Fortran reference: it calls `ILAENV` once to pick `NBMAX`, then forwards to `dsytri` (if `NBMAX >= N`) or `dsytri2x` (otherwise). The JS calls the translated `ilaenv` with the reference's arguments in `lib/base.js`, `lib/ndarray.js` (the reference's MINSIZE) and the wrapper (its `null` allocation) (CONVENTIONS X3; ticket 0049).
- `ILAENV( 1, 'DSYTRI2', ... )` returns `NB = 1` (no specific tuning entry in `ilaenv.f`), so the reference reaches `DSYTRI2X` with a degenerate `NB = 1` block size for every `N > 1`. The JS used to hard-code `NBMAX = 32` instead, which took the unblocked `dsytri` for `N <= 32` and agreed with the reference fixtures only to ~2e-15 (the `NB = 1` path agrees to ~5e-16).
- Removed all `LWORK` plumbing including the workspace-query short-circuit (`LWORK == -1`). The JS `ndarray.js` takes `WORK` as a pre-sized array; the layout wrapper allocates internally.
- `XERBLA` argument-error handling is replaced by validator throws in `ndarray.js` / `dsytri2.js`. Base.js does no validation.
- This is a direct real-prefix port of `zsytri2` (just-translated complex sibling). Structure was lifted verbatim, replacing `Complex128Array` with `Float64Array`, dropping `reinterpret`, and adjusting fixture indexing (no `2*` complex re/im factor).

## Dependency interface surprises

- `dsytri` (the unblocked sibling) needs `WORK` of length `N`. `dsytri2x` (the blocked sibling) needs `WORK` of length `(N+nb+1)*(nb+3)`. The same `WORK` slot in the API serves both dispatch branches — caller must size for whichever branch the routine will take. The layout wrapper handles this automatically; ndarray callers must allocate the larger of the two when uncertain.
- Both `dsytri` and `dsytri2x` return `info` as the JS return value (not an out-parameter). Just forward the return value.

## Coverage gaps

- The `info > 0` (singular `D`) path is not exercised by fixture tests because `dsytrf` does not produce a zero `1x1` pivot for well-conditioned test matrices. Same gap as `dsytri`/`dsytri2x`.

## Fortran deps

- `dsytrf` (driven by the Fortran test) brings transitive deps `dlasyf -> dsytf2 -> dsyr` plus `dlamch`, `disnan`, `dlaisnan`, and the ILAENV chain (`ilaenv`, `ieeeck`, `iparmq`). `deps.py` does not pull these — copied from `deps_dsytri2x.txt` and added the additional siblings (`dsytri`, plus all `dsytri2x` deps).
