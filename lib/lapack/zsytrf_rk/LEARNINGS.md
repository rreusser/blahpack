# zsytrf_rk: Translation Learnings

## Translation pitfalls

- **Pure mechanical port from `dsytrf_rk`.** The structure is identical;
  the only changes are: replace `Float64Array` with `Complex128Array`
  for `A`/`e`/`W`, swap `dswap` → `zswap`, swap `dsytf2_rk` →
  `zsytf2_rk`, swap `dlasyf_rk` → `zlasyf_rk`. No conjugation logic is
  needed because the matrix is *symmetric*, not Hermitian (per the
  SKILL.md "Hermitian vs. Symmetric" table). For `_rk`-family
  symmetric routines specifically, off-diagonal mirror reads use
  `A[k,i]` directly with no conjugation, and the diagonal carries a
  full complex value (no real-only forcing).
- **Stride convention matches the d-prefix exactly.** Both `zlasyf_rk`
  and `zsytf2_rk` use complex-element strides for their A/e/W
  parameters. `zswap` also takes complex-element strides. Therefore
  `zsytrf_rk` operates entirely in complex-element units and does not
  call `reinterpret()` itself — it is a pure delegating driver. The
  gate's `complex.reinterpret` warning is a false positive for this
  routine.
- **IPIV negative encoding survives intact.** The `_rk` driver inherits
  the bitwise-NOT 2x2 encoding from the panel/leaf kernels: `IPIV[k] >= 0`
  is a 1x1 pivot (target row = `IPIV[k]`), `IPIV[k] < 0` is a 2x2 pivot
  block (target row = `~IPIV[k]`). The lower-case panel-local-to-global
  IPIV adjustment uses `~( ( ~IPIV[i] ) + ( k - 1 ) )` for negative
  entries (NOT `~IPIV[i] + (k-1)`, which would corrupt the encoding).
  Cribbed verbatim from `dsytrf_rk`.

## Dependency interface surprises

- `zlasyf_rk` returns `{ kb, info }` (object); `zsytf2_rk` returns a
  plain `info` integer. Mixing these up is an easy bug — always match
  the kernel's actual return shape.
- `zswap` is required via the base.js path (`./../../../../blas/base/zswap/lib/base.js`)
  to skip wrapper validation, same pattern as `dsytrf_rk` uses for `dswap`.

## Coverage gaps

- The `N === 0` quick return in `base.js` (lines 82-83) is unreachable
  via `ndarray.js` because the wrapper short-circuits N=0 first. Final
  base.js coverage: 98.97% line / 90.91% branch (both above gate
  threshold of 90/85).

## Test design notes

- Used distinctly sized fixed Fortran arrays (`A4`, `A5`, `A2`, `A1`,
  `A33`, `A50`) so that `LDA == N` for every test case — this avoids
  the EQUIVALENCE/leading-dimension stride mismatch trap documented
  in SKILL.md.
- Complex test inputs use deterministic transcendental fills with a
  diagonal boost (real part `50 + 0.1*j` or `33 + 0.05*j`, small
  imaginary parts) for the blocked tests at N=33 and N=50. This
  exercises the `zlasyf_rk` path (NB=32) without inducing tied
  pivot norms that would diverge between Fortran and JS.
- Tolerances: 1e-13 for small N, 1e-11 for N>=33 (rounding accumulates
  through `zgemm`-based panel updates, especially for complex).

## Process improvements

- The mechanical port pattern (d-prefix → z-prefix RK driver) is
  repetitive enough that a future "z-port" agent template could
  generate the base.js + wrapper diff automatically from the
  d-prefix module + a tiny dependency mapping table. Worth keeping
  in mind if zhetrf_rk lands next (Hermitian variant — same
  structure plus conjugation tweaks).
