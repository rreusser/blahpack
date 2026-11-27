# zlanhf: Translation Learnings

## Translation pitfalls

- The RFP format creates 8 distinct layout cases (noe x ifm x ilu), each with different LDA and element mapping. Each norm type implements all 8 cases separately, making this one of the largest routines at ~1300 lines of JS.
- Fortran `GO TO 10` in the one-norm odd/normal/upper case needed translation to a `break` statement.
- The `i` variable is used both as a loop counter and as a running index that gets incremented outside the loop in the one-norm section. Care needed to track this correctly.

## Dependency interface surprises

- `zlassq` returns `{scl, sumsq}` (not `{scale, sumsq}`), which differs from the Fortran `SCALE, S` output parameters.
- `zlassq` takes offset in complex elements, so need to pass `offsetA + (fortran_linear_index)` directly.

## Automation opportunities

- The 8-case structure for noe/ifm/ilu is identical between `dlansf` (real symmetric) and `zlanhf` (complex Hermitian). A code generator that takes the real/complex flag could produce both.
- ZTRTTF-based test generation is reusable for any RFP routine.

## Coverage gaps

- All 8 layout cases tested for N=2,3,4,5 (even and odd) with all 4 norm types.
- Edge cases N=0 and N=1 covered.

## Complex number handling

- Diagonal elements: Hermitian matrix diagonal is real, so only `Math.abs(Av[realPartIndex])` is used (Fortran: `ABS(DBLE(A(...)))`).
- Off-diagonal elements: Full complex modulus via `sqrt(re^2 + im^2)` (Fortran: `ABS(A(...))`).
- Frobenius norm diagonal accumulation: Uses scaled sum-of-squares with `addDiag()` helper, which takes the real diagonal value and updates (scale, sumsq) pair.
- `reinterpret(A, 0)` gives the Float64Array view; all indexing done as `oA + idx*sA` where sA = strideA*2 and oA = offsetA*2.
