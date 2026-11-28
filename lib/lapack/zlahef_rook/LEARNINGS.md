# zlahef_rook: Translation Learnings

## Translation pitfalls

- **Lower-path "undo interchanges" loop differs from `dlasyf_rook`.** The
  Hermitian variants (`zlahef`, `zlahef_rook`) terminate the post-loop
  undo-interchanges with `IF (J.GT.1) GO TO 120` (continue while J > 1
  in 1-based), whereas the symmetric variant (`dlasyf_rook`) uses
  `IF (J.GE.1) ...`. In 0-based JS this is `while (j > 0)` for Hermitian
  vs `while (j >= 0)` for symmetric. Easy to miss when copy-adapting
  between variants.
- **Lower-path P/K row swap range** (`dswap` in the upper-left corner):
  Hermitian uses `K-1` columns (`IF (K.GT.1) DSWAP(K-1, A(K,1), ...)`)
  while symmetric uses `K` columns (`DSWAP(K, A(K,1), ...)`). The
  difference is one column — the diagonal column itself isn't swapped
  for Hermitian (it's overwritten). Same pattern for the KK/KP swap.
- **Diagonal real-part forcing is per-step, not just once.** The trailing
  rank-update loop (over `jj`) zeros `Im(A[jj,jj])` both *before* and
  *after* each `zgemv` call. Skipping the post-zero leaves tiny imaginary
  noise in the diagonal that propagates through subsequent updates. This
  matches the Fortran's two `A(JJ,JJ) = DBLE(A(JJ,JJ))` calls.
- **2x2 D copy in zlahef_rook stores the full off-diagonal `W(k-1,kw)`,
  not just its real part.** Unlike `zlahef_rk` which writes the
  off-diagonal element to a separate `e[]` output, `zlahef_rook` keeps
  it in `A(k-1,k)` (or `A(k+1,k)` for lower) **with both real and
  imaginary parts intact**. Forgetting this and zeroing the imaginary
  part produces silently wrong factorizations.
- **`KB` is returned in the result object, not as an output parameter.**
  The Fortran has `KB` as a writable scalar argument; in JS we drop it
  from the signature and return `{ info, kb }`. The scaffold's generated
  signature includes `kb` as a parameter — it must be removed from
  `ndarray.js` and `zlahef_rook.js`. Keep arity at 9 for the layout
  wrapper and 14 for the ndarray wrapper.
- **NaN-safe `IF(.NOT.(x.LT.y))` collapses to `x >= y`** for the lint —
  the codebase prefers the simpler form despite the slight NaN-handling
  difference (in Fortran `.NOT.(NaN < y) → .NOT.(false) → .true.`,
  which takes the "no swap" branch; `NaN >= y → false`, which takes the
  rook search branch). Existing `zlahef`, `zlahef_rk`, `dlasyf_rook` all
  use `>=`; we follow that convention.

## Dependency interface surprises

- `zdscal( N-1-k, r1, A, strideA1, offset )` correctly takes a real
  scalar (no Complex128 wrapper) — the routine is "scale by real
  scalar". Easy to confuse with `zscal` which takes a Complex128.
- `zswap` row swaps use `strideA2` (the column stride) when swapping
  *along a row* — not `strideA1`. In column-major, a row vector spans
  multiple columns spaced `strideA2` apart.

## Complex number handling

- All 2x2 pivot D inverse division was inlined manually (no `cmplx.div`)
  because the divisor `D21` is known non-zero by the rook search
  invariant (case 4: `|D21| > |D11|, |D22|`, so `|D22*D11| << 1`,
  `D22*D11 - 1 != 0`). Inline division uses
  `(a * conj(D21)) / |D21|^2` and `(a * D21) / |D21|^2` for divisions
  by `D21` and `conj(D21)` respectively.
- `D11 = real * D21 / |D21|^2` and `D22 = real * conj(D21) / |D21|^2`
  exploit the fact that `W(k,kw)` and `W(k-1,kw-1)` are real (forced by
  the diagonal-real invariant), saving a complex multiply each.

## Coverage gaps

- The `Math.abs(tt) < SFMIN` element-wise division branches in the 1x1
  pivot scaling code are unreachable for any input that survives the
  rook pivot search — if `A(k,k)` is small enough to underflow `1/tt`,
  the rook search will likely choose a 2x2 pivot instead. The branches
  remain for parity with the Fortran reference but are not covered by
  the test suite.
- The "undo interchanges" `zswap` calls (lines ~458, ~462, ~756, ~760)
  fire only when partial-panel factorization swaps rows in the trailing
  matrix region. The current chase-pattern fixtures exercise the upper
  variant heavily but the specific combination of `j+1 <= N-1` and
  `jp != jj` in the post-loop didn't fire. Coverage stays above the
  required 90/85 threshold without explicitly hitting these.

## Process notes

- The scaffold's `test.ndarray.js` uses `tc.A` as the *expected* output
  but the fixture's `tc.A` is the post-factorization state, not the
  input. Constructing the input matrix from scratch in each test is
  necessary; `findCase()` only supplies the expected outputs.
- ESLint's `array-element-newline: ["error", "consistent"]` rule will
  expand any multi-element-per-line literal into one-per-line on
  `--fix`. To keep matrices compact, follow the `zlahef` test pattern:
  inline column-major data with `// col 0` comments separating columns.
