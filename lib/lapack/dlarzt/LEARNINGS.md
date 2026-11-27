# dlarzt: Translation Learnings

## Translation pitfalls

- `dlarzt` only supports `DIRECT='B'` (backward) and `STOREV='R'` (rowwise). The Fortran source explicitly rejects other values via XERBLA. This is unlike `dlarft` which supports all four combinations. In JS, the base routine simply assumes backward/rowwise without re-validating.
- The DGEMV call uses V's row stride (strideV2) as the vector stride for the x argument, since the reflector vector is stored as a row of V. This differs from `dlarft`'s columnwise case which uses strideV1.
- The loop iterates backward (K-1 down to 0). The T matrix is lower triangular (T(i+1:K-1, i) are the off-diagonal entries below the diagonal).

## Dependency interface surprises

- `dgemv` in ndarray form takes: `(trans, M, N, alpha, A, sa1, sa2, oa, x, sx, ox, beta, y, sy, oy)`. The x vector uses a single stride (not 2D strides), so when x is a row of V, pass `strideV2` as the stride.
- `dtrmv` ndarray: `(uplo, trans, diag, N, A, sa1, sa2, oa, x, sx, ox)`. The x vector (column of T) uses `strideT1` as its stride.
