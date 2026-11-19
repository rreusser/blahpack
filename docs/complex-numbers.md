# Complex Number Support

API-boundary rules (array/scalar types, strides in complex elements,
`reinterpret` indexing, `cmplx` for div/abs/sqrt) are owned by CONVENTIONS
C1–C5. This page is practical how-to.

## Inside Routines: Reinterpret Pattern

Reinterpret to Float64Array for efficient element access:
```javascript
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';

function zfoo( N, alpha, x, strideX, offsetX ) {
    const xv = reinterpret( x, 0 );   // Float64Array view (zero-copy)
    const re = real( alpha );           // extract scalar parts
    const im = imag( alpha );
    const sx = strideX * 2;             // convert complex stride to Float64
    let ix = offsetX * 2;              // convert complex offset to Float64
    for ( let i = 0; i < N; i++ ) {
        // access: xv[ix] = real, xv[ix+1] = imag
        xv[ ix ] = re * xv[ ix ] - im * xv[ ix + 1 ];
        ix += sx;
    }
    return x;  // return original Complex128Array
}
```

## Calling Sub-Routines

Pass the original Complex128Array with strides/offsets in complex elements
(the callee does its own `*2`):
```javascript
zscal( N, alpha, A, strideA1, offsetA + j * strideA2 );
// A is Complex128Array, strides/offsets in complex elements
```

## Constants

```javascript
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
const CZERO = new Complex128( 0.0, 0.0 );
const CONE = new Complex128( 1.0, 0.0 );
```

Workspace (`WORK` as `Complex128Array`, `RWORK` as `Float64Array`) is
caller-owned: see CONVENTIONS D4, W4.

## Complex Arithmetic

Two approaches depending on context:

**1. Scalar ops** (outside hot loops): use stdlib via `lib/cmplx.js`:
```javascript
import cmplx from '../../../../cmplx.js';  // from lib/<pkg>/base/<routine>/lib/
const z = cmplx.mul( a, b );     // Complex128 * Complex128 → Complex128
const q = cmplx.div( a, b );     // robust complex division (Baudin-Smith)
const r = cmplx.abs( a );        // |a| (overflow-safe)
```

**2. Indexed ops** (in hot inner loops on Float64 views):
```javascript
const r = cmplx.absAt( view, idx );                      // |view[idx]+view[idx+1]*i|
cmplx.mulAt( view, outIdx, view, aIdx, view, bIdx );   // view[out] = view[a]*view[b]
cmplx.divAt( view, outIdx, view, aIdx, view, bIdx );   // robust division at index
```

## What to Inline vs What to Call

**NEVER inline complex division, absolute value, or square root.** Naive
implementations are numerically unstable (overflow, underflow, catastrophic
cancellation). Always use:
```javascript
cmplx.div( a, b );          // DO NOT expand to (ar*br+ai*bi)/(br*br+bi*bi) etc.
cmplx.abs( a );             // DO NOT expand to Math.sqrt(ar*ar + ai*ai)
cmplx.divAt( v, oi, v, ai, v, bi );  // indexed version for hot loops
cmplx.absAt( v, idx );               // indexed version for hot loops
```

**Safe to inline:** addition, subtraction, multiplication, conjugate, and
real-scalar scaling. When inlining, add a comment showing the math:
```javascript
// temp += conj(A[i,j]) * x[ix]
tr += aijR * xr + aijI * xi;   // real part (note: aijI sign flipped for conj)
ti += aijR * xi - aijI * xr;   // imag part

// y[iy] += alpha * temp
yr = A[ iy ];
yi = A[ iy + 1 ];
A[ iy ]     = yr + alphaR * tr - alphaI * ti;
A[ iy + 1 ] = yi + alphaR * ti + alphaI * tr;
```

## Useful Patterns

**CABS1/ABS1** — `ABS1(X) = ABS(DBLE(X)) + ABS(DIMAG(X))`.
In JS: `cmplx.abs1At( v, idx )`.

**Conjugation is a sign flip** — In-place on Float64 views:
`v[idx+1] = -v[idx+1]`. zlaqps conjugates before zgemv, then unconjugates.

## Sub-Panel Offsets

Strides and offsets are always in complex elements (C1); `base.js` doubles
them once after `reinterpret` (C2). When indexing a sub-panel in the Float64
view, the offset is `2 * ( offsetA + i * strideA1 + j * strideA2 )`. The
factor of 2 accounts for interleaving. Forgetting it is a recurring bug.

## Fortran Test Pattern

Use EQUIVALENCE to print interleaved re/im pairs:
```fortran
double precision :: zx_r(20)
complex*16 :: zx(10)
equivalence (zx, zx_r)
call print_array('zx', zx_r, 2*n)
```

## JS Test Pattern

```javascript
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';

const x = new Complex128Array( [ 1, 2, 3, 4 ] );  // two complex elements
const result = zfoo( 2, alpha, x, 1, 0 );
const view = reinterpret( result, 0 );              // Float64Array for comparison
assertArrayClose( Array.from( view ), expected );
```
