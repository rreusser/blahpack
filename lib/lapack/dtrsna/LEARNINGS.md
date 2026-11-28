# dtrsna: Translation Learnings

## Translation pitfalls

- `M` and `INFO` are both outputs and are not positional parameters.
  The JS port returns `{ info, m }`. `mm` is still taken as an input
  (caller-declared capacity of `S`/`SEP`) for signature parity.
- `SELECT` is a LOGICAL array in Fortran; in JS it is a `Uint8Array`
  where `0`/`1` encode false/true. Truthiness is used directly when
  reading, so numeric `0` correctly skips entries.
- The `ks` counter is 1-based throughout the routine (matching
  Fortran). When indexing into `S`, `SEP`, `VL`, `VR` we always
  translate as `( ks - 1 )`.
- When `pair` is true, the paired eigenvalue occupies columns
  `ks` and `ks+1` (1-based), and at the end of the loop `ks` is
  incremented one extra time to account for the pair.

## Dependency interface surprises

- `dtrexc` takes a dummy `Q` array when `compq = 'none'`; the caller
  only needs to pass a valid (length-1) Float64Array with trivial
  strides. We pass a module-level `dummy` scratch buffer.
- `dlacn2` is a reverse-communication routine: on each iteration it
  sets `KASE[0]`, and the caller performs a matrix-vector product and
  calls it again until `KASE[0] === 0`. The caller must preserve
  `ISAVE` (length 3), `EST` (length 1), and `KASE` (length 1) between
  calls — we allocate these as small typed arrays inside dtrsna.
- `WORK` is a 2-D workspace of shape `(ldwork, n+6)`. The Fortran code
  addresses columns `N+1, N+2, N+4, N+6` (1-based) which correspond
  to JS column indices `N, N+1, N+3, N+5`. Offsets are computed by
  `offsetWORK + col * strideWORK2`.
- `dlaqtr(ltran, lreal, N, T, ..., b, ..., w, x, ..., work, ...)`
  returns `{ info, scale }` — the JS port places `scale` on the
  returned object instead of as an in/out scalar parameter (the same
  convention as `dlaln2`).

## Numerical gotchas

- For diagonal T with identity VL/VR, `S = 1` and `SEP = |t_ii - t_jj|`
  for the smallest gap. Test 5 (`n3_triangular_job_B`) demonstrates
  that once VL and VR diverge (because T is non-diagonal), `S` can
  drop below 1 — this is expected and reflects the angle between the
  left and right eigenvector subspaces.
