# zgeqrt3: Translation Learnings

## Translation pitfalls

- Almost a mechanical translation of `dgeqrt3` (real → complex), with
  the same "every `'transpose'` flag operating on V/V^T or A/A^T becomes
  `'conjugate-transpose'`" rule that applied to `zgelqt3`. Flags that
  multiply by T1/T2 (upper triangular, real or complex without conj
  semantics for these factors) and the V/V^H apply-from-right with no
  transpose stay `'no-transpose'`.
- **Important asymmetry with `zgelqt3`:** the Fortran `ZGEQRT3` does
  NOT include `T(1,1) = CONJG(T(1,1))` after the `N=1` ZLARFG call,
  whereas `ZGELQT3` does. The reason is structural: in QR the implicit
  reflector `H = I - V T V^H` already matches what `ZLARFG` returns
  unaltered, but in LQ the row-vector orientation needs the conjugated
  `tau` to make the `I - V^H T V` reflector correct. Resist the urge
  to add the conjugation by analogy to `zgelqt3` — verify against the
  Fortran source.
- The Fortran's second copy step does include `CONJG`:
  `T( I, J+N1 ) = CONJG(A( J+N1, I ))`. This is the construction of
  `Y1^H * Y2 * T2` as the workspace, which transposes-and-conjugates
  the V1 block. Easy to overlook because `dgeqrt3`'s analog does not
  have CONJG (real transpose only). I left a code comment marking the
  divergence.
- The recursion-as-self-call pattern from `dgeqrt3`/`zgelqt3` carries
  over verbatim. `IINFO` from the Fortran is silently dropped —
  `M >= N` is preserved across recursion on valid input, so failure
  is unreachable.

## Dependency interface surprises

- `zgemm`/`ztrmm` accept `Complex128` scalars for `alpha`/`beta`, not
  raw doubles. Hoisted `CONE` and `CNEG_ONE` to module scope to avoid
  per-call allocation (matches `zgelqt3`'s pattern).
- `zlarfg`, `zgemm`, `ztrmm` use complex-element strides at their public
  boundary — same as `base.js` here. Forward offsets directly with no
  `*2` conversion; the `*2` conversion is only needed inside `base.js`
  when manually walking the Float64 view for the in-block copies and
  the in-place subtraction.

## Complex number handling

- The three manual blocks (Step 1 copy of A→T workspace, Step 7
  in-place A -= T_buf with zeroing, second Step 1 conjugated copy of
  V1 block) are the only places that touch the Float64 view directly;
  everything else flows through `zgemm`/`ztrmm`/`zlarfg` which do
  their own `reinterpret`. Inlining the conjugated copy as
  `Tv[tIdx+1] = -Av[aIdx+1]` is safe and obvious — no `cmplx.conj`
  call needed.

## Coverage

- 100% line / 100% branch / 100% function on all five files
  (`base.js`, `ndarray.js`, `zgeqrt3.js`, `main.js`, `index.js`) with
  the eight fixture cases (N=1 base case, N=1 degenerate, plus
  M=N=4 square, M>N rectangular splits at varying balance, plus the
  real-only sanity input) and stride/offset and row-major layout
  variations. The N=0 quick return is exercised separately.

## Test fixture

- The Fortran test uses `complex*16 :: A(M, N)` declared at exact
  size (no NMAX padding) so the `EQUIVALENCE`-based interleaved-real
  printout maps directly onto a packed `Complex128Array` for the JS
  side, avoiding the LDA/EQUIVALENCE stride pitfall called out in
  the project translation skill.

## Follow-up

- Once `zgeqrt3` is landed (this routine), `zgeqrt` (already
  translated) can swap its panel kernel from `zgeqrt2` to `zgeqrt3`
  for better blocked-recursion performance. That swap is intentionally
  out of scope for this task.
