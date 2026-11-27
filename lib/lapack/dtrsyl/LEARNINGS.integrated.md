# dtrsyl: Translation Learnings

## Translation pitfalls

- The Fortran uses `DDOT(K1-1, A(1,K1), 1, C(1,L1), 1)` for the transposed case (A**T), where the column of A is accessed with stride 1 (row-major in the transposed sense). In JS with column-major, this becomes `ddot(k1, A, strideA1, offsetA + k1*strideA2, ...)` -- note the stride is strideA1 (=1 for column major) and the offset starts at column k1.
- The `DDOT(M-K1, ...)` for the no-transpose case walks along a row of A: `A(K1, MIN(K1+1,M))` with stride LDA. In JS this is `ddot(M-k1-1, A, strideA2, offsetA + k1*strideA1 + min(k1+1, M-1)*strideA2, ...)`.
- When the dot product length is 0 (e.g., k1=0 or l1=0), ddot should return 0 silently. Verified this works correctly.

## Dependency interface surprises

- `dlange` uses full string norms: `'max'`, `'one-norm'`, `'frobenius'`, NOT single chars like `'M'`, `'1'`, `'F'`. Using single chars silently returns 0. This caused a critical bug in dtrsen's S computation.
- `dlaln2` returns an object `{ info, scale, xnorm }`, not a scalar info.
- `dlasy2` uses scratch output arrays `SCALOC_ARR` and `XNORM_ARR` (Float64Array of length 1).
- VEC and X scratch arrays are 2x2 column-major with stride 2 (i.e., `VEC[0]=row0col0`, `VEC[1]=row1col0`, `VEC[2]=row0col1`, `VEC[3]=row1col1`).

## Missing automation

- N/A

## Coverage gaps

- The scaling paths (scaloc != 1) are unlikely to trigger with normal-magnitude test inputs. Would need near-overflow/underflow inputs.
- All four trana/tranb combinations covered with both scalar and quasi-triangular blocks.

## Complex number handling

- N/A (real routine)
