# zpoequ: Translation Learnings

## Translation pitfalls

- zpoequ is nearly identical to dpoequ. The only difference is that A is Complex128Array and we extract `real(A(i,i))` via the Float64 view (even indices).
- The `reinterpret()` pattern converts complex-element strides to Float64 strides by multiplying by 2.

## Dependency interface surprises

- N/A: zpoequ has no LAPACK dependencies.

## Automation opportunities

- zpoequ/dpoequ are near-identical. A generic template parameterized on real vs complex could generate both.

## Coverage gaps

- 100% line and branch coverage achieved with 7 tests.

## Complex number handling

- Only reads the real part of diagonal elements. No complex arithmetic needed.
- Uses `reinterpret(A, 0)` to get Float64Array view, then accesses `Av[oA + i*sa1 + i*sa2]` which gives the real part (imaginary part at +1 offset is unused).
