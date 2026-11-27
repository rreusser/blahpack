# dorm2l: Translation Learnings

## Translation pitfalls

- Mirror of dorm2r but for QL factorization (Q = H(k)...H(2)H(1))
- Reflectors stored in COLUMNS of A (same as dorm2r), but the pivot element is at A(nq-k+i, i) instead of A(i, i)
- The sub-matrix of C affected is C(0:m-k+i, :) for left side, not C(i:m, :) as in dorm2r
- Iteration direction is reversed compared to dorm2r: forward when (left+notran) or (!left+!notran), backward otherwise

## Dependency interface surprises

- dlarf receives the column vector v = A(:, i) with stride strideA1, starting from offsetA + i*strideA2

## Missing automation

- N/A

## Coverage gaps

- All 4 side/trans combinations tested with identity and rectangular C
- K=1 single-reflector case tested

## Complex number handling

- N/A (real routine)
