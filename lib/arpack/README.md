# lib/arpack

JavaScript translations of [ARPACK](https://github.com/opencollab/arpack-ng)
(implicitly restarted Arnoldi/Lanczos for large-scale eigenproblems), a
distinct reference package from BLAS/LAPACK. Kept in its own provenance slot
per [docs/optimization-policy.md](../../docs/optimization-policy.md): directory
structure tracks which upstream package a routine derives from.

- **Upstream**: arpack-ng 3.9.1, vendored at `data/arpack-ng-3.9.1/`.
- **License**: BSD-3-Clause, Copyright (c) 1996-2008 Rice University (Sorensen,
  Lehoucq, Yang, Maschhoff). Derived modules carry the Rice notice in their
  headers; see `LICENSE.txt` and `data/arpack-ng-3.9.1/COPYING`.
- **Layout**: `lib/arpack/base/<routine>/lib/{base,ndarray,main,index}.js`,
  mirroring `lib/lapack/base/`. ARPACK routines call BLAS/LAPACK leaves already
  present under `lib/blas/base/` and `lib/lapack/base/`.
- **Plan**: [docs/arpack-translation.md](../../docs/arpack-translation.md) —
  the symmetric shift-invert closure, the reverse-communication state-object
  pattern, and translation order.
