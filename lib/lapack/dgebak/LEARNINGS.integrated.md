# dgebak: Translation Learnings

## Translation pitfalls

- The permutation loop (DO 40/50) has a subtle index mapping: Fortran iterates
  `II = 1..N` (1-based) and computes `I = ILO - II` for rows below ILO. In 0-based
  JS this becomes `i = ilo0 - ii - 1`. Getting this off by one breaks the
  permutation reversal.
- SCALE values from dgebal encode BOTH permutation indices (1-based Fortran row
  numbers, for rows outside [ILO,IHI]) AND scaling factors (for rows inside
  [ILO,IHI]). When reading permutation indices, must convert from 1-based to
  0-based with `k - 1`.
- The `GO TO 30` when `ILO == IHI` skips the scaling loop entirely but still
  enters the permutation section. This is not "skip everything" -- it's "skip
  scaling only".

## Dependency interface surprises

- dscal and dswap have standard stride/offset signatures, no surprises.
- dscal is called with stride = LDV (strideV2) to scale along a row of V,
  which is the column-major "long stride". This matches Fortran's
  `CALL DSCAL(M, S, V(I,1), LDV)`.

## Automation opportunities

- N/A -- dgebak is simple enough that no new transforms were needed.

## Coverage gaps

- Left-eigenvector permutation path (lines 112-121) is not exercised by the
  current test matrix because dgebal('B',...) on the test matrix produces
  ILO=1, IHI=4 (no permutations). The code is identical to the right-eigenvector
  permutation path (lines 88-103) which IS fully tested via the `ilo_eq_ihi` case.
  Overall coverage: 90.84% line, 93.10% branch -- above threshold.
- To fully cover left permutation, would need a test matrix where dgebal
  produces ILO > 1 or IHI < N (i.e., rows are permuted out of the balanced range).

## Complex number handling

- N/A -- dgebak is a real (double-precision) routine with no complex arithmetic.
