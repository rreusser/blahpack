# zlaqhb: Translation Learnings

## Translation pitfalls

- The key difference from zlaqsb is the Hermitian diagonal treatment: Fortran
  uses `DBLE(AB(KD+1, J))` to extract the real part before scaling with `CJ*CJ`.
  In the Float64 view, the real part is already at `ABv[ia]` so `*= cj*cj` works
  directly, but the imaginary part `ABv[ia+1]` must be explicitly zeroed.
- In the upper branch, the off-diagonal loop runs `i < j` (not `i <= j`) because
  the diagonal is handled separately. In zlaqsb, the loop includes the diagonal.

## Dependency interface surprises

- No dependencies beyond dlamch (threshold computation). Same as zlaqsb.

## Automation opportunities

- zlaqhb and zlaqsb share 95% of their structure. A template-based generator
  could produce both from a single spec, parameterized by "symmetric" vs
  "Hermitian" diagonal handling.

## Coverage gaps

- All Fortran code paths are covered by fixtures: upper/lower with KD=1 and KD=2,
  no-equilibration, N=0 quick return, N=1, extreme amax values.
- Diagonal imaginary parts are nonzero in input to verify DBLE() zeroing behavior.

## Complex number handling

- Diagonal entries: `DBLE(AB(...))` in Fortran maps to reading `ABv[ia]` (real
  part from the interleaved Float64 view) and setting `ABv[ia+1] = 0.0` (zero
  the imaginary part). This preserves the Hermitian property that diagonal
  elements are real after equilibration.
- Off-diagonal entries: standard complex scaling via both real and imaginary
  components, identical to zlaqsb.
