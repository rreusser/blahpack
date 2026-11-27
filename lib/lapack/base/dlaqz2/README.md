<!--

@license Apache-2.0

Copyright (c) 2025 The Stdlib Authors.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

-->

# dlaqz2

> chases a 2x2 shift bulge in a matrix pencil down a single position

<section class="usage">

## Usage

```javascript
var dlaqz2 = require( '@stdlib/lapack/base/dlaqz2' );
```

#### dlaqz2( order, ilq, ilz, K, istartm, istopm, ihi, A, LDA, B, LDB, nq, qstart, Q, LDQ, nz, zstart, Z, LDZ )

chases a 2x2 shift bulge in a matrix pencil down a single position

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var A = new Float64Array( [ 1.2, 0.9, 0.4, 0.8, 1.5, 0.3, 0.5, 0.6, 1.8 ] );
var B = new Float64Array( [ 2.1, 0.5, 0.7, 0.0, 2.3, 0.4, 0.0, 0.0, 2.5 ] );
var Q = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );
var Z = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );

dlaqz2( 'column-major', true, true, 0, 0, 2, 2, A, 3, B, 3, 3, 0, Q, 3, 3, 0, Z, 3 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **ilq**: boolean indicating whether to update the matrix `Q`.
-   **ilz**: boolean indicating whether to update the matrix `Z`.
-   **k**: (0-based) position of the bulge.
-   **istartm**: (0-based) starting column/row of the active window.
-   **istopm**: (0-based) last column of the active window.
-   **ihi**: (0-based) index of the last row of the active Hessenberg region.
-   **A**: input matrix.
-   **LDA**: leading dimension of `A`.
-   **B**: input matrix.
-   **LDB**: leading dimension of `B`.
-   **nq**: nq.
-   **qstart**: qstart.
-   **Q**: input matrix.
-   **LDQ**: leading dimension of `Q`.
-   **nz**: nz.
-   **zstart**: zstart.
-   **Z**: output matrix.
-   **LDZ**: leading dimension of `Z`.

#### dlaqz2.ndarray( ilq, ilz, K, istartm, istopm, ihi, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, nq, qstart, Q, strideQ1, strideQ2, offsetQ, nz, zstart, Z, strideZ1, strideZ2, offsetZ )

chases a 2x2 shift bulge in a matrix pencil down a single position, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var A = new Float64Array( [ 1.2, 0.9, 0.4, 0.8, 1.5, 0.3, 0.5, 0.6, 1.8 ] );
var B = new Float64Array( [ 2.1, 0.5, 0.7, 0.0, 2.3, 0.4, 0.0, 0.0, 2.5 ] );
var Q = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );
var Z = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );

dlaqz2.ndarray( true, true, 0, 0, 2, 2, A, 1, 3, 0, B, 1, 3, 0, 3, 0, Q, 1, 3, 0, 3, 0, Z, 1, 3, 0 );
```

The function has the following additional parameters:

-   **ilq**: ilq.
-   **ilz**: ilz.
-   **K**: number of superdiagonals.
-   **istartm**: istartm.
-   **istopm**: istopm.
-   **ihi**: ihi.
-   **A**: input matrix.
-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **B**: input matrix.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **nq**: nq.
-   **qstart**: qstart.
-   **Q**: input matrix.
-   **strideQ1**: stride of dimension 1 of `Q`.
-   **strideQ2**: stride of dimension 2 of `Q`.
-   **offsetQ**: starting index for `Q`.
-   **nz**: nz.
-   **zstart**: zstart.
-   **Z**: output matrix.
-   **strideZ1**: stride of dimension 1 of `Z`.
-   **strideZ2**: stride of dimension 2 of `Z`.
-   **offsetZ**: starting index for `Z`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   On entry, the 2-by-2 bulge is located in the sub-block `(A[k+1:k+3, k:k+2], B[k+1:k+3, k:k+2])`. On exit, the bulge has been chased one position further down the pencil.
-   Updates to `(A,B)` are restricted to rows `istartm:k+4` and columns `k:istopm+1`. It is assumed without checking that `istartm <= k+1` and `k+2 <= istopm`.
-   When `k+2 == ihi`, the bulge is at the edge of the active range and is removed instead of chased.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dlaqz2 = require( '@stdlib/lapack/base/dlaqz2' );

var A = new Float64Array( [ 1.2, 0.9, 0.4, 0.8, 1.5, 0.3, 0.5, 0.6, 1.8 ] );
var B = new Float64Array( [ 2.1, 0.5, 0.7, 0.0, 2.3, 0.4, 0.0, 0.0, 2.5 ] );
var Q = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );
var Z = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );

dlaqz2( 'column-major', true, true, 0, 0, 2, 2, A, 3, B, 3, 3, 0, Q, 3, 3, 0, Z, 3 );

console.log( A );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dlaqz2.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `DLAQZ2`. Indices are the 1-based Fortran indices of the source.

### Purpose

DLAQZ2 chases a 2x2 shift bulge in a matrix pencil down a single position

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array
[mdn-float32array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array
[mdn-int32array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array
[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->
