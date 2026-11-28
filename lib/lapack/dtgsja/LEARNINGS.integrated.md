# dtgsja: Translation Learnings

## Translation pitfalls

- NCYCLE is an output integer. Passed as Int32Array of length 1 (ncycle[0]).
- The HUGENUM constant: Fortran uses `HUGE(0.0d0)`. JS equivalent is `1.7976931348623157e+308` (Number.MAX_VALUE). Used to guard the gamma = B/A division against overflow.
- dlags2 returns an object `{csu, snu, csv, snv, csq, snq}`, not separate output params. Must destructure.
- dlartg returns via output array `out[0]=cs, out[1]=sn, out[2]=r`. Called for ALPHA/BETA computation.
- The convergence test uses dlapll which modifies its input arrays. Must copy A and B rows to WORK before calling dlapll.
- The `upper` flag alternates each cycle: false on odd cycles, true on even. The convergence check only happens on non-upper (even) cycles.
- In the post-convergence ALPHA/BETA computation, `gamma < 0` requires negating the B row AND optionally the V column. The sign of gamma determines the sign convention.

## Dependency interface surprises

- dlags2 is a scalar-only routine that returns an object. No arrays needed.
- dlapll modifies both x and y in-place (they are overwritten). Must copy to WORK first.

## Missing automation

- N/A

## Coverage gaps

- The gamma overflow path (gamma > HUGENUM) at lines ~279-283 is hard to trigger -- requires A diagonal exactly zero with B diagonal nonzero. Could add a targeted test.
- The `ALPHA >= BETA` vs `ALPHA < BETA` branch (lines ~302-326) depends on the ratio of A/B diagonals.
- 94.40% line coverage, 90.32% branch coverage.

## Complex number handling

- N/A -- real-only routine.
