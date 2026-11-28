# zhegst: Translation Learnings

## Translation pitfalls

- Direct mirror of dsygst with complex routine substitutions. The blocked path (NB=64) is never exercised for N=3 test matrices, so it falls through to zhegs2. Integration-level testing through zhegv verifies correctness.
- Key substitution from dsygst: 'transpose' -> 'conjugate-transpose' in ZTRSM/ZTRMM calls.
- ZHER2K beta parameter is real (1.0), not complex, unlike ZHEMM which uses complex alpha/beta.
- ZHEMM alpha/beta are Complex128: NEGHALF=(-0.5,0), HALF=(0.5,0), CONE=(1,0).

## Dependency interface surprises

- zhemm requires Complex128 for both alpha and beta. This differs from zher2k where beta is a plain number. Must create module-level Complex128 constants.
- ztrsm/ztrmm require Complex128 for alpha parameter (CONE).

## Automation opportunities

- The dsygst-to-zhegst conversion is purely mechanical: swap real BLAS/LAPACK calls for complex ones, change 'transpose'->'conjugate-transpose', wrap real scalars in Complex128. Same pattern as dsygs2->zhegs2.

## Coverage gaps

- Blocked code paths (N >= NB=64) not tested directly. Would need large matrices in fixtures. The blocked paths are structurally identical to dsygst's blocked paths (which are tested) with only the subroutine names changed.

## Complex number handling

- No direct complex arithmetic in zhegst; all complex operations are delegated to BLAS calls (zhemm, zher2k, ztrsm, ztrmm) and to zhegs2.
- Module-level Complex128 constants (CONE, NEGCONE, HALF, NEGHALF) avoid per-call heap allocation.
