# ztpqrt2: Translation Learnings

## Translation pitfalls

- **Two distinct ALPHA values inside the routine**: in the first loop
  `ALPHA = -CONJG(T(I,1))` (so `alphaR = -tauR, alphaI = +tauI`); in the
  second loop `ALPHA = -T(I,1)` (no conjugate, so
  `alphaR = -tauR, alphaI = -tauI`). It is tempting to reuse one helper —
  do not. Mixing them silently corrupts the T factor.
- The W workspace stored in `T(:,N)` is loaded as `CONJG(A(I, I+J))`, and
  the back-update `A(I, I+J) += ALPHA * CONJG(T(J, N))` reapplies a
  conjugate. Both conjugations are essential; the d-prefix sister has
  neither, so a pure mechanical "remove CONJG" port from dtpqrt2 is wrong.
- Mirror the dtpqrt2 index conventions exactly:
  `mp = min(M-l, M-1)`, `np = min(p, N-1)`, `p = min(i, l)`. These are
  off-by-one converted from Fortran's 1-based MP/NP/P; reuse the
  derivations rather than re-deriving from scratch.

## Dependency interface surprises

- `zlarfg` takes `alpha` and `tau` as `Complex128Array` pass-through with
  separate offsets; strides on `x` are in complex elements (no `*2`).
- `zgemv`, `zgerc`, and `ztrmv` all expect strides/offsets in
  **complex elements**; each multiplies by 2 internally before indexing
  the underlying Float64 buffer. Stay consistent — passing Float64 strides
  will silently corrupt outputs (no error, plausible-but-wrong values).
- `zgerc` performs `A := alpha * x * y^H + A` (note the `^H` on `y`),
  which is exactly what `dger` does after upgrading to the conjugate
  inner product — use it directly, no manual conjugation of `y` required.

## Complex number handling

- The conjugate-transpose forms (`'conjugate-transpose'`) of `zgemv` and
  `ztrmv` mean ztpqrt2 has no need for the workspace conjugate-flip
  dance that ztplqt2 had to do (ztplqt2 needed it because `'transpose'`
  in the LQ form is non-conjugating).
- Inlined complex multiplications throughout. None require complex
  division or absolute value, so no `cmplx.div` / `cmplx.abs` needed.
- The reinterpret/Float64 view convention is identical to ztplqt2 —
  reused those scratch-variable names verbatim.

## Test coverage

- 100% line/branch/function on `lib/base.js` was attainable with six
  fixture cases plus quick-return and out-of-range guards. The
  `i < N - 1` guard in the first loop is the only "tricky" branch
  (only false in the very last iteration); tests with N >= 2 cover
  both halves.

## Process notes

- The scaffolded `<routine>.js` validators were wrong by default
  (assumed A is M-by-N rather than N-by-N). Audit them against the
  Fortran spec — same warning the SKILL.md compact-WY section calls
  out.
- Wrote the Fortran test mirroring `test_ztplqt2.f90` (per-test
  exact-size arrays + EQUIVALENCE for printing); avoided the
  declared-vs-used dimension trap.
