# dlaqp2: Translation Learnings

## Translation pitfalls

- Straightforward real-valued translation from Fortran. No index off-by-ones since the zlaqp2 complex version was already done and served as a close reference.
- JPVT is 0-based in base.js (Fortran is 1-based). Fortran fixtures output 1-based JPVT, so tests must subtract 1 when comparing.
- The `print_matrix` Fortran helper outputs a logical M-by-N submatrix in column-major order, but the Fortran test allocates with LDA=6. Must be careful to use the actual LDA in the JS test setup.

## Dependency interface surprises

- `dlarf` base.js expects lowercase `'left'`/`'right'` for the side parameter, NOT uppercase `'Left'`/`'Right'` or single-char `'L'`/`'R'`. This contradicts the CLAUDE.md convention stating "use single chars matching Fortran." Passing `'Left'` caused dlarf to take the right-apply branch, producing NaNs. This is a critical gotcha.
- `dlarf` takes `tau` as a scalar value (not array+offset like dlarfg does).
- `dlarfg` takes alpha as `(array, offsetAlpha)` and tau as `(array, offsetTau)`.

## Automation opportunities

- The dlarf side-parameter case convention should be documented somewhere central. Every routine calling dlarf needs to know this.

## Coverage gaps

- Lines 163-165 (offpi >= M-1 branch in norm update, setting VN1/VN2 to zero) not covered. Would need a test where the last factored row exactly equals M-1 and remaining norms degrade. The offset_collinear_last_row test from zlaqp2 might work but was not ported here since it requires complex-specific setup. Coverage still 98.31% line / 91.67% branch.

## Complex number handling

- N/A: dlaqp2 is a real (double precision) routine. No complex arithmetic involved.
