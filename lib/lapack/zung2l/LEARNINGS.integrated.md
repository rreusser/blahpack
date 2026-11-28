# zung2l: Translation Learnings

## Translation pitfalls

- Direct mirror of dorg2l with complex arithmetic. Key difference: `zscal` takes a `Complex128` scalar, so `-TAU(I)` requires constructing `new Complex128(-tauv[it], -tauv[it+1])`.
- The diagonal element `A(M-N+II, II) = ONE - TAU(I)` becomes two writes: `1.0 - tauv[it]` for real, `-tauv[it+1]` for imaginary.
- Fixture uses LDA=NMAX=4 even when M=3, so extracting expected values from fixtures requires accounting for the padding row.

## Dependency interface surprises

- zlarf takes TAU as `(TAU, offsetTAU)` (Complex128Array + offset) rather than a scalar -- different from the real dlarf which takes `TAU[offset]` directly.

## Automation opportunities

- N/A: implementation already existed; only tests were written.

## Coverage gaps

- 100% line, branch, and function coverage achieved.
- Tested: M=N=K (square full), M>N with K<N (rectangular partial), K=0 (identity), N=0 (quick return), M=N=0, and non-unit LDA.
- Orthonormality of Q is only guaranteed when reflectors come from a proper QL factorization; arbitrary TAU values do not produce unitary Q, so the orthonormality test was replaced with a fixture match + non-unit LDA test.

## Complex number handling

- `reinterpret()` used at function entry for Float64 views of A and TAU.
- Complex negation for `-TAU(I)` uses `new Complex128(-re, -im)` passed to zscal.
- No complex division or abs needed.
