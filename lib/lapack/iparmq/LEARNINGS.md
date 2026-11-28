# iparmq: Translation Learnings

## Translation pitfalls

- `NS = MAX( 10, NH / NINT( LOG( REAL( NH ) ) / LOG( TWO ) ) )` is single precision: round NH, the log and the quotient to float32. The fixture sweeps every NH from -2 to 700 (the whole 150-590 range) and matches.
- `NINT` rounds ties away from zero; for the positive argument here `Math.floor( x + 0.5 )`.
- NH and NS are set only for ISPEC 13, 15, 16; the other queries never read them.
- `KACMIN = K22MIN = 14`, so the IACC22 result is 0 or 2 for the EXC and LAQR names; keep the reference's two-step assignment rather than collapsing it.
- The EBCDIC and Prime character-set branches of the upper-casing cannot be taken in JS ('Z' is 90) and are not translated.

## Dependency interface surprises

- N/A (no dependencies).

## Missing automation

- `bin/signature.py` drops `LWORK` (consumed), which is right here: IPARMQ never reads it.

## Coverage gaps

- None.

## Complex number handling

- N/A.
