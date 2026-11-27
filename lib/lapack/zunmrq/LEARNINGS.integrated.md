# zunmrq: Translation Learnings

## Translation pitfalls

- Uses 'backward'/'rowwise' direction for zlarft and zlarfb (vs 'forward'/'columnwise' for zunmqr).
- Block reflector T is carved from WORK at offset nw*nb. The T matrix has stride (1, ldt) where ldt = nb+1.
- When NOTRAN, the transpose direction for the block reflector is 'conjugate-transpose' (opposite).
- The size of the submatrix is NQ-K+i+ib (0-based), which corresponds to Fortran's NQ-K+I+IB-1.

## Dependency interface surprises

- zlarfb takes stride parameters as (strideWORK1, strideWORK2) for the work array -- uses (1, ldwork) for column-major layout.
- zlarft/zlarfb long-form strings: 'backward', 'rowwise', 'forward', 'columnwise'.

## Automation opportunities

- zunmrq is structurally identical to zunmqr but with backward/rowwise direction and different submatrix dimensions. Could template both from a single source.

## Coverage gaps

- With NB=32, the blocked path only triggers for K > 32. Our tests use small K, so only the unblocked fallback (zunmr2) is exercised. A large-K test (K >= 33) would exercise the blocked path.
- All four SIDE x TRANS combinations tested via the unblocked path.

## Complex number handling

- Delegates to zunmr2 (unblocked) or zlarft+zlarfb (blocked). No direct complex arithmetic in this routine.
