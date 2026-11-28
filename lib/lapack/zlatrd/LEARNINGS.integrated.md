# zlatrd: Translation Learnings

## Translation pitfalls

- The upper-triangle path has `zlacgv` (conjugate) / un-conjugate pairs around `zgemv` calls. These conjugate rows of W and A in-place before the matrix-vector multiply, then unconjugate them afterward. Missing either the conjugate or the unconjugate produces wrong results.
- W matrix strides must use complex-element strides consistently with A. The W matrix has dimensions (N, NB) and uses the same stride convention as A.
- The iw variable maps the current column in A (running index i) to the corresponding column in W. For upper: `iw = i - N + nb`. This is 0-based and correct.
- For the `'U'` path, `i < N-1` conditionally updates the current column before generating the reflector. The first iteration (i = N-1) skips the update.

## Dependency interface surprises

- `zscal` takes a `Complex128` scalar but the TAU entries are in a `Complex128Array`. Used `TAU.get(offset)` to extract the Complex128 object for passing to zscal.
- `zgemv` with trans='C' (conjugate transpose) requires careful attention: the M/N parameters refer to the original (non-transposed) matrix dimensions.

## Automation opportunities

- N/A. The translation closely follows the dlatrd real analog with s/dsymv/zhemv/, s/dgemv/zgemv/, etc. plus conjugation patterns.

## Coverage gaps

- 100% line and branch coverage achieved with two test cases (upper and lower, 6x6, NB=3).

## Complex number handling

- The zlacgv conjugate/unconjugate pattern is specific to the complex version and has no analog in dlatrd.
- The `-0.5 * tau * zdotc(...)` complex multiplication was inlined (scalar multiply, safe to inline).
- `zscal` called with `TAU.get(i)` to pass a Complex128 object.
