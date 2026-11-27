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

# dla_gercond

> Estimates the Skeel condition number for a general matrix

<section class="usage">

## Usage

```javascript
var dla_gercond = require( '@stdlib/lapack/base/dla_gercond' );
```

#### dla_gercond( order, trans, N, A, LDA, AF, LDAF, IPIV, strideIPIV, offsetIPIV, cmode, c, strideC, WORK, strideWORK, IWORK, strideIWORK, offsetIWORK )

Estimates the Skeel condition number for a general matrix

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );

var A = new Float64Array( [ 2.0, 1.0, 0.0, 1.0, 3.0, 1.0, 0.0, 1.0, 4.0 ] );
var AF = new Float64Array( [ 2.0, 0.5, 0.0, 1.0, 2.5, 1.0, 0.0, 0.4, 3.6 ] );
var IPIV = new Int32Array( [ 0, 1, 2 ] );
var c = new Float64Array( [ 1.0, 1.0, 1.0 ] );
var WORK = new Float64Array( 9 );
var IWORK = new Int32Array( 3 );

var result = dla_gercond( 'column-major', 'no-transpose', 3, A, 3, AF, 3, IPIV, 1, 0, 1, c, 1, WORK, 1, IWORK, 1, 0 );
// returns ~0.29
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **trans**: specifies the operation type (`'no-transpose'` or `'transpose'`).
-   **N**: order of the matrix.
-   **A**: original N-by-N matrix.
-   **LDA**: leading dimension of `A`.
-   **AF**: LU-factored N-by-N matrix (from dgetrf).
-   **LDAF**: leading dimension of `AF`.
-   **IPIV**: pivot indices from dgetrf (0-based).
-   **strideIPIV**: stride length for `IPIV`.
-   **offsetIPIV**: starting index for `IPIV`.
-   **cmode**: column scaling mode (1, 0, or -1).
-   **c**: scaling vector of length N.
-   **strideC**: stride length for `c`.
-   **WORK**: workspace array of length at least `3*N`.
-   **strideWORK**: stride length for `WORK`.
-   **IWORK**: integer workspace array of length at least `N`.
-   **strideIWORK**: stride length for `IWORK`.
-   **offsetIWORK**: starting index for `IWORK`.

#### dla\_gercond.ndarray( trans, N, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, cmode, c, strideC, offsetC, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK )

Estimates the Skeel condition number for a general matrix, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );

var A = new Float64Array( [ 2.0, 1.0, 0.0, 1.0, 3.0, 1.0, 0.0, 1.0, 4.0 ] );
var AF = new Float64Array( [ 2.0, 0.5, 0.0, 1.0, 2.5, 1.0, 0.0, 0.4, 3.6 ] );
var IPIV = new Int32Array( [ 0, 1, 2 ] );
var c = new Float64Array( [ 1.0, 1.0, 1.0 ] );
var WORK = new Float64Array( 9 );
var IWORK = new Int32Array( 3 );

var result = dla_gercond.ndarray( 'no-transpose', 3, A, 1, 3, 0, AF, 1, 3, 0, IPIV, 1, 0, 1, c, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
// returns ~0.29
```

The function has the following additional parameters:

-   **trans**: specifies the operation type.
-   **N**: number of columns.
-   **A**: input matrix.
-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **AF**: input matrix.
-   **strideAF1**: stride of dimension 1 of `AF`.
-   **strideAF2**: stride of dimension 2 of `AF`.
-   **offsetAF**: starting index for `AF`.
-   **IPIV**: input array.
-   **strideIPIV**: stride length for `IPIV`.
-   **offsetIPIV**: starting index for `IPIV`.
-   **cmode**: cmode.
-   **c**: input array.
-   **strideC**: stride length for `c`.
-   **offsetC**: starting index for `C`.
-   **WORK**: input array.
-   **strideWORK**: stride length for `WORK`.
-   **offsetWORK**: starting index for `WORK`.
-   **IWORK**: output array.
-   **strideIWORK**: stride length for `IWORK`.
-   **offsetIWORK**: starting index for `IWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   The routine uses a dlacn2 reverse communication loop to estimate the 1-norm of the inverse of the scaled matrix, then returns the reciprocal as the condition number estimate.
-   The `cmode` parameter controls column scaling: 1 means multiply columns of A by the corresponding entries of `c`, 0 means no scaling, -1 means divide by `c`.
-   IPIV must contain 0-based pivot indices (as produced by dgetrf).

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dlaGercond = require( '@stdlib/lapack/base/dla_gercond' );

// 3x3 well-conditioned matrix (column-major):
var A = new Float64Array( [ 2.0, 1.0, 0.0, 1.0, 3.0, 1.0, 0.0, 1.0, 4.0 ] );

// Pre-factored LU:
var AF = new Float64Array( [ 2.0, 0.5, 0.0, 1.0, 2.5, 1.0, 0.0, 0.4, 3.6 ] );
var IPIV = new Int32Array( [ 0, 1, 2 ] );

var c = new Float64Array( [ 1.0, 1.0, 1.0 ] );
var WORK = new Float64Array( 9 );
var IWORK = new Int32Array( 3 );

var result = dlaGercond.ndarray( 'no-transpose', 3, A, 1, 3, 0, AF, 1, 3, 0, IPIV, 1, 0, 1, c, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
console.log( 'Reciprocal Skeel condition number:', result );
// => ~0.29
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dla_gercond.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `DLA_GERCOND`. Indices are the 1-based Fortran indices of the source.

### Purpose

DLA\_GERCOND estimates the Skeel condition number of op(A) \* op2(C) where op2 is determined by `CMODE` as follows

| `CMODE =  1` | op2(C) = C |
| --- | --- |
| `CMODE =  0` | op2(C) = I |
| `CMODE = -1` | op2(C) = inv(C) |

The Skeel condition number cond(A) = norminf( \|inv(A)\|\|A\| ) is computed by computing scaling factors R such that $\operatorname{diag}(R) \, A$\*op2(C) is row equilibrated and computing the standard infinity-norm condition number.

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
