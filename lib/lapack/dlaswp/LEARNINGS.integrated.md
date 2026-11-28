# dlaswp: Learnings from stdlib comparison

## File structure

Our file list matches stdlib exactly, except:
- stdlib has `test/test.dlaswp.js` and `test/test.ndarray.js` (separate test files per API variant)
- stdlib has `benchmark/` directory (we don't generate benchmarks yet)
- stdlib has `test/fixtures/` with JSON fixture files (we use Fortran-generated JSONL)

**Action**: scaffold should generate separate `test/test.<routine>.js` and `test/test.ndarray.js` files.

## base.js algorithmic differences

1. **Row-major delegation**: stdlib detects `isRowMajor` and delegates to `dswap` (Level 1 BLAS) for row-major layouts. We only implement the column-major tiled path. This is a performance optimization AND an API-completeness issue.

2. **Parameter naming**: stdlib uses `inck` not `incx` for the increment parameter. Our signature.py generates `incx` from the Fortran name, but stdlib renamed it.

3. **incx=0 handling**: stdlib handles incx sign via the caller (ndarray.js), not in base.js. Our base.js has the incx=0 early return, which matches the Fortran but differs from stdlib's base.js.

## 0-based vs 1-based IPIV values

This is a critical learning:
- **Fortran**: IPIV values are 1-based row indices. K1/K2 are 1-based.
- **stdlib base.js**: IPIV values are **0-based**. K1/K2 are **0-based**. The ndarray.js/dlaswp.js wrapper converts from 1-based Fortran convention.
- **Our base.js**: Currently uses 0-based (correct for stdlib convention).

The reverse pivot case (incx<0) is particularly tricky because the IPIV offset and iteration direction must be coordinated. stdlib handles this in the ndarray.js wrapper, keeping base.js simpler.

**Action**: Document in CLAUDE.md that base.js uses 0-based indices throughout, and the ndarray.js wrapper handles 1-based Fortran convention normalization.

## Test structure

stdlib uses separate test files:
- `test/test.js` — basic exports checks
- `test/test.dlaswp.js` — BLAS/LAPACK-style API tests
- `test/test.ndarray.js` — ndarray API tests
- `test/fixtures/*.json` — JSON fixture files (one per test scenario)

We use a single test file with inline fixture loading from Fortran-generated JSONL.

**Action**: Consider generating separate test files per API variant in scaffold.

## Actionable items for tooling

- [ ] scaffold should generate `test/test.<routine>.js` and `test/test.ndarray.js` — low priority, single test file works
- [ ] signature.py: consider `incx` → `inck` rename for LAPACK routines — edge case, deferred
- [ ] base.js: add `isRowMajor` detection and row-major fast path (using dswap) — perf optimization, deferred
- [x] Document 0-based convention for base.js in CLAUDE.md — DONE
- [ ] Consider generating `benchmark/` scaffolds — deferred until perf matters
