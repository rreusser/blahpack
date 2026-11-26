# ilaenv: Translation Learnings

## Translation pitfalls

- `SUBNAM( 4: 7 ).EQ.'QP3RK'` compares four characters with five; Fortran blank-pads the shorter, so it never matches (`xGEQP3RK` gets NB = 1, NBMIN = 2, NX = 0 from this code). A JS `slice( 3, 7 ) === 'QP3RK'` is equally never true, so the translation keeps the reference's behaviour.
- Upper-casing applies to characters 1-6 only, and only when character 1 is lower-case: `'dGEQRF'` decodes as `DGEQRF`, `'Dgeqrf'` does not.
- TWOSTAGE reads character 11 of the 16-character `SUBNAM`: `'DSYTRF_AA_2STAGE'` has `2` there, `'DSYTRF_2STAGE'` does not.
- `ISPEC = 6` is `INT( REAL( MIN( N1, N2 ) ) * 1.6E0 )` in single precision (`float64ToFloat32` on each step); the fixture sweeps N to 3000 and past 2^24.
- Where the reference's `SNAME` and complex arms set the same value, the JS writes it once; NBMIN is 2 everywhere except `xSYTRF` (8).
- The checker for single-character Fortran flags (`strings.no-single-char-code`) fires on the character decode (`c1 === 'S'`); the decode uses regular expressions (`/^[SD]/`) instead.

## Dependency interface surprises

- `iparmq` drops the reference's unused `LWORK`: ILAENV's `IPARMQ( ISPEC, NAME, OPTS, N1, N2, N3, N4 )` is `iparmq( ispec, name, opts, n1, n2, n3 )`, with `n2`/`n3` the 1-based ILO/IHI.

## Missing automation

- `bin/gen-benchmark.mjs` probes scalar-only routines with `ispec = N` and option-like names (`'QR'`), so the generated benchmark times the `ispec > 17` return; it has no recipe hook for scalar functions.
- `bin/gen_readme.js`, `gen_repl_txt.js`, `gen_examples.js` emit placeholders for scalar functions with string arguments; the docs were written by hand.
- The fixture's name list was generated from the `ILAENV(` calls in `data/lapack-3.12.0/SRC/[dz]*.f` by a throwaway script (continuation lines joined, arguments split at top level).

## Coverage gaps

- None: the per-name sweep reaches every branch (the `QP3RK` comparisons excepted, which cannot match).

## Complex number handling

- N/A (no complex arithmetic; `C`/`Z` names only select tuning values).
