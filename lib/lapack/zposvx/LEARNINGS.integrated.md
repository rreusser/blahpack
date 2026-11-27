# zposvx: Translation Learnings

## Translation pitfalls

- B scaling for complex: must multiply BOTH real and imaginary parts by S(i). Same for X unscaling. Use the Float64 view and multiply `Bv[idx]` and `Bv[idx+1]` separately.
- The `rcond` parameter is a Float64Array of length 1 (output). zpocon writes to rcond[0], and zposvx reads it back.
- When constructing Hermitian test matrices in column-major format, be very careful with conjugation: A(i,j) = conj(A(j,i)). A sign error in imaginary parts caused completely wrong solutions in equilibration tests.
- The Fortran uses `EQUED` as a character 'N'/'Y', translated to 'none'/'yes' strings in JS.
- `FACT` maps: 'N'->'not-factored', 'E'->'equilibrate', 'F'->'factored'.

## Dependency interface surprises

- All complex LAPACK deps (zpotrf, zpotrs, zpocon, zlacpy, zlanhe, zlaqhe, zpoequ, zporfs) use long-form strings ('upper'/'lower', 'one-norm', etc.).
- zlanhe uses 'one-norm' (not '1' or 'O' like Fortran).
- zlacpy uses 'upper'/'lower' for triangle, and anything else (e.g. 'full') for full copy.
- zpocon takes rcond as Float64Array[1] and writes to rcond[0].

## Automation opportunities

- zposvx/dposvx share >90% structure. Template could generate both with real/complex parameterization.

## Coverage gaps

- 94.35% line, 91.30% branch. Uncovered: the `rcequ` validation branch when `fact='factored'` and `s` values are negative (would need smin<=0 test with fact='factored'). Also the N>0 scond computation branch that's conditionally reached.

## Complex number handling

- Scaling B and X by real S(i): inline multiply both re/im parts. Safe and simple.
- No complex division or absolute value needed in zposvx itself (those are in dependencies).
- zpoequ only reads real parts of diagonal (diagonal of Hermitian matrix is real).
