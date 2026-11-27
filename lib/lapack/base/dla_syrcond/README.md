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

# dla_syrcond

> Estimates the Skeel condition number for a symmetric indefinite matrix.

<section class="usage">

## Usage

```javascript
var dla_syrcond = require( '@stdlib/lapack/base/dla_syrcond' );
```

#### dla_syrcond( order, uplo, N, A, LDA, AF, LDAF, IPIV, strideIPIV, offsetIPIV, cmode, c, strideC, WORK, strideWORK, IWORK, strideIWORK, offsetIWORK )

Estimates the Skeel condition number for a symmetric indefinite matrix.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );

var A = new Float64Array( [ 2.0, -1.0, -1.0, 3.0 ] );
var AF = new Float64Array( [ 2.0, -1.0, -1.0, 3.0 ] );
var IPIV = new Int32Array( [ 0, 1 ] );
var c = new Float64Array( [ 1.0, 1.0 ] );
var WORK = new Float64Array( 6 );
var IWORK = new Int32Array( 2 );

var rcond = dla_syrcond( 'column-major', 'upper', 2, A, 2, AF, 2, IPIV, 1, 0, 1, c, 1, WORK, 1, IWORK, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **uplo**: specifies which triangle of A is stored (`'upper'` or `'lower'`).
-   **N**: order of the matrix A.
-   **A**: original symmetric N-by-N matrix.
-   **LDA**: leading dimension of `A`.
-   **AF**: factored N-by-N matrix from dsytrf.
-   **LDAF**: leading dimension of `AF`.
-   **IPIV**: pivot indices from dsytrf (0-based).
-   **strideIPIV**: stride length for `IPIV`.
-   **offsetIPIV**: starting index for `IPIV`.
-   **cmode**: scaling mode (1 = multiply by C, 0 = no scaling, -1 = divide by C).
-   **c**: scaling vector of length N.
-   **strideC**: stride length for `c`.
-   **WORK**: workspace array of length >= 3\*N.
-   **strideWORK**: stride length for `WORK`.
-   **IWORK**: integer workspace array of length >= N.
-   **strideIWORK**: stride length for `IWORK`.
-   **offsetIWORK**: starting index for `IWORK`.

#### dla_syrcond.ndarray( uplo, N, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, cmode, c, strideC, offsetC, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK )

Estimates the Skeel condition number for a symmetric indefinite matrix, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );

var A = new Float64Array( [ 2.0, -1.0, -1.0, 3.0 ] );
var AF = new Float64Array( [ 2.0, -1.0, -1.0, 3.0 ] );
var IPIV = new Int32Array( [ 0, 1 ] );
var c = new Float64Array( [ 1.0, 1.0 ] );
var WORK = new Float64Array( 6 );
var IWORK = new Int32Array( 2 );

var rcond = dla_syrcond.ndarray( 'upper', 2, A, 1, 2, 0, AF, 1, 2, 0, IPIV, 1, 0, 1, c, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
```

The function has the following additional parameters:

-   **uplo**: specifies which triangle of A is stored (`'upper'` or `'lower'`).
-   **N**: order of the matrix A.
-   **A**: original symmetric N-by-N matrix.
-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **AF**: factored N-by-N matrix from dsytrf.
-   **strideAF1**: stride of dimension 1 of `AF`.
-   **strideAF2**: stride of dimension 2 of `AF`.
-   **offsetAF**: starting index for `AF`.
-   **IPIV**: pivot indices from dsytrf (0-based).
-   **strideIPIV**: stride length for `IPIV`.
-   **offsetIPIV**: starting index for `IPIV`.
-   **cmode**: scaling mode (1 = multiply by C, 0 = no scaling, -1 = divide by C).
-   **c**: scaling vector of length N.
-   **strideC**: stride length for `c`.
-   **offsetC**: starting index for `C`.
-   **WORK**: workspace array of length >= 3\*N.
-   **strideWORK**: stride length for `WORK`.
-   **offsetWORK**: starting index for `WORK`.
-   **IWORK**: integer workspace array of length >= N.
-   **strideIWORK**: stride length for `IWORK`.
-   **offsetIWORK**: starting index for `IWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   The routine uses the factorization `A = U*D*U^T` or `A = L*D*L^T` computed by `dsytrf`.
-   Uses `dlacn2` reverse communication for condition number estimation.
-   The returned value is the reciprocal of the Skeel condition number.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dla_syrcond = require( '@stdlib/lapack/base/dla_syrcond' );

// 2x2 symmetric matrix (column-major)
var A = new Float64Array( [ 2.0, -1.0, -1.0, 3.0 ] );
var AF = new Float64Array( [ 2.0, -1.0, -1.0, 3.0 ] );
var IPIV = new Int32Array( [ 0, 1 ] );
var c = new Float64Array( [ 1.0, 1.0 ] );
var WORK = new Float64Array( 6 );
var IWORK = new Int32Array( 2 );

var rcond = dla_syrcond( 'column-major', 'upper', 2, A, 2, AF, 2, IPIV, 1, 0, 1, c, 1, WORK, 1, IWORK, 1, 0 );
console.log( 'rcond:', rcond );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dla_syrcond.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `DLA_SYRCOND`. Indices are the 1-based Fortran indices of the source.

### Purpose

DLA\_SYRCOND estimates the Skeel condition number of op(A) \* op2(C) where op2 is determined by `CMODE` as follows

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
