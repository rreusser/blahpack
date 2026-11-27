# dtgsna: Translation Learnings

## Translation pitfalls

- `M` in the Fortran signature is an **output** integer (number of elements of `s`/`DIF` that were filled), while `mm` is the **input** size of `s`/`DIF`. The scaffold generated both as plain integer parameters, but `M` must be an `Int32Array` for output. The base function sets `M[0]` both during the SOMCON counting pass and (implicitly) after the main loop.
- The inner loop advances `ks` by 2 for complex pairs, so both the WANTS and WANTDF branches share the same bookkeeping. In the Fortran, the N=1 early-exit for `WANTDF` jumps via GOTO to the end of the iteration; in JS, we replicate this with an explicit `ks += 1` (plus one more if `pair`) before `continue`.
- Fortran indexing `WORK( IZ+1 )` with `IZ = 2*N*N + 1` is 1-based, meaning the workspace offset inside WORK begins at 0-based index `2*N*N+1` (not `2*N*N`). The `LWORK-2*N*N` length passed to dtgsyl matches Fortran exactly and is a slight over-report by one element — we mirror it.
- `DTGEXC` in the translated codebase uses 0-based `ifst`/`ilst`, so the Fortran `IFST = K; ILST = 1` becomes `ifst = k; ilst = 0`. Also, `dtgexc` returns an object `{info, ifst, ilst}`, not an integer.

## Dependency interface surprises

- `dlag2` returns an object `{scale1, scale2, wr1, wr2, wi}` rather than writing to out-pointers. When operating on a 2x2 block copied into `WORK[0..3]` and `WORK[4..7]`, pass `(WORK, 1, 2, offsetWORK, WORK, 1, 2, offsetWORK+4, safmin)`.
- `dtgsyl` takes `scale` and `dif` as `Float64Array` scalar-slots (index 0), not return values. Allocate small `new Float64Array(1)` slots for each call.
- When laying out N-by-N temporaries inside a 1D `WORK` buffer, the convention across the codebase (e.g. `dtgsen`) is to hard-code `strideWORK=1` for the 2D view (pass `1, N` as strides), even though the base `WORK` stride is nominally parameterized. Mixing a non-unit `strideWORK` with inner 2D layouts breaks the assumption.

## Single-char string flags

- `job`: `'E'` -> `'eigenvalues'`, `'V'` -> `'eigenvectors'`, `'B'` -> `'both'`.
- `howmny`: `'A'` -> `'all'`, `'S'` -> `'selected'`.
