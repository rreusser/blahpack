# dlaqps: Translation Learnings

## Translation pitfalls

- The Fortran `DGEMV('No transpose', N-K, K, -ONE, F(K+1,1), LDF, A(RK,1), LDA, ONE, A(RK,K+1), LDA)` call updates the current row of A. The x-vector here is `A(RK, 1:K)` traversed with stride LDA (column stride), not the usual row stride. Translated as `dgemv('no-transpose', N-k-1, k+1, -1, F, sf1, sf2, offsetF+(k+1)*sf1, A, sa2, offsetA+rk*sa1, 1, A, sa2, offsetA+rk*sa1+(k+1)*sa2)`.
- KB is removed from the parameter list and returned as a scalar (matching zlaqps pattern), not passed as an array-offset output parameter.
- TOL3Z (sqrt of machine epsilon) is hoisted to module scope as a constant since it never changes.
- Fortran TAU array retains stale values beyond KB from previous calls; tests must only compare TAU[0:kb-1] against fixtures.

## Dependency interface surprises

- `dlarfg` takes alpha as `(array, offsetAlpha)` -- no stride parameter. The alpha value is both input and output (overwritten with beta).
- `dgemv` x-vector stride parameter: when traversing a row of a column-major matrix, the stride is the column stride (LDA), not 1.
- `idamax` returns 0-based index in JS (unlike Fortran's 1-based).

## Automation opportunities

- Real-valued dlaqps is a straightforward simplification of zlaqps (remove reinterpret, remove conjugation, replace complex scalars with real ones). Could be automated as a "strip complex" transform.

## Coverage gaps

- The `rk >= M-1` branch of dlarfg (single-element reflector, lines 154-160) is not covered. This requires the matrix to have exactly one row remaining at pivot time (M - offset - k = 1 in the loop), which is an unusual edge case. Coverage is 97.53% line / 94.12% branch.

## Complex number handling

- N/A: this is a real (double precision) routine. No complex arithmetic needed.
