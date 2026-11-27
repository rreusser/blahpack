# zgelqt: Translation Learnings

## Translation pitfalls

- **`zlarfb` direction (rowwise + side='right') uses `'no-transpose'`, not `'conjugate-transpose'`.** The Fortran source calls `ZLARFB('R','N','F','R',...)` — same as the real `dgelqt` analog. The prompt warned to trust the Fortran source over any conflicting prompt guidance, and that was correct here. (Within `zlarfb`, the V-side multiplications use `'conjugate-transpose'`, but that is internal to `zlarfb`; the caller-facing `trans` flag is `'no-transpose'`.)
- **WORK leading dimension is recomputed per panel.** The Fortran reference passes `WORK, M-I-IB+1` so the WORK leading dimension equals the trailing-matrix row count `M-i-ib`, recomputed each iteration. Matching the Fortran's per-panel ldwork keeps WORK at the spec'd `mb*N` complex elements and works for both `M<=N` and `M>N`.
- **Drop `strideWORK` from base.js entirely.** `signature.py` emitted a 14-param signature with `strideWORK`, but the leading dimension is computed inside the routine (not caller-provided). The base API takes only `WORK, offsetWORK` (13 params total). The `signature-conformance` ESLint rule warns about the param count but the warning is benign — WORK is logically 2D for `zlarfb`.

## Dependency interface surprises

- **`zlarfb` with `storev='rowwise'`, `side='right'` consumes WORK as a logically 2D `(rows-of-C)`-by-`K` column-major buffer in complex elements.** Pass `strideWORK1 = 1`, `strideWORK2 = M-i-ib`. Same convention as `dlarfb`.
- **`zgelqt3` accepts complex-element strides for A and T**, consistent with the rest of the z-prefix family. No `*2` adjustment is required at the `zgelqt`→`zgelqt3` boundary — pass the API strides through verbatim.

## Complex number handling

- **`zgelqt` itself contains no complex arithmetic.** It is pure dispatch (call `zgelqt3`, then `zlarfb`); there are no per-element loads or arithmetic on `A`/`T`. No `reinterpret()` is needed in `base.js`. The gate's "z-prefix uses reinterpret()" check warns on this, but the warning is benign — all real work is delegated to leaf kernels.

## Fixture handling

- **EQUIVALENCE-printed complex arrays must use exact-size declarations.** Following the prior `zgelqt3`/`zgeqrt`/`zgeqrt3` pattern, the Fortran test declares `A(M, N)` and `A_r(2, M, N)` per case (rather than a shared NMAX-padded buffer) so the printed buffer maps directly onto a packed `Complex128Array` in JS tests. Avoids the leading-dimension/EQUIVALENCE-stride mismatch documented in CLAUDE.md.

## Coverage gaps

- 100% line and 100% branch coverage achieved on `base.js`, `ndarray.js`, `zgelqt.js`, `index.js`, and `main.js`. The `if (i + ib < M)` branch (skip trailing update for the final block) is exercised by the `m3_n5_mb3` and `m1_n4_mb1` cases. Quick-return paths covered by `m0_n4_mb1` and the dedicated `M=0`/`N=0` JS tests.

## Process improvements

- **Scaffold's `signature.py` emits an unused `strideWORK` param** for routines whose Fortran WORK is `WORK(*)` but is logically 2D in callees. Mirror the dgelqt sister and remove it manually before implementing.
- **Scaffold's benchmark `max = 3` (N=1000) is dangerous.** For zgelqt this would allocate `N*N` complex elements per buffer (`16*N*N` bytes ≈ 16MB at N=1000 — tolerable here, but combined with the trans-of-N MB*N buffer, dropping to `max=2` matches the dgelqt sister and aligns with the Benchmark OOM trap note in CLAUDE.md.
- **lint-fix.sh reports CLEAN even when `bin/lint.sh` flags 10 ESLint errors.** Some var-order and ternary-paren errors aren't auto-fixed; run `bin/lint.sh` separately and address the residue manually.
