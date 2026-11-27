# dlasy2: Translation Learnings

## Translation pitfalls

- The computed GOTO `GO TO (10, 20, 30, 50) K` maps to `if (k===1)...else if (k===2)...` etc. K = N1+N1+N2-2 determines the case.
- The DATA arrays (LOCU12, LOCL21, LOCU22, XSWPIV, BSWPIV) are all 1-based in Fortran. Converted to 0-based JS arrays.
- idamax returns 0-based index in JS. Used directly to index the TMP/BTMP arrays.
- Scale and xnorm are output parameters passed as Float64Array (written to [0]).

## Dependency interface surprises

- idamax in JS base.js takes (N, x, strideX, offsetX) and returns a 0-based index.
- dswap takes (N, x, strideX, offsetX, y, strideY, offsetY).

## Automation opportunities

- N/A: small routine with unique logic.

## Coverage gaps

- The N1=2,N2=2 case with scaling (EIGHT*SMLNUM threshold) is hard to trigger without near-underflow inputs.

## Complex number handling

- N/A: real routine only.
