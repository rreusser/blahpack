# dposv: Translation Learnings

## Translation pitfalls

- [x] dposv is structurally identical to dgesv: factorize (dpotrf), then solve (dpotrs) if factorization succeeds. The only difference is using Cholesky instead of LU.
- [x] Unlike dgesv, dposv has no pivot array (IPIV). The factorization is always in-place with no row interchanges, simplifying the interface.

## Dependency interface surprises

- [x] dpotrf and dpotrs both take the same uplo parameter, so it passes through directly. No parameter mapping needed.

## Automation opportunities

- [x] N/A. dposv is a two-line driver: call dpotrf, then conditionally call dpotrs. The pattern is identical to dgesv and could theoretically be templated, but the routines are too simple to warrant it.

## Coverage gaps

- [x] 100% line and branch coverage achieved. The not-positive-definite test exercises the early return path (info > 0 from dpotrf). Both upper and lower paths tested, along with N=0, NRHS=0 quick returns.

## Complex number handling

- [x] N/A. Real-valued only. The complex equivalent (zposv) would use conjugate transpose internally.
