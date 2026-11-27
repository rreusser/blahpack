# zggsvp3: Translation Learnings

## Householder sign conventions are NOT bit-stable across implementations

Even though `zgerq2`, `zgeqp3`, `zlarfg` all pass their own individual
fixture-based tests bit-exactly, composing them inside `zggsvp3` produces
R-factors that differ from reference LAPACK by individual-entry sign flips
in rank-deficient or near-rank-deficient cases.

Root cause: inside `zgeqp3`, the subvector passed to `zlarfg` after the
first Householder reflector is applied is *supposed* to be exactly zero
(a trailing column has had its below-diagonal zeroed). Whether it ends up
exactly zero vs. a tiny floating-point residue (~1e-18) depends on the
order of the multiply-accumulate operations in `zlarf`. When it is exactly
zero, `zlarfg` returns `tau=0` and leaves `alpha` unchanged; when it is
~1e-18, `zlarfg` takes the general-case branch, flips the sign of the
diagonal entry, and returns `tau=2`. Both are mathematically valid
Householder factorizations, but the resulting R-factors (and downstream Q,
U, V updates) differ by visible sign flips that cascade through the rest
of the routine.

This is not a bug that can be fixed in `zgeqp3` without making the
implementation bit-identical to reference BLAS at the FMA level.

**Test strategy:** Rather than bit-exact fixture comparison, the test
suite verifies the *mathematical invariants* that `zggsvp3` guarantees:
- `U` is unitary (`U^H * U = I`)
- `V` is unitary
- `Q` is unitary
- `U * A_result * Q^H == A_orig` (reconstruction)
- `V * B_result * Q^H == B_orig`
- `info`, `K`, `L` match the fixture exactly.

These invariants are insensitive to Householder sign freedom and catch
real bugs (wrong permutation, wrong transformation, dimension mistakes).

The real-valued `dggsvp3` does not hit this because `dgeqp3` happens to
produce exactly the same FP rounding pattern as reference `DGEQP3` on the
test inputs used.

## String flag convention

`jobu`, `jobv`, `jobq` take one of two values each:
- `'compute-U'` / `'compute-V'` / `'compute-Q'` (compute the respective unitary factor)
- `'none'` (skip)

The distinct long-form strings avoid ambiguity about which factor is
being requested in error messages and call sites. `dggsvp3` follows the
same convention.

## Workspace parameters

`zggsvp3` exposes more workspace arrays than `dggsvp3`:
- `RWORK` (real workspace, length >= 2*N) for `zgeqp3` column-norm tracking.
- `TAU` (complex workspace) for reflectors.
- `WORK` (complex workspace) for blocked operations; `lwork` selects block size.

The scaffold `bin/signature.py` generates parameter lists that include
all of these explicitly in the ndarray signature (43 params total), so
the `stdlib/signature-conformance` rule prints an informational warning
comparing against the shorter Fortran signature — this is expected.
