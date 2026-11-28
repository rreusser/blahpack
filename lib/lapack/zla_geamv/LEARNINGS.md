# zla_geamv: Translation Learnings

## Translation pitfalls

- `Y` is **real** (`Float64Array`) while `A` and `X` are complex
  (`Complex128Array`). Only the A/x strides/offsets get doubled after
  `reinterpret(..., 0)`; `strideY`/`offsetY` stay untouched.
- Fortran `TRANS` is an **integer** (via `ILATRANS`), not a character.
  Translated to the standard string convention
  (`'no-transpose'`/`'transpose'`/`'conjugate-transpose'`). Because the
  routine uses `CABS1` (= `|re| + |im|`) for `|A|`, `'transpose'` and
  `'conjugate-transpose'` produce identical results — `|conj(z)| = |z|`.
  Implemented them as the same branch but kept the distinction at the API
  boundary so callers can mirror the Fortran semantics.
- Quick return `(alpha===0 && beta===1)` happens *before* the LDA check is
  relevant, but the Fortran test program still triggers the argument-error
  path when `LDA < max(1,M)` even if `N===0`. Had to size test fixtures with
  `A(M,1)` for the `N=0` case to avoid `XERBLA` at test time.
- Fortran test's `test_beta_one_alpha_zero` still has to declare and pass A/x
  even though neither is referenced, and `print_array` with `n=0` is a no-op.

## Complex number handling

- `CABS1(z) = |re(z)| + |im(z)|` — not the true modulus. Safe to inline
  (two `Math.abs` calls, no allocation, no numerical-stability concern).
  Do NOT use `cmplx.abs` here — it would be wrong.
- The "symbolic zero" check on `x[j]` requires `xr === 0 && xi === 0`
  (both parts). Using OR here would falsely flag purely-imaginary entries
  as zero and suppress the SAFE1 perturbation.
- Both `A` and `x` are reinterpreted as Float64 with strides/offsets ×2.
  The inner loop advances `ia += sa2` (notrans) / `sa1` (trans) directly in
  double-element units, and `jx += sx` where `sx = strideX * 2`.

## Coverage gaps

- Achieved 100% line, 90.24% branch on `base.js`. The "y[iy] already
  zero with beta != 0" branch required explicit tests beyond the fixture
  cases (fixture inputs all started with nonzero y).

## Benchmark fixup

- Both scaffolded benchmarks used `dtype: 'float64'` for the matrix and
  vector (a real-valued layout), which would have silently misinterpreted
  a Complex128Array routine. Rewrote using `complex128` for A/x and
  `float64` for y0.
