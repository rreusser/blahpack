# zsyconvf: Translation Learnings

## Translation pitfalls

- The reference Fortran `ZSYCONVF` (LAPACK 3.12.0) REVERT branch reads
  `IPIV(I)` AFTER incrementing (upper) or decrementing (lower) `I`. At
  that point, the value at the new index is the positive self-marker
  written by CONVERT (e.g. `IPIV(I) = I`), NOT the negative-encoded
  pivot. The subsequent `IP = -IPIV(I)` therefore yields a negative
  Fortran row index, and `A(IP, ...)` accesses out-of-bounds memory
  that resolves (via column-major layout arithmetic) to a valid but
  unrelated element of `A`. This appears to be a pre-existing quirk in
  reference LAPACK — the resulting swap is not an inverse of the
  CONVERT step, but the fixtures capture this exact behavior. The JS
  translation must replicate it verbatim: compute `ip = -i - 2`
  (0-based JS row) after the increment/decrement in the upper/lower
  revert 2x2 branches, NOT `~IPIV[i]`.
- The 2x2 pivot marker in CONVERT output lives at the SMALLER-index
  slot for upper and at the LARGER-index slot for lower (the slot
  opposite to the one the convert loop overwrites with the positive
  self-marker).
- IPIV convention: positive 0-based row index OR bitwise-NOT encoded
  for 2x2. Fortran `-p` (1-based) is numerically equal to JS `~(p-1)`,
  so the raw Fortran value passes through unchanged for negatives.

## Dependency interface surprises

- No callable JS dependencies (the reference uses ZSWAP but a 1-element
  swap with stride `LDA` can be handled inline without a call).

## Complex number handling

- Both `A` and `E` are `Complex128Array`. The routine moves full
  complex pairs around; no complex arithmetic beyond swap/zero is
  needed. All indexing uses doubled Float64 strides/offsets after
  `reinterpret()`.
- No conjugation: zsyconvf treats the matrix as symmetric (not
  Hermitian), identical in memory operations to dsyconvf.

## Coverage gaps

- The "bogus swap" branches in the upper and lower revert 2x2 paths
  were only reachable through Fortran-generated fixtures with specific
  pivot patterns (2x2 block at the very last column pair in upper, or
  very first pair in lower). For 100% branch coverage I added targeted
  tests with artificially constructed IPIV arrays to hit the swap
  loops inside these branches.
