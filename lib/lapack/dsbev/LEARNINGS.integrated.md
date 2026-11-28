# dsbev: Translation Learnings

## Translation pitfalls

- N=1 upper band: the diagonal element is at `AB(KD+1, 1)` (Fortran) which
  maps to `AB[offsetAB + kd * strideAB1]` in JS, not `AB[offsetAB]`. For
  lower band, N=1 reads from `AB(1,1)` = `AB[offsetAB]`.
- dlascl band types: Fortran `'B'` = lower-band, `'Q'` = upper-band. These
  are easy to confuse since the letter mnemonics are not intuitive.
- dsbtrd vect parameter mapping: DSBEV passes Fortran JOBZ='V' which maps
  to `'initialize'` in JS dsbtrd (not `'update'`). This initializes Q to
  identity before reduction.
- dsteqr compz parameter: after dsbtrd produces Q in Z, dsteqr is called
  with `'update'` (not `'initialize'`), since Z already contains the
  orthogonal transformation matrix.

## Dependency interface surprises

- dlansb takes the band half-bandwidth `K` (= KD), not the full bandwidth.
  Its signature is `dlansb(norm, uplo, N, K, AB, sAB1, sAB2, oAB, WORK, sW, oW)`.
- WORK array partitioning: DSBEV uses WORK for both the off-diagonal `e`
  (at offset 0) and scratch space for dsbtrd/dsteqr (at offset N). The same
  WORK array is passed to both dsbtrd and dsteqr with different offset segments.
- Fortran deps file needed `la_constants` and `la_xisnan` modules for
  compilation because dlassq.f90 uses Fortran modules.

## Automation opportunities

- The pattern of scaffolding an eigenvalue driver (scaling + reduction +
  tridiagonal solver + unscaling) is shared by dsyev, dsbev, and dspev.
  A template could generate the driver given the norm routine, reduction
  routine, and band/full/packed storage type.

## Coverage gaps

- All major code paths are covered: upper/lower, KD=0/1/2/3, N=0/1/4/5/6,
  JOBZ=no-vectors/compute-vectors.
- Scaling paths (near underflow and near overflow) are tested with
  synthetically scaled matrices.
- The Fortran test generates reference eigenvalues and eigenvectors from
  LAPACK's own DSBEV implementation, and the JS tests verify both exact
  eigenvalue match and structural properties (orthogonality, eigendecomposition).

## Complex number handling

- N/A: dsbev is a real-valued routine.
