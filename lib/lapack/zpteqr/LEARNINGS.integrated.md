# zpteqr: Translation Learnings

## Translation pitfalls

- The Fortran test uses `COMPLEX*16 Z(LDZ, MAXN)` with LDZ=MAXN=6, but when
  N < LDZ there are padding rows. Printing `Z_r(1:2*N*N)` reads across column
  boundaries and picks up uninitialized memory. Fixed by extracting the NxN
  block into a separate `ZTMP` array before printing.

## Dependency interface surprises

- zbdsqr expects Complex128Array for VT, U, C even when ncvt=nru=ncc=0 (the
  arrays are not referenced but must exist). dpteqr's dbdsqr counterpart uses
  plain Float64Array dummy arrays.
- zlaset takes Complex128 scalars for alpha/beta, not plain numbers. Must
  construct `new Complex128(0.0, 0.0)` and `new Complex128(1.0, 0.0)`.
- WORK remains a Float64Array (real workspace for zbdsqr's RWORK parameter),
  not Complex128Array.

## Automation opportunities

- The `gen_test.py` scaffold is too minimal for complex routines -- it generates
  TODO stubs without any awareness of Complex128Array. Test writing for z*
  routines remains mostly manual.

## Coverage gaps

- dpttrf failure path (line 129-130): requires a non-positive-definite input
  matrix which contradicts the SPD assumption.
- zbdsqr failure path (line 161-162): requires convergence failure in the
  bidiagonal SVD, very hard to trigger with well-conditioned matrices.
- Both are standard LAPACK error returns and the logic (early return / info
  offset) is trivially correct by inspection.

## Complex number handling

- Z is Complex128Array throughout. All strides/offsets for Z are in complex
  elements. The N=1 special case uses `reinterpret()` to set Z[offsetZ] to
  (1.0, 0.0) via the underlying Float64Array view.
- The routine itself does no complex arithmetic -- it delegates to zlaset (for
  identity init) and zbdsqr (for SVD). D and E remain real Float64Arrays.
- In tests, `assertUnitary` computes Z^H * Z using reinterpreted views with
  manual conjugate-transpose multiplication.
