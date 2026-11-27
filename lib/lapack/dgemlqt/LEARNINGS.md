# dgemlqt: Translation Learnings

## Translation pitfalls

- **Block iteration direction differs from dgemqrt.** Even though the high-level
  SIDE x TRANS dispatch shape mirrors dgemqrt, the forward/backward iteration
  pairing is **swapped**:
  - dgemqrt: forward iter for `(left, transpose)` and `(right, no-transpose)`.
  - dgemlqt: forward iter for `(left, no-transpose)` and `(right, transpose)`.
  Doing a blind copy-paste from dgemqrt's `if/else if` branches and only
  changing `'columnwise'` -> `'rowwise'` would silently apply Q in the wrong
  block order and produce wrong results that round-trip-test still cancels
  (Q^T*Q*C = C is symmetric). Reading the Fortran's four explicit branches and
  matching them branch-by-branch is the only safe approach.

- **Per-block trans flag passed to dlarfb is the OPPOSITE of the user's trans.**
  Because the LQ reflectors form `Q = H(K)*...*H(1)` (right-to-left), applying
  block 0 first under rowwise storage requires `dlarfb` to use trans `'T'`
  (transpose) when the user asked for trans `'N'` (no-transpose), and vice
  versa. The Fortran source makes this explicit; preserving it literally is
  required.

- **`storev='rowwise'` exercises a previously cold path in dlarfb.** Coverage
  on dlarfb jumped from 30% to 47% by translating dgemlqt — this routine is
  the first heavy user of the row-wise reflector storage branches. If a future
  agent debugs an LQ-family failure, suspect the rowwise branches in dlarfb
  before suspecting dgemlqt.

- **V shape interpretation.** In LQ, the K reflectors live in the **rows** of
  the factored matrix. So `dgelqt(K, Q, mb, A, ...)` produces V with K rows
  and Q columns (column-major: LDV = K, not Q). The wrapper `dgemlqt.js`
  must validate `LDV >= max(1,K)` for column-major layout (NOT `max(1,M)`
  the way the QR analog uses LDV >= max(1,M)). Scaffold's auto-generated
  validators got this wrong and had to be rewritten by hand against the
  Fortran spec.

- **Building Fortran fixtures requires factoring K-by-Q matrices, not Q-by-K.**
  For SIDE='L' tests, Q has order M_C, so we factor a K-by-M_C matrix with
  `dgelqt(K, M_C, mb, ...)`. For SIDE='R', factor K-by-N_C. This is the dual
  of the QR setup (which factors M_C-by-K). Right-side tests need a separate
  factorization with the right Q size — reusing the left-side V/T won't
  validate `(side='right')` correctly.

## Dependency interface surprises

- **Fortran deps file needs dgelqt + dgelqt3 + their transitive deps.** `deps.py`
  doesn't infer the test-side dependencies (the routine that *generates* the V/T
  inputs). Modeled the deps_dgemlqt.txt after deps_dgemqrt.txt with the LQ
  family substituted: dgeqrt -> dgelqt, dgeqrt2/3 -> dgelqt3 (no dgelqt2 in
  reference), plus the same BLAS/LAPACK leaves and ILAENV chain.

- **dlarfb's WORK is logically 2D.** As documented in
  docs/dependency-conventions.md, dlarfb expects WORK with separate
  first/second-dim strides. dgemlqt mirrors dgemqrt's pattern: treat the
  caller's 1D WORK buffer as `ldwork`-by-`mb` with stride1=strideWORK and
  stride2=ldwork*strideWORK; if the caller's buffer is too small, allocate
  internally with stride1=1, stride2=ldwork.

## Coverage gaps

- base.js hits 100% line / 94.29% branch — well above target. The remaining
  uncovered branches are auto-allocate fallbacks for paths where WORK happens
  to already be sized correctly.

- dgemlqt.js wrapper has 72.92% line coverage because most LD-validator
  branches aren't exercised by the ndarray.js-routed tests. Adding a
  test.dgemlqt.js LD-validator suite would close this, but the routine is
  primarily consumed via the ndarray API and the wrapper logic mirrors
  dgemqrt's already-validated wrapper.
