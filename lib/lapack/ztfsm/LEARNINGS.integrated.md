# ztfsm: Translation Learnings

## RFP dispatch pattern

ztfsm is a pure dispatch routine that decomposes a complex triangular matrix in
RFP format into sub-blocks, then calls `ztrsm` and `zgemm`. It performs no
arithmetic of its own beyond the alpha=0 case (zeroing B via reinterpret).

## Translation pitfalls

- The deep branching tree (SIDE x parity x TRANSR x UPLO x TRANS) yields ~32
  unique call sequences. Each must be independently verified against the Fortran
  reference. A systematic Fortran test covering all 32 combos is essential.
- Fortran's `A(offset)` with `LDA` becomes `oA + sa * offset` for the offset
  and `sa * LDA` for strideA2 in JS. Getting the leading dimension right for
  each sub-block is the main source of errors.
- The M=1 special case (SIDE=L, M odd, TRANSR=N, UPLO=L) uses a single ztrsm
  call instead of the three-call decomposition. Both notrans and conjugate-
  transpose paths have this special case.

## Dependency interface surprises

- ztrsm and zgemm base functions use 2D stride conventions (strideA1, strideA2,
  offsetA). When passing RFP sub-blocks as 2D matrix arguments, the "LDA" from
  Fortran becomes strideA2 = sa * LDA.
- zgemm takes alpha and beta as Complex128 objects, while ztrsm takes only alpha.

## Automation opportunities

- The Fortran test uses allocatable arrays for B to ensure LDB=M (tightly
  packed), avoiding the LDB=10 stride mismatch that occurs with static arrays.
- The print_b helper extracts the M x N submatrix column-by-column to produce
  correct flat JSONL output regardless of LDB.

## Coverage gaps

- All 32 TRANSR/UPLO/TRANS dispatch branches covered for both M-odd and M-even
  (SIDE=L) and N-odd and N-even (SIDE=R).
- Unit diagonal and non-trivial alpha cases also covered.
- The Fortran `ZTRTTF` is needed to create test inputs but is not a runtime
  dependency.

## Complex number handling

- No inline complex arithmetic. Alpha comparison uses `real(alpha) === 0.0 &&
  imag(alpha) === 0.0`. The alpha=0 zeroing uses `reinterpret` to write raw
  Float64 values.
- NCONE = -1+0i is used as the alpha argument to zgemm for the subtraction step.
