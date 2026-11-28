# zhpevx: Translation Learnings

## Translation pitfalls

- zhpevx required translating two new dependency modules (zhptrd and zupgtr)
  that did not exist yet, despite the task description stating all deps exist.
- In zhptrd, the TAU array is used as workspace by zhpmv (overwriting the
  zlarfg output). The Fortran saves TAUI as a local scalar and writes it
  back after the workspace operations. Missing this restore step caused
  incorrect TAU values in early iterations.
- For N=1 in zlarfg, if alpha has a nonzero imaginary part, tau is NOT zero.
  This is unlike the real case where dlarfg(1, ...) always gives tau=0.

## Dependency interface surprises

- zhpmv, zaxpy, zhpr2 all take Complex128 scalars (not raw re/im pairs).
  zdotc returns a Complex128 object. Need to extract real/imag for
  arithmetic then reconstruct Complex128 for passing to sub-routines.
- zstein outputs complex eigenvectors (Complex128Array) even though the
  underlying tridiagonal eigenvalue problem is real. The imaginary parts
  are zero but the array type is complex.
- zsteqr uses 'update' (not 'compute-vectors') when Z has been initialized
  with the unitary transformation matrix.

## Automation opportunities

- The Fortran deps files need many transitive dependencies that deps.py
  misses (la_constants, la_xisnan, dlaruv, dlaev2, dlasr, etc.).
  An automated tool to compute the full transitive closure would help.

## Coverage gaps

- The value-range test (V,V,L) returned M=0 for the chosen interval [2.5, 5.5]
  because no eigenvalues fell in that range. Added a separate upper-triangle
  value-range test (N,V,U) with [0, 4] that finds 2 eigenvalues.
- Scaling paths (iscale=1) not covered by the 4x4 test matrix since its
  norm is moderate.

## Complex number handling

- AP, Z, WORK, TAU are Complex128Array with complex-element strides.
- W, RWORK are Float64Array with real strides.
- Used reinterpret() only for the N=1 quick return to read AP's real part
  and set Z to (1+0i). The main algorithm delegates all complex arithmetic
  to sub-routines (zhptrd, zupgtr, zupmtr, zstein, zsteqr, zswap, zdscal).
