# dtrsen: Translation Learnings

## Translation pitfalls

- `dtrexc` uses **1-based** ifst/ilst indices, not 0-based. The Fortran loop variable K runs 1..N, so `KK=K` is 1-based. In JS, the loop runs 0..N-1, so `kk = k+1` for the dtrexc call.
- `dtrexc` returns an object `{ info, ifst, ilst }`, not a scalar. Must extract `.info`.
- The SELECT array is boolean-like in JS (Uint8Array with 0/1 values). Truthy comparison works: `!!SELECT[i]`.
- `dlacn2` uses a reverse-communication interface with KASE and ISAVE state arrays. The KASE array must be Int32Array, and ISAVE must be Int32Array of length 3.

## Dependency interface surprises

- `dlange` norm strings: `'one-norm'` not `'1'`, `'frobenius'` not `'F'`. Using single chars returns 0 silently.
- `dtrexc` returns object not integer -- the dlaexc bug (k off-by-one) caused NaN when swapping N1=2,N2=1 blocks. Fixed separately.
- `dlacn2` signature: `(N, v, strideV, offsetV, x, strideX, offsetX, ISGN, strideISGN, offsetISGN, EST, KASE, ISAVE, strideISAVE, offsetISAVE)` -- note ISGN is Int32Array, EST and KASE are typed arrays for output.

## Missing automation

- N/A

## Coverage gaps

- The reordering of 2x2 blocks past 1x1 blocks was initially broken due to a bug in dlaexc (k index off by one). Now fixed.
- SEP computation via dlacn2 reverse communication loop is covered.
- JOB='B' (both S and SEP) covered.
- Complex pair selection test had to use a matrix where the pair is already in leading position to avoid the dlaexc swap path.

## Complex number handling

- N/A (real routine)
