# dsbtrd: Translation Learnings

## Translation pitfalls

- Band storage indexing: Fortran AB(row, col) with LDAB must map to
  `AB[offsetAB + (row-1)*strideAB1 + (col-1)*strideAB2]` in JS. The LDAB
  passed to the Fortran routine must match the declared first dimension of the
  Fortran array, or the column stride will be wrong. This caused incorrect
  fixture data on the first attempt with the Fortran test.
- INCA = KD1 * LDAB becomes `kd1 * strideAB2` (not `kd1 * strideAB1`), since
  INCA moves across KD1 columns in the band matrix.
- INCX = LDAB - 1 becomes `strideAB2 - strideAB1`, used for diagonal-like
  traversal in the band matrix.
- The routine temporarily overwrites D and WORK arrays with cosine/sine
  values during the reduction loop, then extracts the actual tridiagonal
  elements from AB at the end. This means D and WORK must have length N.

## Dependency interface surprises

- dlartg returns results via an output array `out[0]=c, out[1]=s, out[2]=r`
  rather than modifying scalar arguments. A module-level `rot` scratch array
  (`Float64Array(3)`) is used to avoid repeated allocation.
- drot (BLAS) takes scalar c/s values directly, not array references.
- dlargv, dlartv, and dlar2v all take array-based c/s vectors with strides,
  reusing D and WORK as the storage for cosine/sine vectors.

## Automation opportunities

- The `no-mixed-operators` lint rule requires parenthesizing `a + (b * c)`
  in all array index expressions. A codemod to wrap `expr * expr` operands
  in parentheses when combined with `+` would save significant manual effort.

## Coverage gaps

- All major code paths are covered: upper/lower, KD=0/1/2/3, N=0/1/small,
  VECT=none/initialize/update.
- The `dlartv` path (NR >= 2*KD-1) is exercised by KD=3 N=6 tests.
- The `drot` path (small NR) is exercised by KD=2 N=4/5 tests.

## Complex number handling

- N/A: dsbtrd is a real-valued routine.
