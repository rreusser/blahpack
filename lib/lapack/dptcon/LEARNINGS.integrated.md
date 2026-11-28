# dptcon: Translation Learnings

## Translation pitfalls

- No reverse-communication loop needed (unlike dsycon/dgecon). dptcon computes norm(inv(A)) directly using the L*D*L^T factors, which is much simpler.
- The Fortran uses 1-based IDAMAX; our JS idamax returns 0-based indices. The index is used to look up `WORK[ix]`, so the offset computation must use `ix * sw` not `(ix+1) * sw`.

## Dependency interface surprises

- dlanst uses long-form strings ('one-norm', 'inf-norm', 'max') rather than single characters. Initially used '1' which returned undefined.
- idamax returns 0-based index, consistent with the JS convention documented in CLAUDE.md.

## Automation opportunities

- N/A. The implementation is straightforward and short.

## Coverage gaps

- 100% line and branch coverage achieved. The algorithm is a simple forward-backward sweep with no conditional branching beyond the positive-definite check.

## Complex number handling

- N/A. dptcon is a real-only routine.
