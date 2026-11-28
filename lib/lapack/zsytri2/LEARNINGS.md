# zsytri2: Translation Learnings

## Translation pitfalls

- `zsytri2` is a pure dispatcher in the Fortran reference: it calls `ILAENV` once to pick `NBMAX`, then forwards to `zsytri` (if `NBMAX >= N`) or `zsytri2x` (otherwise). The JS calls the translated `ilaenv` with the reference's arguments in `lib/base.js`, `lib/strided.js` (the reference's MINSIZE) and the wrapper (its `null` allocation) (CONVENTIONS X3; ticket 0049).
- `ILAENV( 1, 'ZSYTRI2', ... )` returns `NB = 1` (no specific tuning entry in `ilaenv.f`), so the reference reaches `ZSYTRI2X` with a degenerate `NB = 1` block size for every `N > 1`. The JS used to hard-code `NBMAX = 32` instead, which took the unblocked `zsytri` for `N <= 32` and agreed with the reference fixtures only to ~2e-15 (the `NB = 1` path agrees to ~5e-16).
- Removed all `LWORK` plumbing including the workspace-query short-circuit (`LWORK == -1`). The JS `strided.js` takes `WORK` as a pre-sized array; the layout wrapper allocates internally.
- `XERBLA` argument-error handling is replaced by validator throws in `strided.js` / `zsytri2.js`. Base.js does no validation.

## Dependency interface surprises

- `zsytri` (the unblocked sibling) needs `WORK` of length `N`. `zsytri2x` (the blocked sibling) needs `WORK` of length `(N+nb+1)*(nb+3)`. The same `WORK` slot in the API serves both dispatch branches — caller must size for whichever branch the routine will take. The layout wrapper handles this automatically; strided callers must allocate the larger of the two when uncertain.
- Both `zsytri` and `zsytri2x` return `info` as the JS return value (not an out-parameter). Just forward the return value.

## Complex number handling

- No complex arithmetic in the dispatcher itself — both `zsytri` and `zsytri2x` accept `Complex128Array` and handle the math internally.

## Coverage gaps

- The `info > 0` (singular `D`) path is not exercised by fixture tests because `zsytrf` does not produce a zero `1x1` pivot for well-conditioned test matrices. Same gap as `zsytri`/`zsytri2x`.

## Fortran deps

- `zsytrf` (driven by the Fortran test) brings transitive deps `zlasyf -> zsytf2 -> zsyr` plus `dlamch`, `disnan`, `dlaisnan`, and the ILAENV chain (`ilaenv`, `ieeeck`, `iparmq`). `deps.py` does not pull these — copied from `deps_zsytri2x.txt` and added the additional siblings (`zsytri`, plus all `zsytri2x` deps).
