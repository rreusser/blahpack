# zsyconvf_rook: Translation Learnings

## Translation pitfalls

- Rook pivot IPIV encoding: BOTH elements of a 2x2 rook pivot pair are
  negative (unlike Bunch-Kaufman / zsyconv where only one is). The code
  must read `IPIV[i-1]` (upper convert) or `IPIV[i+1]` (lower convert) as
  a negative partner and also perform the row swap for it.
- Upper Revert walks i forward (1..N), but on a 2x2 encounter it
  pre-increments `i` then reads `IPIV[i]` and `IPIV[i-1]` — mirror of the
  Lower Revert which pre-decrements. Missing the pre-increment is silent
  and produces correct-looking but wrong output.
- 0-based vs 1-based IPIV: Fortran positive IPIV is 1-based row. In JS
  0-based convention, subtract 1 when decoding positives. Fortran negative
  `-p` (1-based partner row p) equals JS `~(p-1)` — same raw numeric value,
  so no conversion needed for negatives. Decoding: `ip = ~IPIV[i]`
  (bitwise NOT), NOT `-IPIV[i] - 1`.

## Dependency interface surprises

- None — routine only calls ZSWAP internally, inlined as a helper.

## Complex number handling

- Symmetric (not Hermitian): NO conjugation anywhere. The element swap is
  a plain copy of (re, im) pairs.
- Complex-element strides at the API boundary: internal code doubles
  strides/offsets (`sa1 = strideA1 * 2`, etc.) to index the reinterpreted
  `Float64Array` view.
- The `stdlib/z-prefix-reinterpret` ESLint rule triggers on helper
  functions that index Float64 views named `Av`/`Bv`/etc. when the helper
  doesn't itself contain a `reinterpret(...)` call. Workaround: name the
  helper parameter in lowercase (`av`) so it doesn't match the regex.

## Testing / coverage

- Fixture uses Fortran ZSYTRF_ROOK which at the chosen diagonally
  dominant 4x4 matrices selects all 1x1 pivots (IPIV = [1,2,3,4]),
  leaving the 2x2 swap branches uncovered. Near-zero diagonals
  (`1e-10`) force rook 2x2 pivots and cover the remaining branches.
- Uncovered: `swapRows` `r1 === r2` no-op short-circuit (pivot IP ===
  row I case) and a couple of `i > 0` / `i < N-1` early-exit branches
  inside the 2x2 Revert paths. These require constructed IPIV arrays
  since zsytrf_rook does not naturally produce them at N=4.

## Fortran test pitfalls

- The Fortran test requires `dlamch` and `zsyr` transitive dependencies
  for linking ZSYTRF_ROOK — `deps.py` does not detect these.
