# dla_syrcond: Translation Learnings

## Translation pitfalls

- The Fortran source uses `LSAME(UPLO, 'U')` to check upper triangle. In JS, we compare against the long-form string `'upper'`.
- The routine computes absolute row sums inline rather than calling `dla_syamv` -- the Fortran description mentions `dla_syamv` but the actual source does not call it.
- The `CMODE` parameter controls scaling: 1 = multiply by C, 0 = no scaling, -1 = divide by C. All three paths must be implemented for both UPLO values (6 combinations total).
- Flattening the nested `if(up) { if(cmode) }` structure into a single `if/else if` chain avoids ESLint's `no-lonely-if` rule and improves readability.

## Dependency interface surprises

- `dlacn2` uses reverse communication: `KASE` is `Int32Array(1)`, `EST` is `Float64Array(1)`, and `ISAVE` is `Int32Array(3)`. All must be initialized to 0 before the loop. The v parameter (second array) uses offset `N*sw` from the WORK base, and the x parameter uses offset 0.
- `dsytrs` stride parameters are `(strideB1, strideB2, offsetB)` for the RHS matrix. For a single-column solve with WORK as the RHS, pass `(sw, N*sw, offsetWORK)` where `sw = strideWORK`.
- The `NORMIN` and `SMLNUM` variables from the Fortran source are unused in the actual computation logic (they are set but never read in any meaningful branch). The JS translation omits them.
