---
id: 0121
title: Committed Fortran fixtures do not regenerate identically: dtgexc signs, a dlarrf uninitialized read, 1e-16 drift
status: open
area: tests
opened: 2026-11-27
---

## Problem

Regenerating a committed fixture with `test/run_fortran.sh` on the current Linux toolchain does not always reproduce it. A fixture that does not regenerate cannot be trusted as the reference, and an uninitialized read makes the test program's output depend on memory contents.

## Evidence

Found while triaging value mutants (ticket 0110), 2026-11-27:

- **dtgexc:** two cases differ in sign.
  Regenerating test/fixtures/dtgexc.jsonl with `test/run_fortran.sh lapack dtgexc` on Linux x86-64 gfortran gives Q and Z with two columns of the opposite sign (and A and B correspondingly) in these two cases. Every other case agrees to 2e-15. The JS output matches the Linux regeneration, and a direct DTGEX2 call sequence reproduces it, so the committed lines came from a platform whose rounding picks the other sign (probably macOS/arm64 with FMA contraction). The ticket-0110 tests compare magnitudes for these two cases. Decide whether to regenerate fixtures on one canonical platform, or to flag sign-ambiguous cases in the fixture.
- **dlarrf:** recompiling `test/fortran/test_dlarrf.f90` changed the last digit of the existing case `tridiag_5x5_subset_cluster`, so the test program reads something uninitialized. The original line was kept.
- **dgsvj0, zgsvj0:** regenerating the five original lines differs by about 1e-16, presumably a different compiler build than the one that produced them.

## Reproduce

```bash
bash test/run_fortran.sh lapack dlarrf && git diff --stat test/fixtures/dlarrf.jsonl
```

## Direction

Initialize every array the test programs print; record the compiler and flags with each fixture file; regenerate in CI and compare.
