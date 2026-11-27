# zpttrs: Translation Learnings

## Translation pitfalls

- zpttrs is a thin wrapper around zptts2. The Fortran version includes ILAENV-based blocking
  (splitting NRHS into blocks of NB columns), but this is unnecessary in JS since zptts2 handles
  all columns in a single call. The blocking was removed, matching the dpttrs pattern.
- The UPLO parameter is a character ('U'/'L') in zpttrs vs an integer (IUPLO 1/0) in zptts2.
  The mapping is straightforward: 'U' -> 1, 'L' -> 0.

## Dependency interface surprises

- zptts2 takes IUPLO as integer (0 or 1), not a character. This differs from most LAPACK routines
  that take UPLO as a character. zpttrs is the public interface that normalizes this.

## Automation opportunities

- The deps file for Fortran compilation needed ilaenv/iparmq/ieeeck added manually. The auto-generated
  deps file only included zpttrs and zptts2. Could improve deps.py to detect ILAENV calls and
  include the transitive Fortran-only dependencies (not needed in JS, only for Fortran test compilation).

## Coverage gaps

- 100% line and branch coverage achieved. No gaps.
- The Fortran ILAENV blocking path (NB < NRHS) is not present in JS and not tested.

## Complex number handling

- No complex arithmetic in zpttrs itself; all complex work is delegated to zptts2.
- D is Float64Array (real diagonal), E and B are Complex128Array, matching the Fortran types.
