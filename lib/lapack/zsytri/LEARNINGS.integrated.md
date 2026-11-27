# zsytri: Translation Learnings

## Translation pitfalls

- zswap/zcopy/zdotu/zsymv all take complex-element strides and offsets, but internally we compute Float64 strides (sa1=strideA1*2, sa2=strideA2*2) for indexing into the reinterpreted Av array. Mixing these up in zswap offset calculations caused out-of-bounds reads (NaN) and swapped wrong elements. The fix: always pass strideA1/strideA2 (complex) to subroutine calls, and use sa1/sa2 (float64) only for direct Av[] indexing.

## Dependency interface surprises

- zsymv (complex symmetric matvec) lives under lapack/base, not blas/base. This differs from dsymv which is in blas/base.
- zdotu returns a Complex128 object, so must use real() and imag() to extract parts for subtraction into Av[].

## Automation opportunities

- The zswap stride/offset mismatch pattern (sa1 vs strideA1) is a recurring bug risk. A lint rule checking that zswap/zcopy/zdotu/zsymv calls never use sa1/sa2 variables (Float64) for their offset arguments would catch this automatically.

## Coverage gaps

- All Fortran test cases pass, covering both uplo='upper' and uplo='lower', 1x1 and 2x2 pivot blocks, singular matrices, and pivot interchanges. No known coverage gaps.

## Complex number handling

- Key difference from dsytri (real): diagonal elements are fully complex, 2x2 block inversion uses complex division throughout, and the dot product update subtracts both real and imaginary parts (not just real as in Hermitian zhetri).
- Key difference from zhetri (Hermitian): no conjugation anywhere -- uses zdotu instead of zdotc, zsymv instead of zhemv, and the pivot swap section does plain swaps without conjugation.
- Complex division uses Smith's formula via module-level cdivTo/cdivInPlace helpers to avoid object allocation in the inner loops.
