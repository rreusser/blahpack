# dorgql: Translation Learnings

## Translation pitfalls

- The Fortran loop `DO 50 I = K-KK+1, K, NB` (1-based) translates to
  `for (i = K-kk; i < K; i += nb)` (0-based). The loop goes forward
  through TAU indices, unlike dorgqr which goes backward.
- Fortran dimension counts like `M-K+I+IB-1` (1-based count) become
  `M-K+i+ib` (0-based count of rows 0..M-K+i+ib-1). This is a
  consistent +1 offset from the 1-based count.
- The zero-fill loop `DO 20 J = 1, N-KK; DO 10 I = M-KK+1, M` zeros
  rows M-KK..M-1 of columns 0..N-KK-1 (0-based). This only executes
  when N > KK (i.e., N > K in the blocked path), which requires N > K > NB.

## Dependency interface surprises

- dlarft with direction 'B' (Backward) and storev 'C' (Columnwise) is
  the correct combination for QL reflectors, mirroring how dorgqr uses
  'F' and 'C' for QR reflectors.
- dlarfb uses ('L', 'N', 'B', 'C') for QL: left-side, no-transpose,
  backward, column-stored. The V matrix pointer is A at column N-K+i,
  and C is A starting from column 0.
- dlarfb WORK parameter uses 2D strides (strideWORK1=1, strideWORK2=ldwork).
  The T matrix (output of dlarft) shares the same workspace buffer at offset 0,
  while dlarfb scratch starts at offset ib.

## Automation opportunities

- The structure of dorgql is a direct mirror of dorgqr with direction
  changes (Forward->Backward, reflectors in last K columns instead of
  first K). A parameterized blocked-org generator could produce both.

## Coverage gaps

- 100% line and branch coverage achieved.
- The N > K > NB path (zero-fill of leading columns before blocked part)
  required a dedicated test case with K=34, N=35, NB=32.
- When K < N, the output Q is not fully orthogonal because dorg2l with
  K=0 fills in identity columns that may be corrupted by subsequent
  dlarfb applications. This matches Fortran behavior.

## Complex number handling

- N/A (real-valued routine only).
