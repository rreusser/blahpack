# zlaqhe: Translation Learnings

## Translation pitfalls

- Key difference from dlaqsy: the diagonal must be forced real after scaling. Fortran does `A(J,J) = CJ*CJ*DBLE(A(J,J))` which takes only the real part. In JS: set `Av[re] = cj*cj*Av[re]; Av[re+1] = 0.0;` to zero out the imaginary part.
- Off-diagonal elements are complex: both real and imaginary parts must be multiplied by `S(i)*S(j)`.

## Dependency interface surprises

- dlamch uses `'safe-minimum'` and `'epsilon'` as string identifiers (not the Fortran short forms).

## Automation opportunities

- zlaqhe/dlaqsy share the same structure. A template with a "force diagonal real" flag could generate both.

## Coverage gaps

- 100% line and branch coverage with 5 tests (upper equil, lower equil, no equil needed, n=0, n=1).

## Complex number handling

- Uses `reinterpret(A, 0)` for Float64 view. All arithmetic is real-scalar * complex-element, which is safe to inline (just multiply both parts by the scalar).
- Diagonal forced real by zeroing imaginary part after scaling.
