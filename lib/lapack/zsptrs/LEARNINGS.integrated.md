# zsptrs: Translation Learnings

## Translation pitfalls

- Symmetric vs Hermitian is a subtle but critical distinction: no conjugation anywhere (no zlacgv calls, no conjugate-transpose in zgemv phase 2, no conjugation on AKM1K in 2x2 solve). Used `'transpose'` instead of `'conjugate-transpose'` for phase 2 zgemv calls.
- Diagonal elements are fully complex in symmetric case, requiring `zscal` with complex reciprocal instead of `zdscal` with real reciprocal. The Hermitian case has real diagonals.
- The 2x2 pivot solve divides by AKM1K directly (both real and imaginary parts), whereas zhptrs divides by conj(AKM1K) for the AK computation and BK computation.

## Dependency interface surprises

- `zscal` takes a `Complex128` scalar, unlike `zdscal` which takes a real scalar. This is the key API difference when scaling by the reciprocal of a complex diagonal element.

## Automation opportunities

- The Fortran test B-packing pattern (copy from 2D B with LDB stride to contiguous Bpk) is repeated in every complex test. Could be a test_utils subroutine `pack_2d_to_1d(B, NMAX, n, nrhs, Bpk)`.

## Coverage gaps

- Four swap branches (upper 2x2 phase 1/phase 2, lower 1x1 phase 1/phase 2) remain uncovered because ZSPTRF's pivot selection does not generate `kp !== k` for the test matrices. These are simple zswap calls with identical structure to covered swap branches -- the logic is trivially correct.

## Complex number handling

- Used `cDiv` helper (same as zhptrs) for all complex divisions. No complex division was inlined.
- Complex multiplication in the 2x2 pivot solve (AK*BKM1, AKM1*BK, DENOM computation) was inlined since complex multiplication is safe to inline.
- `new Complex128(cdR, cdI)` allocations for zscal reciprocal are in the 1x1 pivot path (one per column step). These are cold enough to not matter for performance.
