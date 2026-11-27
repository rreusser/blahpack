# zlaqsp: Translation Learnings

## Translation pitfalls

- Same packed storage indexing as dlaqsp: upper column j starts at jc (accumulates jc += j+1), lower column j starts at jc (accumulates jc += N-j). 0-based in JS vs 1-based in Fortran.
- The Fortran EQUED output parameter becomes a JS return value (string 'none'/'yes' instead of character 'N'/'Y').
- Complex elements require reinterpret to Float64 view with doubled strides/offsets for element access.

## Dependency interface surprises

- No BLAS/LAPACK dependencies. Only dlamch for computing SMALL/LARGE thresholds, which are module-level constants.

## Automation opportunities

- The dlaqsp (real) to zlaqsp (complex) transformation is mechanical: add reinterpret, double strides/offsets for the Float64 view, and scale both real and imaginary parts by the same real scalar.

## Coverage gaps

- All branches covered: upper/lower, equilibrate/no-equilibrate, N=0, N=1, and larger 4x4 cases. Both real and imaginary parts verified.

## Complex number handling

- S is real (Float64Array), AP is Complex128Array. Scaling is real-by-complex: multiply both real and imag parts by S(i)*S(j). No complex multiplication needed.
- Used `*=` compound assignment for clarity since the scaling factor is always real.
