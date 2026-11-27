# zrscl: Translation Learnings

## Translation pitfalls

- No index arithmetic needed. zrscl is a dispatcher that decomposes complex reciprocal scaling into calls to zdrscl, zdscal, and zscal. No loops, no array indexing beyond what the callees handle.
- SAFMAX is 1/SAFMIN ~ 4.5e307, which is significantly smaller than OV ~ 1.8e308. Confusing the two thresholds when writing tests leads to wrong branch coverage. Always verify which branch a test value actually triggers.
- The Fortran source declares ZLADIV as an external function but never calls it. deps.py includes it as a dependency anyway. This is harmless for Fortran linking but the JS module does not require zladiv.

## Dependency interface surprises

- zscal takes a Complex128 scalar (not separate real/imaginary parts). Constructing new Complex128 objects for each branch call is the natural pattern.
- zdscal takes a real scalar (number), not Complex128.
- zdrscl takes a real scalar (number) for the divisor, same as drscl but operates on Complex128Array.

## Automation opportunities

- The Fortran fixture output can contain `Infinity` and `-Infinity` which are not valid JSON. The test fixture parser needs a workaround (regex replacement with 1e999). This should be handled in gen_test.py or run_fortran.sh.

## Coverage gaps

- The `absr > OV || absi > OV` branch (line 108) requires components of the complex scalar to be Infinity. This is unreachable for normally constructed Complex128 values and is documented with an inline TODO.

## Complex number handling

- No complex arithmetic is inlined in zrscl. All scaling is delegated to zscal (complex scale), zdscal (real scale of complex vector), and zdrscl (real reciprocal scale of complex vector).
- New Complex128 objects are constructed for the complex scale factors passed to zscal. The Fortran DCMPLX(re, im) maps directly to new Complex128(re, im).
