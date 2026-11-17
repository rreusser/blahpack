# Complex Number Support

## API Boundary Convention (following stdlib)

- **Complex arrays**: `Complex128Array` — strides and offsets in complex elements
- **Complex scalars**: `Complex128` objects — extract via `real(z)` / `imag(z)`
- **Real arrays**: `Float64Array` — strides and offsets in Float64 units (as before)

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

## Workspace and Constants

```javascript
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
const CZERO = new Complex128( 0.0, 0.0 );
const CONE = new Complex128( 1.0, 0.0 );
const WORK = new Complex128Array( N );      // complex workspace
const RWORK = new Float64Array( 5 * N );    // real workspace
```

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
In JS: `Math.abs(v[idx]) + Math.abs(v[idx+1])`. For routines that use this
heavily, define a local helper `cabs1At(arr, idx)`.

**Conjugation is a sign flip** — In-place on Float64 views:
`v[idx+1] = -v[idx+1]`. zlaqps conjugates before zgemv, then unconjugates.

## CRITICAL: Complex Stride Convention Mismatch

Two incompatible stride conventions coexist. Mixing them causes **silent
data corruption** — this is the single most dangerous integration bug:

1. **Complex-element strides** (stride1=1, stride2=LDA):
   Used by: all BLAS routines, zgeqrf, zgeqr2, zlarf, zlarfb, zlarft,
   zlange, zlascl. These routines do `sa1 = strideA1 * 2` internally.

2. **Double-based strides** (stride1=2, stride2=2*LDA):
   Used by: zgghrd, zhgeqz, zggbal, zggbak, zlaset, zrot. These routines
   use strides directly as Float64 indices.

**How to tell which a routine expects:** If the source code contains
`sa1 = strideA1 * 2` (or `sx = strideX * 2`), it expects complex-element
strides. If it directly indexes `offset + i * strideA1` for real parts
and `+1` for imaginary, it expects double-based strides.

**When passing sub-panels** with complex-element strides, the offset into
the interleaved Float64Array is: `offsetA + 2 * (i * strideA1 + j * strideA2)`.
The factor of 2 accounts for interleaving. Forgetting this is a recurring bug.

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
