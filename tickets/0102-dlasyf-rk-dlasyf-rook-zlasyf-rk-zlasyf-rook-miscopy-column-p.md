---
id: 0102
title: dlasyf_rk, dlasyf_rook, zlasyf_rk, zlasyf_rook miscopy column P on a 2x2 rook pivot with P != K
status: resolved
area: base
opened: 2026-11-26
resolved: 2026-11-26
---

## Problem

When rook pivoting picks a 2x2 pivot with P != K, the blocked panel kernels copy the non-updated column K into column P with the wrong extent, so `A(p,p)` is left stale and the factorization is wrong:
- upper: the JS copies `p` elements of column k into column p where the reference's `DCOPY( P, A(1,K), 1, A(1,P), 1 )` copies P = p+1 (0-based p), missing the diagonal;
- lower: the JS sets `A(p,p) = A(k,k)`, then copies `N - p` elements from row p, which overwrites it with the stale `A(p,k)`. The reference's two copies end with `A(P,P) = A(K,K)`.

dsytrf_rk, dsytrf_rook, zsytrf_rk and zsytrf_rook give wrong factorizations on their blocked path (N > 32 with WORK ≥ 2N) whenever pivoting is heavy: a normwise solve residual near 1e-2 at N ≥ 40.

How it was permitted: the blocked fixtures (33x33, 50x50) are diagonally dominant, so rook pivoting never takes a 2x2 pivot with P != K; the kernels have no fixture of their own on a matrix that needs heavy pivoting; and the property harness doesn't sweep these drivers past the blocking threshold.

## Evidence

- `lib/lapack/base/dlasyf_rk/lib/base.js:196` (upper) and `:413-415` (lower); upper also in `lib/lapack/base/dlasyf_rook/lib/base.js:187`, `lib/lapack/base/zlasyf_rk/lib/base.js:196`, `lib/lapack/base/zlasyf_rook/lib/base.js:214`. zlahef_rk and zlahef_rook are not affected.
- Repro: N = 70, `a_ij = sin((i+1)(j+1) + i + j)` symmetrized; one `dlasyf_rk( uplo, 70, 32, … )` differs from gfortran's by O(1) in A for both uplo. Correcting the extents made A match the reference to 1e-10 and the dsytrf_rk + dsytrs_3 residual about 1e-16.
- Found while making the drivers adapt to their workspace (ticket 0100). Those tests add ±6 to the diagonal to stay out of this branch until it is fixed.

## Reproduce

```bash
grep -nE "[dz]copy\( p, A, (sa1|strideA1), offsetA \+ \( k \*" lib/lapack/base/[dz]lasyf_r*/lib/base.js
```

## Resolution

Fixed the column-K-to-column-P copy extents in the upper branch of dlasyf_rk, dlasyf_rook, zlasyf_rk and zlasyf_rook (p + 1 elements, as the reference's DCOPY( P, ... )), and rewrote dlasyf_rk's lower branch to match the reference (DCOPY( P-K, ... ), DCOPY( N-P+1, ... ), DSWAP( K, ... )). Each kernel has a 40x40, NB = 32 heavy-pivoting fixture for both uplo, which fails on the old code. The ticket 0100 driver tests no longer shift the diagonal, and they pass. See test/harness/LEARNINGS.md (2026-11-26).
