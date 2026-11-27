# zlatdf: Translation Learnings

## Translation pitfalls

- Reference Fortran ZLATDF has MAXDIM=2, causing buffer overflows for N>2 in the IJOB=2 path (RWORK(2) is too small for ZGECON which needs RWORK(2*N)). The Fortran fixtures for N>2 IJOB=2 cases are incorrect due to stack corruption. Had to write manual Fortran tests with properly-sized workspace to generate correct fixtures.
- ZLASWP JS convention for reverse direction (incx=-1) requires k1 > k2, whereas Fortran always uses k1 < k2 regardless of incx direction. Found by checking how zgesc2 calls zlaswp.
- Complex division for CONE/Z(I,I) was inlined as conj(z)/|z|^2 rather than using cmplx.div, since the divisor is a single diagonal element (not overflow-prone).

## Dependency interface surprises

- zlaswp takes Complex128Array with complex-element strides/offsets. When passing a vector as a 1-column matrix, strideA1=strideRHS and strideA2 is irrelevant.
- zdotc returns Complex128, so extracting the real part requires `real(zdotc(...))`.
- zscal and zaxpy take Complex128 scalar parameters (not separate re/im).

## Automation opportunities

- N/A. The init_routine.py scaffold and lint-fix.sh pipeline handled most mechanical steps.

## Coverage gaps

- The `dR === ZERO` branch (line ~163 of base.js) requires a zero nullvector from zgecon, which is unreachable in practice. Accepted as uncovered.
- Branch coverage is 80% due to this one unreachable branch.

## Complex number handling

- ZDOTC(N, XM, 1, XM, 1) is always real and non-negative (sum of |x_i|^2), so SQRT is just real Math.sqrt. The generic complex sqrt code was simplified away.
- Complex multiplication for Z(I,K)*TEMP and WORK(I)*TEMP was inlined with comments showing the math.
- Complex absolute value uses cmplx.absAt for overflow safety.
- The IJOB!=2 path inlines all complex arithmetic (add, sub, mul, conj) since there are no divisions or absolute values in hot loops except cmplx.absAt.
