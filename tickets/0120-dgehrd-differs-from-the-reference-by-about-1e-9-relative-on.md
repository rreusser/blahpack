---
id: 0120
title: dgehrd differs from the reference by about 1e-9 relative on a graded 8x8 matrix
status: open
area: accuracy
opened: 2026-11-27
---

## Problem

On a graded 8×8 matrix, the JS dgehrd differs from the reference DGEHRD by about 1e-9 relative, far above rounding. The difference carries through to dgeevx's eigenvalues, one eigenvector's sign, and a condition number.

## Evidence

- **Input:** A(i,j) = (LCG seed 1 in [-0.5, 0.5), filled column-major) × 4^(i-j), with N = 8, ILO = 1, IHI = 8.
- **Size of the difference:** the maximum relative difference from the reference (gfortran -O2 and -O0 agree with each other) is 1.24e-9. It occurs at H index 55: -0.7514763607842765 in the JS against -0.7514763617159963 in the reference.
- **Where it comes from:** the JS dhseqr, run on the reference's H, matches the reference bit for bit. So the difference is in dgehrd, dgehd2, dlarfg or dlarf; dnrm2 is a candidate.
- **Effect in dgeevx:**
  - BALANC = 'none' or 'permute': WR(1) = -1.08968004955314 against the reference's -1.0896800497009274;
  - BALANC = 'scale' or 'both': one eigenvector column has the opposite sign;
  - SENSE = 'right-vectors' with no vectors: RCONDV(1) = 0.2009 against 0.5816.
- These cases (n8, typ 2, unscaled) were left out of dgeevx's ticket-0110 battery.

## Reproduce

```bash
# Build the input above, then compare lib/lapack/base/dgehrd/lib/base.js
# with the reference DGEHRD built through test/run_fortran.sh (see test/fortran/test_dgehrd.f90).
ls test/fortran/test_dgehrd.f90 lib/lapack/base/dgehrd/lib/base.js
```

## Direction

Bisect the reduction step by step: compare dgehd2's reflectors (dlarfg) and their norms (dnrm2) with the reference's.
