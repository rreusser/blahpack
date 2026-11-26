---
id: 0105
title: dstevr, dsyevr and zheevr replace the reference's DSTEMR/ZSTEMR (MRRR) eigenvector path, which is not translated
status: open
area: translation
opened: 2026-11-26
---

## Problem

The reference's DSTEVR, DSYEVR and ZHEEVR compute eigenvectors with DSTEMR/ZSTEMR (the MRRR algorithm) whenever all eigenvalues are wanted (RANGE = 'A', or 'I' with IL = 1 and IU = N) and IEEEOK = 1. DSTEMR and ZSTEMR are not translated, so the JS uses DSTEBZ + DSTEIN on that path too. The eigenvectors are valid but different from the reference's, and ISUPPZ, which DSTEMR fills, is not filled the reference's way.

How it is permitted: nothing records that a module's base.js replaces a reference call with a different algorithm. The JS comment is the only record, and the routines' tests check properties, which both algorithms satisfy.

## Evidence

- `lib/lapack/base/dstevr/lib/base.js` (comment at the eigenvector path); dsyevr and zheevr the same. `grep -c stemr` finds nothing in their base.js, and no `lib/lapack/base/[dz]stemr` exists.
- Found while migrating dstevr to ilaenv (ticket 0049).

## Reproduce

```bash
grep -l "CALL [DZ]STEMR" data/lapack-3.12.0/SRC/[dz]*.f; ls -d lib/lapack/base/[dz]stemr
```
