# dorgrq: Translation Learnings

## Translation pitfalls

- **Forward block iteration (RQ) vs reverse (LQ).** dorglq processes blocks
  in reverse (`DO I=KI+1, 1, -NB`), but dorgrq goes forward (`DO I=K-KK+1, K, NB`).
  Both build Q from K reflectors, but the reflector index ordering differs:
  `Q = H(K)...H(2)H(1)` for LQ vs `Q = H(1)H(2)...H(K)` for RQ.
- **Reflector storage row offset.** dorgrq's i-th reflector lives in row
  `M-K+i` (0-based: `M-K+i-1`), NOT row `i-1`. The local variable `II = M-K+I`
  is essential — every `A(II, ...)` reference uses this offset. Forgetting
  this offset means accessing the wrong row of A.
- **Initial zero block placement is mirrored.** dorglq zeros
  `A(KK+1:M, 1:KK)` (bottom-left), dorgrq zeros `A(1:M-KK, N-KK+1:N)`
  (top-right). The zero block fills in for parts of the identity matrix
  that DORGR2 doesn't reach in the panel.
- **dlarfb call uses `'backward'`/`'rowwise'`** (not `'forward'`/`'rowwise'`
  like dorglq) — these are load-bearing differences. The H matrix in DLARFB
  must be applied with the correct direction matching the elementary reflector
  storage convention.
- **K < min(M,N) usage of `DGERQF` then `DORGRQ` is INCONSISTENT.**
  DGERQF stores reflector i in row `i` (since k=min(M,N)), but DORGRQ
  with smaller K expects reflector i in row `M-K+i`. Calling
  `DGERQF(M, N); DORGRQ(M, N, K)` with `K < min(M,N)` does NOT produce
  an orthogonal matrix. To test the K<M code path with orthogonality,
  generate K reflectors via `DGERQF(K, N)` on a smaller matrix and copy
  them into the LAST K rows of the M×N target before calling DORGRQ.
- **NX hardcoded to 0** (matching dorglq, not LAPACK's ILAENV(3) default
  of 128). This makes blocked code trigger whenever `NB < K`, which is
  more aggressive than reference LAPACK but still correct (blocked vs
  unblocked produce mathematically equivalent Q).

## Dependency interface surprises

- **dlarfb's WORK is 2D.** Pass `(WORK, 1, ldwork, offsetWORK)` for the T
  matrix and `(WORK, 1, ldwork, offsetWORK + ib)` for the C-side scratch.
  The `+ ib` advances by ib rows in the column-major LDWORK×NB layout.
- **dlarft signature has WORK as 2D** with stride1=1, stride2=ldwork —
  required for the triangular factor T to fit in column-major storage.

## Process / automation notes

- The scaffolded `lib/<routine>.js` had `lwork` parameter from
  signature.py (which inferred it from the Fortran signature). Had to
  manually drop it since JS routines don't expose LWORK — workspace
  is allocated by callers per project convention. Sister routine
  dorglq similarly drops LWORK.
- `gen_test.py` writes its scaffold to `test/test.js`, which clobbers
  the export-check scaffold. Had to manually move generated content
  to `test/test.ndarray.js` and restore the export-check `test.js`.
  This is a recurring scaffold/gen-test mismatch.
- The scaffolded benchmark and example files needed full license
  headers and reordering of var declarations (longest first). The
  scaffold's vars-init-on-decl style fails `stdlib/vars-order` when
  variable names are short (N, A) and grow longer (TAU, WORK).

## Coverage gaps

- base.js `M <= 0` early return is unreachable through the ndarray
  wrapper (which short-circuits on `M === 0` earlier). Added a direct
  `test.base.js` to cover this branch and bring base.js to 100%.
