# dlaic1: Translation Learnings

## Translation pitfalls

- **C as dual-use variable:** In the Fortran source, `C` is declared as an output parameter but also used as a scratch variable in intermediate calculations (e.g., `C = ZETA1*ZETA1` or `C = ZETA2*ZETA2`) before being overwritten with the final output value. In the JS translation, a local variable `c` handles the scratch usage while `out[2]` stores the final output.
- **JOB parameter:** Fortran uses integers 1 and 2. Mapped to descriptive strings `'largest-singular-value'` and `'smallest-singular-value'`.
- **Output pattern:** The scaffold generated separate `sestpr`, `s`, `c` parameters. Changed to Float64Array `out` parameter (`out[0]=sestpr`, `out[1]=s`, `out[2]=c`) following the dlartgp/dlartgs precedent.

## Branch coverage

- The JOB=2 "normal case" has a `test` variable that determines which sub-branch executes. Getting `test < 0` requires `zeta2^2 - zeta1^2 > 0.5`, i.e., gamma must dominate alpha relative to sest. Within that branch, getting `b < 0` additionally requires `zeta1^2 + zeta2^2 < 1`.
