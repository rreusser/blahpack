# zhbgst: Translation Learnings

## Translation pitfalls

- The Fortran uses GOTO-based loop structure (labels 10 and 490) with two phases.
  Restructured as `while (true)` loops with `break`/`continue`.
- Phase 2 upper 2nd-set zrot: Fortran applies DCONJG(WORK(M-KB+J)), but WORK has
  already been conjugated by the preceding ZLACGV call. In JS, zlacgv conjugates
  in-place, so the zrot should pass WORK values as-is (without extra negation of
  the imaginary part). Getting this wrong produces a sign flip on imaginary parts
  of the X matrix. The symmetry is broken because the lower path applies
  DCONJG to undo the ZLACGV before zrot, while the upper path does not.
- INCA = LDAB * KA1 is the stride in complex elements for vectorized rotation
  calls (zlargv, zlartv, zlar2v) that operate on elements spaced KA1 columns apart.
- ZPBSTF is needed to factor BB before calling ZHBGST. The Fortran test handles
  this, and the JS test uses pre-factored BB from fixtures since zpbstf is not
  yet implemented in JS.

## Dependency interface surprises

- zlartg takes separate Complex128Array + offset for each scalar (f, g, s, r),
  requiring use of WORK[0] as temporary storage for the RA1 input.
- zrot takes s as a Float64Array [re, im], not a Complex128 scalar.
- ZGERU vs ZGERC: Phase 1 upper uses ZGERC, phase 1 lower uses ZGERU,
  phase 2 upper uses ZGERU, phase 2 lower uses ZGERC. Must match exactly.

## Automation opportunities

- The four-branch structure (upper/lower x phase1/phase2) has significant
  repetition. The band-storage indexing differs but the rotation patterns
  are nearly symmetric.

## Coverage gaps

- No tests for error returns (invalid vect/uplo/N/ka/kb) since the Fortran
  XERBLA path is not translated (validation in ndarray.js).
- Large KA/KB ratios not extensively tested.

## Complex number handling

- All complex arithmetic is inlined using Float64 views via reinterpret().
- BB*conj(AB), conj(BB)*AB patterns require careful sign tracking.
- Diagonal elements of Hermitian band matrix are forced real after scaling.
