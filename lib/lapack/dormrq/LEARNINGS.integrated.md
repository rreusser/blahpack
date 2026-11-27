# dormrq: Translation Learnings

## Translation pitfalls

- Mirror of dormqr but uses 'backward'/'rowwise' for dlarft/dlarfb
- Critical: dormrq FLIPS the transpose for dlarfb. If trans='no-transpose', dlarfb receives 'transpose', and vice versa. This is because the block reflector formulation H = I - V^T * T * V for rowwise storage interacts differently with the transpose
- Block A offset uses i*strideA1 (row offset), unlike dormql which uses i*strideA2 (column offset)

## Dependency interface surprises

- dlarfb with 'backward'/'rowwise': the V matrix has K rows starting at row i, and NQ-K+i+ib columns starting from column 0. The leading dimension is LDA (strideA2), not K

## Missing automation

- N/A

## Coverage gaps

- Small test matrices only exercise unblocked path via dormr2 (nb=32 > K=3)

## Complex number handling

- N/A (real routine)
