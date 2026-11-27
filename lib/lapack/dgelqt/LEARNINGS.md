# dgelqt: Translation Learnings

## Translation pitfalls

- **`dlarfb` direction (rowwise + side='right') uses `'no-transpose'`, not `'transpose'`.** The Fortran source for `dgelqt` calls `DLARFB('R','N','F','R',...)` — the prompt suggested `'transpose'` but trusting the source was correct. `dgeqrt` (the QR analog) uses `'T'`, but `dgelqt` does not.
- **WORK leading dimension varies per panel.** The Fortran reference passes `WORK, M-I-IB+1` so the WORK leading dimension equals the trailing-matrix row count `M-i-ib`, recomputed each iteration. The sister `dgelqf` uses a fixed `ldwork = M`, but that requires an `M*nb` WORK buffer, which violates the documented `mb*N` size when `M-mb > N`. Matching the Fortran's per-panel ldwork keeps WORK at the spec'd `mb*N` and works for both `M<=N` and `M>N`.
- **Drop `strideWORK` from base.js entirely.** Because the WORK leading dimension is computed inside the routine (not provided by the caller), the base API takes only `WORK, offsetWORK` (13 params total, not 14). The `signature-conformance` ESLint rule warns about the param count but the warning is benign here — WORK is logically 2D for `dlarfb`.

## Dependency interface surprises

- **`dlarfb` with `storev='rowwise'`, `side='right'` consumes WORK as a logically 2D `(rows-of-C)`-by-`K` column-major buffer.** Pass `strideWORK1 = 1`, `strideWORK2 = M-i-ib` (the leading dim) to match Fortran. See [docs/dependency-conventions.md](docs/dependency-conventions.md) — this is consistent with the rest of the compact-WY family.

## Fixture handling

- **`print_matrix(name, mat, lda, m, n)` writes the compact `m*n` block, not `lda*lda`.** Even though the Fortran test declared `A(NMAX,NMAX)` with `NMAX=16`, `print_matrix` only emits the leading `m`-by-`n` slice. Initial JS tests assumed the fixture was the full padded buffer (`NMAX*NMAX`) and failed. Fixture columns are stride-`m`, not stride-`NMAX`.

## Coverage gaps

- 100% line and 100% branch coverage achieved on `base.js`, `ndarray.js`, `dgelqt.js`, `index.js`, and `main.js`. The `if (i + ib < M)` branch (skip trailing update for the final block) is exercised by the `m3_n5_mb3` and `m1_n4_mb1` cases.

## Process improvements

- **The lint `jsdoc-doctest` rule executes `@example` blocks.** A trailing `// returns 0` annotation in `@example` triggers the rule to actually `require()` the published-path module (`@stdlib/lapack/base/dgelqt`), which fails when the module hasn't been published to stdlib. Drop result-comment annotations from `@example` to keep the rule happy. (Sister `dgelqt3`'s `@example` has no `// returns` and lints clean.)
- **Scaffold benchmark `max = 3` allocates `N*N = 1e6` doubles per buffer at N=1000.** For a routine with 3 N-sized buffers (A, T, WORK with `mb*N` each) this is borderline. Reduced to `max = 2` (N=100) for safety per the `Benchmark OOM trap` note in CLAUDE.md.
