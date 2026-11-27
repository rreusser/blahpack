# zlacrm: Translation Learnings

## Algorithm summary

zlacrm computes `C = A * B` where `A` (M×N) and `C` (M×N) are complex and
`B` (N×N) is real. It exploits real B by extracting Re(A) and Im(A) into a
real workspace, calling DGEMM twice, and reassembling C. RWORK has length
`2*M*N`: the first `M*N` reals hold the extracted half (Re or Im) of A;
the second `M*N` reals receive the DGEMM output. The Fortran source treats
RWORK as a packed contiguous M×N column-major buffer regardless of the
LDA used by the caller for A.

## Translation pitfalls

- The Fortran scratch layout is independent of A's leading dimension —
  RWORK is always packed M×N column-major. We pass `1, M` as the strides
  for both the input and output halves of RWORK to DGEMM.
- DGEMM dependency calling convention is `dgemm.ndarray(transA, transB,
  M, N, K, alpha, A, sa1, sa2, oA, B, sb1, sb2, oB, beta, C, sc1, sc2,
  oC)`; the wrapper exposes `.ndarray` which is what the base routine
  uses (no row-major flag needed).
- The scaffolded `zlacrm.js` wrapper had `LDB < max(1,M)` for
  column-major, which is wrong: B is N-by-N, so LDB must be `>= max(1,N)`
  for both layouts.
- `RWORK` is documented as a strided real array in the ndarray API
  (`strideRWORK`, `offsetRWORK`), but the base routine assumes the M*N
  scratch is contiguous because DGEMM is invoked with stride 1 on the
  first dimension. The contract is that callers pass `strideRWORK = 1`
  with the desired offset; `offsetRWORK * strideRWORK` is the absolute
  starting index used internally.

## Complex number handling

- Used `reinterpret-complex128` once at function entry to obtain Float64
  views (`Av`, `Cv`) and multiplied complex strides by 2 for direct
  Float64 indexing. Real/imag extraction is `Av[ia + i*sa1]` and
  `Av[ia + i*sa1 + 1]` respectively.
- Output assembly writes the real parts in the first DGEMM pass, then
  overwrites only the imaginary lanes (`+ 1`) in the second pass,
  preserving the previously written real parts.

## Fortran test

- Each test case is wrapped in its own `subroutine` with array
  dimensions matching the case exactly (e.g. `A(m, n)` not `A(NMAX,
  NMAX)`). This avoids the leading-dimension/EQUIVALENCE stride mismatch
  trap noted in the SKILL.
- `dgemm` does NOT need to be listed in `deps_zlacrm.txt`; the
  `run_fortran.sh` script already links the entire BLAS source dir.
  Adding `dgemm` (or `lsame`/`xerbla`) to the deps file produces a link
  error from duplicate symbols.
