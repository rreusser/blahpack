# Performance Patterns (from stdlib comparison)

## 1. Incremental matrix pointer

Avoid recomputing offsets in inner loops:
```javascript
// GOOD: incremental (one add per element)
let ia = offsetA + sa1 * j;
for ( i = 0; i < M; i++ ) {
    A[ ia ] = ...;
    ia += sa0;
}

// AVOID: full recompute (two multiplies per element)
for ( i = 0; i < M; i++ ) {
    A[ offsetA + i*sa1 + j*sa2 ] = ...;
}
```

## 2. Layout-aware triangle dispatch

For routines with `uplo` parameter, stdlib remaps strides so the inner
loop always walks contiguous memory:
```javascript
const isrm = isRowMajor( [ strideA1, strideA2 ] );
// (col-major, upper) ↔ (row-major, lower) are same physical pattern
const sa0 = isrm ? strideA2 : strideA1;  // fast (inner) stride
const sa1 = isrm ? strideA1 : strideA2;  // slow (outer) stride
```

## 3. Fortran stride-1 specialization

The general stride/offset loop handles unit stride fine. Don't port the
`IF (INCX.EQ.1)` branches by default; add one only as a measured
optimization (CONVENTIONS X5, `docs/optimization-policy.md`).

## 4. Preserve zero-element guards

`if (x[jx] !== 0.0)` before column updates is a meaningful optimization
(skips entire column when x is zero).

## 5. Hoist machine constants to module scope

Fortran routines call DLAMCH inside the function body. In JavaScript, each
call is a table lookup V8 cannot constant-propagate. Move to module level
(CONVENTIONS X4):
```javascript
// BAD: 3 dlamch calls per invocation × 200K invocations = 600K calls
function dladiv( a, b, c, d, out ) {
    const ov = dlamch( 'overflow' );  // same value every time
    ...
}

// GOOD: computed once at module load
const OV = dlamch( 'overflow' );
function dladiv( a, b, c, d, out ) {
    // use OV directly
    ...
}
```

Same applies to `Math.sqrt(SAFMIN)` and similar — compute once as a module
constant, not per call.

## 6. Cache array reads in inner loops

V8 cannot prove that writes to `Hv[p2]` don't alias `Hv[p1]`, so it must
re-read on every use. Loading into locals makes the independence explicit:
```javascript
// BAD: V8 may re-read Hv[idx1] after writing Hv[idx2]
Hv[idx2] = -s[0] * Hv[idx1] - s[1] * Hv[idx1+1] + c * Hv[idx2];
Hv[idx1] = cr;

// GOOD: all reads happen before any writes
v1r = Hv[p1]; v1i = Hv[p1+1]; v2r = Hv[p2]; v2i = Hv[p2+1];
Hv[p1] = c * v1r + sr * v2r - si * v2i;
Hv[p2] = c * v2r - sr * v1r - si * v1i;
```

Also hoist `s[0]` / `s[1]` into local `sr` / `si` — typed-array element
access is slower than local variable access.

## 7. Skip redundant reinterpret

When the same Complex128Array is passed as both arguments (common for
in-place LAPACK operations with different offsets):
```javascript
cxv = reinterpret( cx, 0 );
cyv = ( cy === cx ) ? cxv : reinterpret( cy, 0 );
```
