# zlarnv: Translation Learnings

## Translation pitfalls

- The Fortran loop `DO IV = 1, N, LV/2` uses 1-based indexing. In JS the loop is `for (iv = 0; iv < N; iv += LV/2)`, and the inner complex index `IL` computes `MIN(LV/2, N-iv)` instead of `MIN(LV/2, N-IV+1)`.
- The Fortran `DCMPLX(re, im)` maps directly to writing interleaved pairs in the Float64 view.
- dlarnv uses `LV/2` batching for real numbers (idist=3 needs 2x randoms for Box-Muller). zlarnv always needs `2*il` randoms per batch since every complex number needs a real/imag pair.

## Dependency interface surprises

- dlaruv has the same signature in both dlarnv and zlarnv contexts. No surprises.

## Automation opportunities

- N/A. The z* translation from the d* counterpart was straightforward.

## Coverage gaps

- 100% line and branch coverage achieved. All 5 IDIST values tested with two different seeds.

## Complex number handling

- No complex arithmetic needed (only generating random complex numbers). Used `reinterpret(x, 0)` for Float64Array view, multiplied stride/offset by 2 for Float64 indexing.
- For IDIST 3/4/5, `exp(i*theta)` is expanded inline as `cos(theta) + i*sin(theta)` -- safe to inline since no division or absolute value is involved.
