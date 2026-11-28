# dorbdb3: Translation Learnings

## Translation pitfalls

- **Reference-Fortran DROT-stride bug.** Line 282 of LAPACK 3.12.0
  `dorbdb3.f` calls `DROT(Q-I+1, X11(I-1,I), LDX11, X21(I,I), LDX11, C, S)`
  — note that **`LDX11` is used as the row stride for both X11 and X21**.
  Algorithmically this should be `LDX21` for the X21 argument; using
  `LDX11` only happens to work when `LDX11 == LDX21`, which is the case
  in every reasonable caller (e.g. `dorcsd2by1` allocates a single
  contiguous M-by-Q buffer with `LD = max(P, M-P)` and slices both blocks
  out of it). The JS translation mirrors the Fortran exactly so test
  fixtures match the reference; the divergence is documented as an
  inline TODO at the call site, and a `conformance.config.json` exemption for
  `scaffolding.no-todo-base` records the reason. Compare dorbdb1 line 121:
  it correctly uses `LDX21` for the X21 stride. Future translators of
  similar routines should diff sister routines for "obvious" stride
  copy-paste bugs before assuming the reference is canonical.
- **THETA / TAUQ1 / PHI lengths are not what the doc says.** The Fortran
  documentation declares `THETA(Q)`, `TAUQ1(Q)`, and `PHI(Q-1)`, but
  dorbdb3 only writes the first `M-P` entries of THETA and TAUQ1 and the
  first `M-P-1` entries of PHI. (The `M-P+1..Q` columns of X11 are
  reduced to identity in the second loop, which only writes
  `TAUP1[M-P..Q-1]`.) Tests must compare only the populated prefix —
  using `subarray(0, M-P)` for THETA/TAUQ1 and `subarray(0, M-P-1)` for
  PHI. Allocating these buffers at length `Q` and zeroing them between
  Fortran test cases (the dorbdb1 zero_outputs trick) makes the unused
  tail compare cleanly.
- **Two-loop structure with a wholly different second loop.** Unlike
  dorbdb1 (which has a single loop with an inner `i < Q-1` branch),
  dorbdb3 has two top-level loops:
  - `i = 0..M-P-1`: full bidiagonalization step (Q1 reflector → P1, P2
    reflectors → re-orthogonalization).
  - `i = M-P..Q-1`: P1-only reduction of the bottom-right of X11
    (no X21 work, no THETA, no TAUQ1, no PHI).
  Test cases must exercise both loops. Designing fixtures so that
  `Q > M-P` triggers the second loop, and a second fixture with
  `Q == M-P` skips it.
- **Fortran's `LWORK >= M-Q` doc-bound is wrong for our test.** The
  routine internally computes `LWORKOPT = max(P+1, M-P, Q+1)`, which
  exceeds `M-Q` for our small test cases (e.g. M=8,P=5,Q=4 needs LWORK
  ≥ 6 but `M-Q = 4`). Initial Fortran fixture run errored on parameter
  14 because we used `lwork = m - q`. Fix: pass `lwork = NMAX*NMAX` (or
  any large value) in the Fortran tests. The JS does not have an LWORK
  parameter (we removed it), but the documented `WORK` length must
  match what the body actually needs: `max(P, M-P-1, Q-1)`.

## Test design pitfalls

- **Q=0 quick-return needs P=M.** The constraint check
  `Q < M-P || M-Q < M-P` rejects `Q=0` unless `M = P` (so `M-P = 0`).
  My initial Q=0 test used `M=2, P=1, Q=0` and was rejected by Fortran
  with "parameter number 3 had an illegal value". Fixed to `M=2, P=2,
  Q=0`. Same trap will hit dorbdb2/4 quick-return tests.
- **Don't regenerate orthonormal inputs in JS.** Like dorbdb1, dorbdb3's
  inputs come from a two-pass Modified Gram-Schmidt over deterministic
  sin-based seed data. The MGS round-off accumulates differently
  between gfortran and V8 (despite identical inputs and operations),
  so the JS test loads `X11in`/`X21in` from the fixture rather than
  reconstructing them. This is the dorbdb1 pattern carried over.

## Dependency interface surprises

- All dependencies (dlarf, dlarfgp, dorbdb5, dnrm2, drot) had
  already-documented conventions matching dorbdb1's calls. Only
  surprise was the DROT stride bug above.

## Coverage notes

- 100% line + 100% branch on `base.js`, `dorbdb3.js`, and `ndarray.js`.
  The two loops, both `i > 0` rotation branches (i=0 vs i>=1), the
  inner `i < M-P-1` PHI/TAUP2 branch, and the Q=0 quick-return are
  all exercised by the five fixture cases (`basic_8x5x4`, `m10_p6_q5`,
  `q_eq_mmp`, `mp_eq_1`, `q0_quick_return`).

## Process improvements

- **Audit the Fortran reference for stride copy-paste bugs.** Before
  blindly mirroring, diff the sister routines (dorbdb1/2/3/4 share
  similar calls). If a stride looks "off", document explicitly whether
  you are reproducing the Fortran behavior or correcting it. The
  `conformance.config.json` exemption pattern (with a mandatory `reason`) is
  the right place to record reproductions.
- **Scaffold's `dorbdb3.js` had the same defects as dorbdb1's** —
  undefined `N` variable in LD validation, wrong LD bound for
  rectangular matrices. The scaffold's LD validator template is
  brittle for non-square matrices (P-by-Q here); it picks `M`/`N` by
  guessing. Always rewrite the LD checks against the Fortran spec by
  hand. (Same lesson as dorbdb1 — the scaffold has not been improved.)
- **`deps.py` missed `la_constants`, `la_xisnan`, `dnrm2`, `dscal`,
  `drot`, `dgemv`, `dger`** in the generated deps file (15 deps
  generated, 22 needed). I copied these from dorbdb1's deps file. The
  scaffold should learn that any routine in the dorbdb family needs
  these BLAS leaves and the la_* modules.
