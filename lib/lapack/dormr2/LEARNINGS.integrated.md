# dormr2: Translation Learnings

## Translation pitfalls

- Reflectors stored in ROWS of A (from RQ factorization), unlike dorm2r where they are in columns
- A has K rows (not NQ rows); the pivot element is A(i, nq-k+i) and the vector runs along columns with stride strideA2
- dlarf receives v = A(i, :) with stride strideA2, starting at offsetA + i*strideA1
- Sub-matrix: C(0:m-k+i, :) for left, C(:, 0:n-k+i) for right

## Dependency interface surprises

- dlarf with row-stored reflector: the stride for v is strideA2 (column stride), NOT strideA1 (row stride)

## Missing automation

- N/A

## Coverage gaps

- All 4 side/trans combinations tested
- K=1, k_zero, m_zero, n_zero edge cases tested
- Rectangular C tested for both left and right sides

## Complex number handling

- N/A (real routine)
