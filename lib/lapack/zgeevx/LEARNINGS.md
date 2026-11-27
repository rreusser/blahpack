# zgeevx: Translation Learnings

## Translation pitfalls

- zgeevx's Fortran signature has INOUT/OUT scalars ILO, IHI, ABNRM. The
  scaffold-generated JS signature passes them as input parameters; they
  are ignored on input and returned in a result object
  `{info, ilo, ihi, abnrm}`. This is consistent with how zgebal
  returns ilo/ihi.

- SENSE != 'none' (reciprocal condition number computation) calls
  ztrsna with job in {'eigenvalues', 'eigenvectors', 'both'} and
  howmny='all'. The Fortran mappings are: sense 'E' → 'eigenvalues',
  'V' → 'eigenvectors', 'B' → 'both'. When !wntsnn and no eigenvectors
  are requested, zhseqr must still be run in 'schur' mode so that T is
  available for ztrsna; the eigenvalues-only path chooses its hseqr job
  accordingly. After unscaling the eigenvalues, RCONDV is rescaled by
  dlascl(cscale → anrm) when (sense='V' or 'B') and icond=0.

- ZTRSNA takes a complex N-by-(N+1) workspace. In zgeevx we allocate
  it in the tail of WORK starting at offset iwrk=N (after the N-length
  tau from zgehrd). The total workspace requirement for sense != 'none'
  is therefore N*N + 2*N complex entries; the N=0 quick-return path
  needs only 1.

- Different Schur forms from zhseqr vs the Fortran reference (valid but
  not bitwise identical when there is any trailing reduction work) cause
  RCONDV from ztrsna to differ by several percent, even though eigenvalues
  and RCONDE agree. The JS test uses an upper-triangular input for the
  exact-match fixture (Schur form = A), and checks only finiteness/sign
  for the general case.

- For N=1 the Fortran reference still computes ABNRM via ZLANGE('1'),
  which equals |a(1,1)|. Using `|re|+|im|` is wrong; use `Math.hypot`.

- After balancing, the Fortran computes ABNRM from the balanced matrix
  and, if SCALEA, rescales it back to the original scale using DLASCL
  on a 1-element vector. The JS version uses a scratch 1-entry
  Float64Array plus dlascl.

## Dependency interface surprises

- `zlange` uses the string `'one-norm'` (not `'one'` or `'1'`) for the
  1-norm selector. `'max'` works as expected for the max-element norm.

- `zgebal` and `zgebak` both accept the same balanc strings
  (`'none'`, `'permute'`, `'scale'`, `'both'`) as zgeevx, so the
  parameter can be passed straight through.

- `zhseqr` takes separate job strings: `'schur'`/`'eigenvalues'` and
  `'update'`/`'none'` for compz. For zgeevx eigenvalues-only with
  `sense === 'none'` (wntsnn), we use `'eigenvalues'` mode.

## Complex number handling

- The N=1 ABNRM uses `Math.hypot(re, im)` to match Fortran's
  `ZLANGE('1', 1, 1, A, ...)` which equals `ABS(A(1,1))`.

- Eigenvector normalization follows the same pattern as zgeev:
  compute `|v_k|^2` in RWORK, find IDAMAX, then scale the column by
  `conj(v_k) / |v_k|` so that the k-th component becomes purely real.
  The largest component's imaginary part is then forced to zero to
  kill any residual from roundoff.
