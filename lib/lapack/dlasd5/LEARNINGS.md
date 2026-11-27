# dlasd5: Translation Learnings

## Translation pitfalls

- The `fortran_body.py` stripped output omitted the `C = RHO*Z(1)*Z(1)*DELSQ` assignment lines (they ended up as blank lines since the comments above them were stripped). Always cross-reference the stripped body with the original `.f` source to catch missing lines.
- DSIGMA is a scalar output in Fortran but must be passed as `Float64Array(1)` in JS since there is no pass-by-reference for scalars. The scaffold generated `dsigma` as a plain `{number}` parameter type; this needed manual correction to `{Float64Array}`.
- The I=1 W<=0 B<=0 branch requires carefully chosen inputs: D values must be moderately separated (not too close, not too far) with large Z(1) and RHO in a narrow feasible range. The constraint analysis `(3*D1+D2)/4 < RHO*Z1^2 < DEL*(D1+D2)` guides the parameter search.

## Dependency interface surprises

- N/A: dlasd5 is a leaf routine with no dependencies.

## Automation opportunities

- The `init_routine.py` scaffold generates `dsigma` as `{number}` for scalar output parameters. A heuristic could detect output-only scalars (appearing in Fortran INTENT(OUT)) and generate `{Float64Array}` instead.
- The `gen_test.py` scaffold could auto-generate the `runTest` helper pattern for routines with fixed-size array outputs.

## Coverage gaps

- 100% line and branch coverage achieved. All five distinct code paths (I=1/W>0, I=1/W<=0/B>0, I=1/W<=0/B<=0, I=2/B>0, I=2/B<=0) are exercised by targeted fixture test cases.

## Complex number handling

- N/A: dlasd5 is a real-valued routine.
