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

# dla_porcond

> Estimates the Skeel condition number for a symmetric positive-definite matrix

<section class="usage">

## Usage

```javascript
var dla_porcond = require( '@stdlib/lapack/base/dla_porcond' );
```

#### dla_porcond( order, uplo, N, A, LDA, AF, LDAF, cmode, c, strideC, WORK, strideWORK, IWORK, strideIWORK, offsetIWORK )

Estimates the Skeel condition number for a symmetric positive-definite matrix

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );

var A = new Float64Array( [ 4.0, 1.0, 0.5, 1.0, 5.0, 1.0, 0.5, 1.0, 6.0 ] );
var AF = new Float64Array( [ 2.0, 0.5, 0.25, 0.5, 2.179, 0.401, 0.25, 0.401, 2.403 ] );
var C = new Float64Array( [ 2.0, 1.0, 0.5 ] );
var WORK = new Float64Array( 9 );
var IWORK = new Int32Array( 3 );

var result = dla_porcond( 'column-major', 'upper', 3, A, 3, AF, 3, 1, C, 1, WORK, 1, IWORK, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **uplo**: specifies whether the upper or lower triangle is stored (`'upper'` or `'lower'`).
-   **N**: order of the matrix.
-   **A**: original N-by-N symmetric positive-definite matrix.
-   **LDA**: leading dimension of `A`.
-   **AF**: Cholesky-factored N-by-N matrix (from dpotrf).
-   **LDAF**: leading dimension of `AF`.
-   **cmode**: scaling mode (1, 0, or -1).
-   **c**: scaling vector of length N.
-   **strideC**: stride length for `c`.
-   **WORK**: workspace array of length at least 3\*N.
-   **strideWORK**: stride length for `WORK`.
-   **IWORK**: integer workspace array of length at least N.
-   **strideIWORK**: stride length for `IWORK`.
-   **offsetIWORK**: starting index for `IWORK`.

#### dla_porcond.ndarray( uplo, N, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, cmode, c, strideC, offsetC, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK )

Estimates the Skeel condition number for a symmetric positive-definite matrix, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );

var A = new Float64Array( [ 4.0, 1.0, 0.5, 1.0, 5.0, 1.0, 0.5, 1.0, 6.0 ] );
var AF = new Float64Array( [ 2.0, 0.5, 0.25, 0.5, 2.179, 0.401, 0.25, 0.401, 2.403 ] );
var C = new Float64Array( [ 2.0, 1.0, 0.5 ] );
var WORK = new Float64Array( 9 );
var IWORK = new Int32Array( 3 );

var result = dla_porcond.ndarray( 'upper', 3, A, 1, 3, 0, AF, 1, 3, 0, 1, C, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
```

The function has the following additional parameters:

-   **uplo**: specifies the operation type.
-   **N**: number of columns.
-   **A**: input matrix.
-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **AF**: input matrix.
-   **strideAF1**: stride of dimension 1 of `AF`.
-   **strideAF2**: stride of dimension 2 of `AF`.
-   **offsetAF**: starting index for `AF`.
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

-   Uses the dlacn2 reverse communication interface to estimate the 1-norm of the inverse.
-   The matrix `A` is the original symmetric positive-definite matrix, and `AF` is its Cholesky factorization computed by dpotrf.
-   The `cmode` parameter controls scaling: 1 multiplies by `C`, 0 applies no scaling, -1 divides by `C`.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dpotrf = require( '@stdlib/lapack/base/dpotrf' );
var dla_porcond = require( '@stdlib/lapack/base/dla_porcond' );

// 3x3 SPD matrix (column-major):
var A = new Float64Array( [ 4.0, 1.0, 0.5, 1.0, 5.0, 1.0, 0.5, 1.0, 6.0 ] );
var AF = new Float64Array( A );
var C = new Float64Array( [ 2.0, 1.0, 0.5 ] );
var WORK = new Float64Array( 9 );
var IWORK = new Int32Array( 3 );

// Factor:
dpotrf( 'column-major', 'upper', 3, AF, 3 );

// Estimate the Skeel condition number:
var result = dla_porcond.ndarray( 'upper', 3, A, 1, 3, 0, AF, 1, 3, 0, 1, C, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
console.log( 'Condition number estimate:', result );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dla_porcond.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `DLA_PORCOND`. Indices are the 1-based Fortran indices of the source.

### Purpose

DLA\_PORCOND Estimates the Skeel condition number of op(A) \* op2(C) where op2 is determined by `CMODE` as follows

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
