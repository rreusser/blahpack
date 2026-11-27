# zlacon: Translation Learnings

## Translation pitfalls

- The Fortran SAVE statement makes all local variables persistent between calls. In JavaScript, this is implemented with module-level variables (JUMP, ITER, J, JLAST). This makes the routine NOT reentrant or safe for concurrent use.
- izmax1 returns 0-based indices in the JS version, matching the convention used in zlacn2. No off-by-one adjustment needed since both routines share the same dependency.

## Dependency interface surprises

- zlacon uses `IZMAX1` and `DZSUM1` (LAPACK complex-magnitude variants), NOT `IZAMAX` and `DZASUM` (BLAS). The deps.py output listed `dzasum`/`izamax` but the actual Fortran source calls `IZMAX1`/`DZSUM1`. The deps file and JS imports must use the LAPACK versions.
- `dlamch('Safe minimum')` is called every invocation in Fortran but is computed once as a module-level constant in JS for efficiency.

## Automation opportunities

- The zlacon implementation is essentially identical to zlacn2 except for state management (module-level vs ISAVE array). A transform could generate one from the other.

## Coverage gaps

- All five JUMP states are exercised through the reverse communication loop tests with various matrix types (identity, diagonal, dense, triangular).
- The Fortran SAVE semantics mean module-level state persists across test cases, which matches Fortran behavior. Tests run sequentially so state from one test leaks into the next, but since each test starts with KASE=0, the state is properly reinitialized.

## Complex number handling

- Complex values are accessed via `reinterpret(Complex128Array, 0)` to get the underlying Float64Array with interleaved real/imaginary pairs.
- Complex absolute value uses `cabs(new Complex128(re, im))` from `@stdlib/math/base/special/cabs`.
- The normalization `X[i] = X[i] / |X[i]|` is done component-wise on the interleaved real/imaginary parts.
