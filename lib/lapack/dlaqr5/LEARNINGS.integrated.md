# dlaqr5: Translation Learnings

## Translation pitfalls

- **1-based internal variables**: dlaqr5 has extremely complex index arithmetic
  (INCOL, KRCOL, M, K, KMS, M22, MTOP, MBOT, BMP22 conditions). Converting all
  indices to 0-based would be error-prone. Instead, kept internal loop variables
  1-based (matching Fortran) and converted only at the API boundary: `var KTOP =
  ktop + 1`. Used helper functions `get2d`/`set2d`/`idx2d` for all 2D array
  access with 1-based row/col indices.
- **Integer division for negative numbers**: Fortran integer division truncates
  toward zero (like JS `|0`). Expressions like `(KTOP-KRCOL)/2+1` where
  `KTOP-KRCOL` can be negative must use `((a)/b+c)|0` not `Math.floor`. The
  `|0` operator in JS matches Fortran truncation semantics.
- **Shift shuffle bug**: The shift shuffle check `SI(I) .NE. -SI(I+1)` was
  initially mistranslated as checking `SR(I)` instead of `SI(I)`. Fixed.
- **Workspace sizing matters**: The U matrix must be sized KDU x KDU (not N x N)
  with stride KDU, and WH must be (2*NSHFTS) x NH, WV must be NV x (2*NSHFTS).
  Using N x N for all workspaces produced incorrect results for the KACC22=1/2
  accumulated update paths due to stride mismatches.

## Dependency interface surprises

- **dlarfg takes alpha as array+offset**: Not a scalar. Returns tau via a
  separate array+offset. This is documented in dependency-conventions but easy
  to forget. Required scratch arrays `alphaArr[1]` and `tauArr[1]`.
- **dlaset uses `'upper'`/`'lower'` strings**: Not `'U'`/`'L'`. The `'ALL'`
  case from Fortran falls through to the else branch (full matrix set).
- **dgemm uses `'no-transpose'`/`'transpose'`**: Not `'N'`/`'T'`. Fortran's
  `'C'` (conjugate transpose) maps to `'transpose'` for real matrices since
  `nota = (transa === 'no-transpose')`.
- **dlacpy uses `'upper'`/`'lower'`/`'ALL'`**: Same convention as dlaset.
  `'ALL'` falls through to else branch.

## Automation opportunities

- The `get2d`/`set2d`/`idx2d` helper pattern for keeping internal variables
  1-based while accessing 0-based arrays worked well but is verbose. Could
  be a transform pass that converts Fortran array(i,j) syntax directly to
  `A[oA + (i-1)*sA1 + (j-1)*sA2]` expressions.
- Workspace sizing for dgemm/dlacpy calls requires careful tracking of leading
  dimensions. An automated workspace calculator from the Fortran WORK queries
  would reduce manual errors.

## Coverage gaps

- **Collapsed bulge re-introduction (lines ~449-480)**: Requires H(K+3,K),
  H(K+3,K+1), H(K+3,K+2) to all be zero simultaneously, which triggers when
  a bulge underflows. Very hard to construct test inputs that produce this.
- **BMP22 at K===KTOP-1 (lines ~306-313)**: The 2-by-2 bottom bulge being the
  very first one introduced (phantom column case) requires specific KBOT-KTOP
  relationships that are hard to trigger with small test matrices.
- **Convergence test detail branches**: Some sub-branches (k >= KTOP+3,
  k <= KBOT-4) require larger matrices to exercise all conditions.
- Final coverage: 84.56% line, 86.57% branch on base.js.

## Complex number handling

- N/A: dlaqr5 is a real (double precision) routine. No complex arithmetic.
