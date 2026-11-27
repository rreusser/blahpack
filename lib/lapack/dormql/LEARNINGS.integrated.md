# dormql: Translation Learnings

## Translation pitfalls

- Mirror of dormqr but uses 'backward'/'columnwise' for dlarft/dlarfb (not 'forward'/'columnwise')
- Block reflectors applied to C(0:m-k+i+ib-1, :) or C(:, 0:n-k+i+ib-1), starting from the TOP-LEFT of C (not offset by i)
- The A offset for each block is just offsetA + i*strideA2 (column offset only, row always starts at 0)

## Dependency interface surprises

- dlarfb with 'backward'/'columnwise' direction: V starts at column i but always from row 0

## Missing automation

- N/A

## Coverage gaps

- Small test matrices only exercise unblocked path via dorm2l (nb=32 > K=3)

## Complex number handling

- N/A (real routine)
