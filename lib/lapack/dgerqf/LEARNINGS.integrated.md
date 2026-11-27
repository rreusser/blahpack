# dgerqf: Translation Learnings

## Translation pitfalls

- Mirror of dgelqf but iterates backward over blocks
- The blocked loop computes ki/kk to determine how many rows are handled by blocked code, then iterates from I = K-kk+ki down to K-kk in steps of -nb
- After the loop, mu/nu track the remaining submatrix dimensions for the unblocked tail call
- The Fortran loop variable I is 1-based; converting to 0-based required careful tracking of mu = M-K+i+nb, nu = N-K+i+nb after loop exit
- dlarft uses 'backward'/'rowwise' (not 'forward'/'rowwise' as in dgelqf)

## Dependency interface surprises

- dlarfb with 'backward'/'rowwise': the V matrix starts at row M-K+i, not at row 0. The WORK offset for dlarfb is separate from the IB offset used in Fortran (WORK(IB+1))

## Missing automation

- N/A

## Coverage gaps

- Small test matrices (K < 32) only exercise the unblocked path; blocked path requires K >= 32

## Complex number handling

- N/A (real routine)
