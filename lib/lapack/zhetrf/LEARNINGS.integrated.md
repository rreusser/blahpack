# zhetrf: Translation Learnings

## Translation pitfalls
- Direct analog of zsytrf calling zhetf2/zlahef. IPIV offset for lower case uses same ~(~ipiv+k) pattern.
- NB=32 hardcoded replacing ILAENV.

## Dependency interface surprises
- zlahef returns {info, kb} object.

## Missing automation
- N/A; trivial driver.

## Coverage gaps
- Blocked path not directly tested (N < NB=32 in fixtures). Indirectly tested via zhesv.

## Complex number handling
- Delegates to zhetf2/zlahef.
