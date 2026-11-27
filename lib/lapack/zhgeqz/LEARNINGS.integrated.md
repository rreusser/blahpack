# LEARNINGS: zhgeqz

## Overview

`zhgeqz` is the single-shift QZ iteration for computing generalized eigenvalues
(and optionally Schur form) of a complex matrix pair (H, T), where H is upper
Hessenberg and T is upper triangular. This is the core eigenvalue algorithm,
called by the generalized Schur decomposition pipeline.

**Complexity:** 893 lines of Fortran, 15 GOTOs, ~1200 lines of JavaScript.

## GOTO Restructuring

The 15 GOTOs in the Fortran source follow five distinct patterns:

### 1. Main iteration control

The outer `DO 170 JITER = 1, MAXIT` loop becomes a simple `for` loop. The
`GO TO 180` (non-convergence exit) and `GO TO 190` (successful completion)
become early returns from the function, signaled by a `done` flag.

**Critical lesson:** When using closures/nested functions to represent GOTO
targets, a `return` from a nested function only exits that function, not the
outer loop. A `done` flag checked after each call is required:

```javascript
deflateAndExtract();
if (done) return info;
continue;
```

### 2. Deflation (labels 50 and 60)

Label 50 (T diagonal zero) flows into label 60 (extract eigenvalue). Mapped to
two functions: `handleZeroTdiag()` calls `deflateAndExtract()` at the end.

### 3. QZ step entry (label 70)

When a splitting row is found, `ifirst` is set and execution jumps to the QZ
step. Mapped to `doQZStep()`.

### 4. Two-consecutive-subdiagonals check (label 90)

A `break` from the search loop replaces `GO TO 90`. The `ISTART` variable
captures the loop's final state.

### 5. Continue iteration (label 160)

`GO TO 160` at the end of the deflation path skips the QZ step for that
iteration. In JavaScript, this is just the natural `continue` in the main loop.

## Key Implementation Challenges

### Stride conventions differ between routines

**Critical bug found and fixed:** `zlanhs` uses strides in **complex elements**
(each = 2 doubles), while the zhgeqz API uses strides in **doubles**. The fix
is to divide by 2 when calling zlanhs:

```javascript
anorm = zlanhs('F', in0, H, sh1/2, sh2/2, offsetH + ..., RWORK, ...);
```

Similarly, `zscal` takes strides in complex elements and `zrot` takes strides
in complex elements. These conventions are already established in the codebase
from zgghrd, but easy to forget.

### Complex arithmetic via flat arrays

All complex operations use 2-element `Float64Array` buffers. No complex number
objects are created. The `cmplx.js` utilities are available but most arithmetic
is inlined for performance in the hot QZ sweep loop.

The `ABS1(X)` statement function (`|Re(X)| + |Im(X)|`) appears ~20 times and
is mapped to `cabs1At(arr, idx)`.

### zladiv calling convention

`zladiv(x, y, out)` takes two 2-element arrays and writes the result to `out`.
It does NOT return the result as a return value.

## Test Strategy

13 test cases covering:

1. **N=0** - quick return
2. **N=1** - trivial case (single eigenvalue)
3. **3x3 eigenvalues only** (JOB='E')
4. **3x3 Schur form** with Q,Z (JOB='S', COMPQ/Z='I')
5. **4x4 Schur form** - multi-step QZ iteration
6. **IHI < ILO** - skip QZ, only set eigenvalues from diagonal
7. **Partial range** - ILO=2, IHI=3 on 4x4
8. **4x4 eigenvalues only** - no Schur vectors
9. **2x2 Schur form** - minimal QZ case
10. **Zero T diagonal** (T(2,2)=0) - triggers scan/split path
11. **Zero T(ILAST)** (T(3,3)=0) - triggers handleZeroTdiag
12. **Diagonal pair** - already triangular, immediate deflation
13. **COMPQ='V', COMPZ='V'** - accumulate into existing Q,Z

**Coverage: 82.5% line, 78.5% branch, 93.3% function.**

Uncovered paths:
- `chaseZeroToBottom` - requires T with zeros chased through (very rare)
- Exceptional shift (every 10th/20th iteration) - requires slow convergence
- `handleBothTestsPass` early exit branches

All test values are validated against Fortran reference (gfortran) fixtures.

## Automation Candidates

No new mechanical transforms were identified. The translation required
significant manual GOTO restructuring that is specific to this routine's
control flow and would not generalize to a reusable transform.
