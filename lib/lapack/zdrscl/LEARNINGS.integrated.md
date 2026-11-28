# zdrscl: Translation Learnings

## Translation pitfalls

- Direct mirror of drscl but uses zdscal instead of dscal.
- The signature generator produced a redundant `incx` parameter alongside `stride`/`offset`. Since zdscal already takes complex-element strides, the INCX is consumed into strideX. Simplified to `(N, sa, x, strideX, offsetX)` matching drscl's pattern.

## Dependency interface surprises

- zdscal takes Complex128Array with complex-element strides, same as other z-prefix BLAS. No surprises.

## Missing automation

- N/A. Straightforward translation from drscl.

## Coverage gaps

- Branch coverage slightly below 100% because both overflow and underflow protection paths are hard to trigger simultaneously in a single call. The large_scalar and small_scalar tests exercise these paths individually.

## Complex number handling

- zdrscl operates on a Complex128Array but only scales by a real scalar, so no complex arithmetic is needed beyond what zdscal does internally.
