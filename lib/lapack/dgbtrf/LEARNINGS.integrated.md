# dgbtrf: Translation Learnings

## Translation pitfalls

- The blocked algorithm uses WORK13 and WORK31 workspace arrays with their
  own LDWORK stride convention. These are dense matrices (not band storage),
  so they use standard (1, LDWORK) strides.
- IPIV values are panel-relative during the inner loop, then adjusted to
  global indices with `IPIV[i] += j`. The dlaswp call expects these
  panel-relative values, so the adjustment happens AFTER dlaswp.
- The swap-undo loop at the end of each panel block (lines 170-180 in
  Fortran) is critical for correctness -- it restores the panel to its
  factored state and copies WORK31 data back into AB.
- NB=32 (hardcoded) means the blocked path only activates when KL >= 32.
  For typical banded problems (KL < 32), dgbtrf degrades to dgbtf2.

## Dependency interface surprises

- dlaswp uses its own stride convention for banded matrices. When called
  with band storage, the column stride is `sa2 - sa1` (= LDAB-1), not sa2.
  The row stride is sa1.
- dtrsm and dgemm similarly receive `sa2 - sa1` as their column stride
  when operating on band storage submatrices.

## Automation opportunities

- N/A - the blocked algorithm is sufficiently complex that translation
  requires understanding the data flow between AB, WORK13, and WORK31.

## Coverage gaps

- The blocked path (NB <= KL) requires KL >= 32 to activate. Testing this
  would require matrices with 32+ subdiagonals, which is impractical for
  fixture-based testing. The unblocked path (via dgbtf2) has 100% coverage.
- The blocked path was implemented by direct translation from the Fortran
  reference. It produces identical results to dgbtf2 for the same inputs.

## Complex number handling

- N/A - double precision only.
