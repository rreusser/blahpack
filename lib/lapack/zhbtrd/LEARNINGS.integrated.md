# zhbtrd: Translation Learnings

## Translation pitfalls

- The Fortran ZHBTRD is structurally identical to DSBTRD (real symmetric band reduction), but every array operation uses complex arithmetic. The translation follows the dsbtrd base.js as a template, substituting complex routines.
- The `d` and `WORK` arrays serve double duty: during the reduction they store cosines (real, in `d`) and complex sines (in `WORK`), then the tridiagonal elements are extracted from `AB` at the end.
- The "make off-diagonal real" loop at the end is unique to the complex version. It normalizes each off-diagonal element by its absolute value and propagates the phase factor to the next element and to Q via ZSCAL.
- Upper case Q rotation uses `DCONJG(WORK(J))` (conjugated sine), while lower case uses `WORK(J)` directly. This matches the Fortran exactly.
- The diagonal must be forced real at the start: `AB(KD1,1) = DBLE(AB(KD1,1))` for upper, `AB(1,1) = DBLE(AB(1,1))` for lower.

## Dependency interface surprises

- `zrot` expects `s` as a `Float64Array(2)` containing `[re, im]` of the complex sine, not a Complex128Array. This requires extracting values from the reinterpreted WORK array into a scratch Float64Array before each zrot call.
- `zlartg` takes Complex128Array + offset for all complex arguments (f, g, s, r), plus Float64Array + offset for the real cosine c. It writes directly into the provided arrays.
- `zlargv` writes cosines into `d` (Float64Array) and sines into `WORK` (Complex128Array), matching the Fortran convention of using D and WORK as scratch during the reduction.
- `zlaset` uses complex-element strides (does `*2` internally), matching the convention used by zlacgv, zlargv, zlartv, zlar2v, and zrot.
- `zscal` takes a `Complex128` scalar object, not a Float64Array pair.

## Automation opportunities

- The pattern of extracting a complex sine from a reinterpreted Complex128Array into a Float64Array(2) before calling zrot is repeated many times. A helper function could reduce this boilerplate.
- The upper/lower branches are very similar structurally. A code generator could produce both from a single template.

## Coverage gaps

- The `vect='update'` path is not directly tested (would need pre-populated Q matrix). The `vect='initialize'` and `vect='none'` paths are well covered.
- The `NR >= 2*KD-1` branch (zlartv path) vs the `NR < 2*KD-1` branch (individual zrot path) are both exercised by the KD=2/N=5 and KD=3/N=6 test cases.

## Complex number handling

- Complex multiplication is inlined in the "create nonzero element outside band" loops (WORK(J+KD) = WORK(J)*AB(...)).
- Complex absolute value uses `Math.sqrt(tr*tr + ti*ti)` in the "make off-diagonal real" loop (safe here since these are matrix elements, not at risk of overflow).
- `zscal` is called with `new Complex128(tr, -ti)` (upper, conjugated) or `new Complex128(tr, ti)` (lower, direct) for the phase normalization. Creating a Complex128 per iteration is acceptable since this loop runs at most N-1 times (not in the hot inner loop).
