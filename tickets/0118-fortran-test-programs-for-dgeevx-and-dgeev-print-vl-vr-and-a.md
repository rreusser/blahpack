---
id: 0118
title: Fortran test programs for dgeevx and dgeev print VL, VR and A with LDA = N from an NMAX-leading array
status: open
area: tests
opened: 2026-11-27
---

## Problem

`test/fortran/test_dgeevx.f90` and `test/fortran/test_dgeev.f90` call `print_matrix( 'vl', VL, N, N, NMAX )`. The signature is `print_matrix( name, mat, lda, m, n )`, so the call prints an N×NMAX block read with leading dimension N from an array declared (NMAX, NMAX). The `vl`, `vr` and `a_input` fields of `test/fixtures/dgeevx.jsonl` (its first 11 lines) and of `dgeev.jsonl` are therefore not the reference's vectors.

## Evidence

- dgeevx's tests never read these fields. Ticket 0110 added a separate battery whose fields are printed contiguously.
- Regenerating `dgeevx.jsonl` on Linux changes these lines from line 4 on.
- **Found by:** the ticket-0110 triage of dgeevx, 2026-11-27.

## Reproduce

```bash
grep -n "print_matrix" test/fortran/test_dgeevx.f90 test/fortran/test_dgeev.f90 | head
```

## Direction

Change the calls to `print_matrix( name, M, NMAX, N, N )`, regenerate, and compare the JS output with these fields.
