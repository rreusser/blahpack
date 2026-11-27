# zptcon: Translation Learnings

## Translation pitfalls

- Same algorithm as dptcon, but E is Complex128Array while D and RWORK remain real (Float64Array). Must use `reinterpret(e, 0)` to get Float64 view, then compute `|E(i)| = sqrt(er*er + ei*ei)` manually.
- Complex-element stride must be doubled for Float64 indexing: `se = strideE * 2`.

## Dependency interface surprises

- idamax works on the real RWORK array, same as dptcon. No complex-aware max function needed.

## Automation opportunities

- zptcon and dptcon share identical structure. A template parameterized on real/complex E would eliminate duplication.

## Coverage gaps

- 100% line and branch coverage achieved.

## Complex number handling

- Only `|E(i)|` (complex absolute value) is needed. Since E elements are accessed individually via the Float64 view, inlined `Math.sqrt(er*er + ei*ei)` is used rather than `cabs`. This avoids Complex128 object allocation in the inner loop.
- D array is real (diagonal of Hermitian positive definite matrix), so no complex arithmetic on D.
