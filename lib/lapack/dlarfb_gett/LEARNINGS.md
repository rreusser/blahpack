# dlarfb_gett: Translation Learnings

## Translation pitfalls

- `dlarfb_gett` takes no SIDE/TRANS parameter. It always applies `H` from
  the left and the operation is implicit. The only control parameter is
  `IDENT`, which toggles whether `V1` (the strict lower triangle of the
  leading `K`-by-`K` block of `A`) is read or treated as the identity.
- The quick-return guard is `M < 0 || N <= 0 || K === 0 || K > N`. Note
  that `N === 0` is a quick return (Fortran uses `N.LE.0`), and `M` may
  legitimately be `0` but not negative.
- The `N > K` branch computes the update for the rectangular `A(1:K,K+1:N)`
  block first, then always updates the leading `K`-by-`K` triangular block
  of `A` and the `M`-by-`K` `V2` columns of `B` afterwards. Both must be
  implemented unconditionally for a complete translation.
- Two separate loops over the `K`-by-`K` block of `A`: the strictly lower
  triangle is overwritten with `-WORK(i,j)` only when `lnotident` (so the
  `V1` storage area is cleared), while the upper triangle is always
  updated by `A := A - WORK`.
- When `ident === 'identity'`, the Fortran flag is `'I'` (matched with
  `LSAME`). The JS convention uses the long-form strings `'identity'` and
  `'not-identity'` per the rule against single-char flags.

## Dependency interface surprises

- `dcopy`, `dgemm`, and `dtrmm` are required directly via
  `.../lib/base.js` (the ndarray base) because the package-level
  `require('@stdlib/blas/base/dtrmm')` resolution is not available in the
  monorepo-style layout used here. Other LAPACK routines in this repo use
  the same pattern.
- `dtrmm` is called with `side='right'` and `alpha=-1.0` to compute
  `B1 := -B1 * WORK` in place. No separate negation loop is needed.

## Testing notes

- The Fortran reference test constructs `(K+M)`-by-`N` pentagonal layouts
  with small well-conditioned `T`, `V1`, and `V2` values. Because the
  routine takes no `SIDE`/`TRANS` control flags, the test matrix is the
  Cartesian product of `{ident, not-ident}` x `{N>K, N=K, K=1}` plus
  quick-return cases for `M=0`, `K=0`, `K>N`, `N=0`.
- `ident='identity'` allows the strict lower triangle of `A(1:K,1:K)` to
  hold arbitrary data — make sure the test seeds those entries distinctly
  in the two variants to confirm they are not accidentally read.
