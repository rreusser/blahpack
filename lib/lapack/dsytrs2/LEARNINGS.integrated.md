# dsytrs2: Translation Learnings

## Translation pitfalls

- **dsyconv IPIV encoding bug (FIXED):** dsyconv used `-IPIV[i]` to extract
  the 0-based row index from negative IPIV values. The correct extraction is
  `~IPIV[i]` (bitwise NOT), which matches the encoding used by dsytf2/dsytrf.
  The bug was masked in dsyconv's own tests because `convertIPIV` had a
  compensating error (using `+1` instead of keeping Fortran negative values
  unchanged). Both bugs were fixed during this translation.

- **dsyconv test convertIPIV also had compensating bug (FIXED):** For negative
  Fortran IPIV values, Fortran `-p` encodes 1-based row p. In JS bitwise NOT
  convention, `~(p-1) = -p`, so the Fortran value IS the correct JS encoding.
  The old `convertIPIV` was doing `+1` which gave the wrong value, but
  dsyconv's `-IPIV[i]` extraction compensated. Fixed both to be correct.

- **String convention mismatch between routines:** dsytrf uses 'upper'/'lower',
  dsyconv uses 'U'/'L', dtrsm uses 'left'/'upper'/'no-transpose'/'unit'.
  dsytrs2 base.js uses single-char 'U'/'L' (per CLAUDE.md convention) and
  passes long strings to dtrsm calls. Tests call dsytrf with 'upper'/'lower'
  then dsytrs2 with 'U'/'L'.

## Dependency interface surprises

- **dsyconv E/WORK parameter mapping:** In Fortran dsytrs2, WORK is passed to
  dsyconv as its WORK parameter. In JS, dsyconv's E parameter (with stride/
  offset) serves this role. The WORK array communicates off-diagonal elements
  of D between dsyconv and the back-substitution step in dsytrs2.

- **dtrsm string parameters:** dtrsm expects long-form strings ('left',
  'upper', 'no-transpose', 'transpose', 'unit', 'non-unit'). Must use these
  when calling from dsytrs2, not the single-char convention.

## Automation opportunities

- N/A - standard translation, no new mechanical patterns identified.

## Coverage gaps

- Uncovered branches at lines 125-126, 177-178, 201-202, 250-251 are
  conditions where `kp !== k` evaluates to false for 1x1 pivots (no swap
  needed) in both upper and lower paths. These are minor -- the code simply
  skips the dswap call when the pivot row equals the current row.

## Complex number handling

- N/A - this is a real-valued (d-prefix) routine.
