# ztzrzf: Translation Learnings

## Translation pitfalls

- ztzrzf is the complex blocked driver for the RZ factorization (sibling of dtzrzf). The algorithm is mechanically identical to dtzrzf — the only differences are typed-array choice (`Complex128Array`) and the dispatch to `zlatrz`/`zlarzt`/`zlarzb` (complex) instead of the d-prefix BLAS analogs.
- For the `M == N` quick return, the d-prefix code writes zero scalars directly to `TAU[ offsetTAU + i*strideTAU ]`. The z-prefix version must `reinterpret(TAU, 0)` and write `(re, im)` pairs at `(offsetTAU + i*strideTAU) * 2` (and `+1`). Forgetting the factor-of-2 is the typical first-translation bug.
- The `mu = i + nb` computation after the loop (where `i` is the post-decrement value) is the same trick used in dtzrzf and dgerqf — translate it verbatim, do not try to derive a "more obvious" form.
- ILAENV(1, ...) is dropped: NB hardcoded to 32 and NX to 128 (matching DEFAULT_NB / DEFAULT_NX in dtzrzf).

## Dependency interface surprises

- `zlatrz` returns the modified matrix `A` (not an info code) — matching its d-prefix sibling. We don't capture the return value because A is updated in-place; same convention as dtzrzf calling dlatrz.
- `zlarzt` expects T as a flat NB-by-NB buffer with `strideT1=1, strideT2=nb, offsetT=0`; allocate it with `new Complex128Array(nb*nb)` and reuse across loop iterations.
- `zlarzb` re-uses the same WORK buffer with `ldwork = M` for its right-multiply scratch space.

## Complex number handling

- Internal T scratch: `Complex128Array(nb*nb)` (1024 complex elements at nb=32). Allocated once per call, NOT exposed in the API (matches dtzrzf's internal `T` buffer).
- The fallback `WORK = new Complex128Array(iws)` when caller-provided WORK is undersized matches the established pattern in dtzrzf/zgeqrf. Trips the `workspace.no-internal-alloc` gate check — this is a codebase-wide condition for the blocked LAPACK drivers, not specific to ztzrzf.
- Test reconstruction `A = R*Z` needs careful handling of the Householder formula: for `H(k) = I - tau * v * v^H`, applying from the right to row vector y gives `y - tau * (y*v) * v^H`. The dot `y*v` uses `v` directly (NOT conjugated), but the final scatter `y(M+j) -= tau*dot*conj(v(M+j))` requires conjugation. Initial implementation had these swapped, producing visibly-close-but-wrong reconstructions only on complex-valued tests (real-valued ports of the same code would have appeared correct).

## Coverage gaps

- Coverage on lib/base.js, lib/ndarray.js, and lib/ztzrzf.js is 100% line / 100% branch (per `node --test --experimental-test-coverage`). All 28 tests pass.

## Process / automation notes

- `bin/init_routine.py` auto-generated a deps file that included BLAS dependencies (`zcopy`, `zgemm`, ...). The Fortran test compile harness only finds LAPACK-namespaced sources, so those BLAS deps need to be pruned from `deps_<routine>.txt` — same workaround used by `zlatrz`. Cross-reference an already-completed sibling's deps file before running `run_fortran.sh`.
