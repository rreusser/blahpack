# zpstrf: Translation Learnings

## Translation pitfalls

- The Fortran blocked algorithm uses `J-K` as the number of columns processed so far in the current block (for GEMV and ZLACGV), not `J` as in the unblocked version where `K` is always 0.
- The `j > k` guards around ZLACGV/ZGEMV are critical: when `j === k` (first column in a block), there are no previous columns in the block to use for the rank-1 update.
- ZHERK call uses `N - j` (not `N - k - jb`) for the remaining dimension and `jb` for the number of columns in the block just factored.

## Dependency interface surprises

- ZHERK takes real scalar alpha/beta (not Complex128), unlike most BLAS-3 routines.
- ZPSTF2 is called directly only when NB >= N (small matrix fallback), not for trailing blocks as originally expected from reading the Fortran. The blocked code does its own inner loop and calls ZHERK for the trailing update.

## Automation opportunities

- The zpstrf.js (BLAS-style API wrapper) pattern is identical across all routines and could be generated from the signature.

## Coverage gaps

- Lines 139-142 (non-positive initial diagonal) and 147-149 (positive tol parameter) are edge cases only reachable with specific inputs. These are covered by the unblocked zpstf2 tests since zpstrf delegates to zpstf2 for small N.
- The blocked code path is fully exercised by N=80 tests (NB=64).

## Complex number handling

- All complex arithmetic is done via Float64Array (reinterpret) views, never Complex128 directly except for CONE/CMONE constants.
- Conjugation swaps in the pivot section are identical to zpstf2: manual sign-flip on imaginary parts.
- ZLACGV conjugates a row/column segment before ZGEMV, then unconjugates after, matching the Fortran pattern exactly.
