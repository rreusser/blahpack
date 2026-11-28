# zpbcon: Translation Learnings

## Translation pitfalls

- Direct mirror of dpbcon with 'conjugate-transpose' replacing 'transpose' in zlatbs calls.
- Upper case: solve U^H*y=x then U*x=y. Lower case: solve L*y=x then L^H*x=y. The order of operations differs from the real version where transpose and conjugate-transpose are the same.
- RWORK replaces IWORK from the real version (zlatbs uses CNORM as Float64Array, not Int32Array).

## Dependency interface surprises

- zlatbs complex version uses 'conjugate-transpose' for Hermitian factorizations, not 'transpose'.

## Missing automation

- Structure is nearly identical to dgbcon/dpbcon; a template-based generator could produce all four variants.

## Coverage gaps

- The scale != 1 rescaling branch and the bail-out on overflow are not explicitly tested.

## Complex number handling

- No direct complex arithmetic; all delegated to zlatbs, zlacn2, zdrscl, and izamax.
- CABS1 used for overflow check via Float64 view.
