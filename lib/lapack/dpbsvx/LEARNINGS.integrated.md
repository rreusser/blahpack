# dpbsvx: Translation Learnings

## Translation pitfalls

- The `equed` parameter is passed as a single-element array (`[ 'none' ]` or `[ 'yes' ]`) because it is both an input and output parameter. On input for `fact='factored'`, it indicates whether the system was previously equilibrated. On output for `fact='not-factored'` or `fact='equilibrate'`, it indicates whether equilibration was applied.
- The Fortran `EQUED` character parameter maps to `'none'`/`'yes'` strings (not `'N'`/`'Y'`).
- The `FACT` parameter maps to `'not-factored'`, `'factored'`, or `'equilibrate'` (corresponding to Fortran `'N'`, `'F'`, `'E'`).
- When `rcequ` is true and `fact='factored'`, SCOND must be computed from the S array inline to match Fortran behavior.
- The AB-to-AFB copy in the `nofact || equil` branch is column-by-column using dcopy, mirroring the Fortran loops that handle partial columns at the edges of the band.

## Dependency interface surprises

- `dpbequ` returns an object `{ info, scond, amax }` rather than using output parameters for `scond` and `amax`.
- `dlaqsb` returns the equilibration string (`'none'` or `'yes'`) rather than writing to a parameter.
- `dlansb` uses `'one-norm'` string (not `'1'` as in Fortran) for the norm parameter.
- The Fortran deps file (`deps_dpbsvx.txt`) needed manual additions: `dpbtrf`, `dpbtf2`, `dpotf2`, `iparam2stage`, `la_constants`, `la_xisnan` were not auto-detected by `deps.py`.

## Automation opportunities

- The `equed` array wrapper pattern (single-element array for in/out string params) appears in multiple expert driver routines and could be standardized.
- The AB-to-AFB copy pattern (column-by-column dcopy with band bounds) is shared with other band expert drivers and could be factored out.

## Coverage gaps

- When `fact='equilibrate'` and the matrix is well-conditioned (as in our test matrices), `dlaqsb` returns `'none'` and no actual equilibration occurs. The equilibration scaling path was tested via `fact='factored'` with `equed='yes'`.

## Complex number handling

- N/A: dpbsvx is a real-valued routine.
