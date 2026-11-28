# zhpev: Translation Learnings

## Translation pitfalls

- zhpev has two workspace arrays: WORK (Complex128Array) for TAU and scratch, RWORK (Float64Array) for E (off-diagonal) and scratch. Fortran uses WORK for complex data and RWORK for real data. The JS signature has 19 params (3 extra for RWORK stride/offset) vs the expected 13-param convention.
- N=1 case: eigenvalue is the real part of AP[0] (diagonal of Hermitian matrix is always real). Z is set to (1,0).

## Dependency interface surprises

- zhptrd outputs D (diagonal, real) into w and E (off-diagonal, real) into RWORK, but TAU (complex) into WORK. The RWORK and WORK partitions must be kept separate.
- zsteqr expects 'update' (not 'V') for COMPZ when eigenvectors are pre-loaded in Z.
- zlanhp's WORK parameter is Float64Array (real), even though the matrix is complex.

## Automation opportunities

- The Fortran test needed EQUIVALENCE blocks for printing complex arrays as interleaved doubles. This is mechanical and could be automated.

## Coverage gaps

- No test for the scaling path (anrm < rmin or anrm > rmax). Would need extremely large/small matrix entries.
- No test for convergence failure (info > 0 from dsterf/zsteqr).

## Complex number handling

- AP is Complex128Array; accessed via reinterpret() only in the N=1 special case. All heavy lifting is delegated to zhptrd, zupgtr, zsteqr, zdscal.
- eigenvalues (w) and off-diagonal (e) are real Float64Array despite the complex input.
