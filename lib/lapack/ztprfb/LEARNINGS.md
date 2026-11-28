# ztprfb: Translation Learnings

## Translation pitfalls

- The reference LAPACK ZTPRFB has an inconsistency in the ROW/FORWARD/LEFT
  branch: the first `ZTRMM` call passes `LDB` as the leading dimension of
  `WORK` instead of `LDWORK`:

  ```fortran
  CALL ZTRMM( 'L', 'L', 'N', 'N', L, N, ONE, V( 1, MP ), LDV,
 $               WORK, LDB )
  ```

  This is harmless in practice only when callers pass `LDWORK == LDB`.
  Our JS implementation uses the correct `strideWORK1/2` for `WORK`, so
  to match Fortran fixtures, the Fortran test for this branch must be
  invoked with `LDWORK == LDB` (we use `LDWORK=5`, matching `LDB=5`).
  All other branches use `LDWORK` consistently.

- Eight full (SIDE, DIRECT, STOREV) branches — implement every one
  explicitly. Each branch has its own V sub-block offsets (MP, KP, NP)
  so there is no obvious way to collapse the cases without obscuring
  the mapping to the reference.

## Dependency interface surprises

- Uses `zgemm` and `ztrmm` from the stride-based base implementations.
  For the COL/FORWARD/LEFT path and siblings, stride/offset arithmetic
  is `offsetV + (mp-1)*strideV1` etc. — the 1-based `MP`/`KP`/`NP`
  values are preserved from the reference rather than renamed, which
  makes line-by-line auditing against the Fortran straightforward.

## Complex number handling

- Only element copy / add / subtract is performed on the raw Float64
  reinterpretation; all nontrivial arithmetic is delegated to `zgemm`
  and `ztrmm`. No inline complex multiply, divide, or abs — and
  `NEGONE = Complex128(-1, 0)` is hoisted to the module level.
