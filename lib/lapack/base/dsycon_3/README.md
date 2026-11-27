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

# dsycon_3

> Estimates the reciprocal of the 1-norm condition number of a real symmetric matrix using the factorization computed by dsytrf_rk

<section class="usage">

## Usage

```javascript
var dsycon3 = require( '@stdlib/lapack/base/dsycon_3' );
```

#### dsycon_3( order, uplo, N, A, LDA, e, strideE, IPIV, strideIPIV, offsetIPIV, anorm, rcond, WORK, strideWORK, IWORK, strideIWORK, offsetIWORK )

Estimates the reciprocal of the 1-norm condition number of a real symmetric matrix using the factorization computed by dsytrf_rk

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );

var A = new Float64Array( [ 4.0, 0.0, 0.0, 0.0, 4.0, 0.0, 0.0, 0.0, 4.0 ] );
var e = new Float64Array( [ 0.0, 0.0, 0.0 ] );
var IPIV = new Int32Array( [ 0, 1, 2 ] );
var work = new Float64Array( 6 );
var iwork = new Int32Array( 3 );
var rcond = new Float64Array( 1 );

dsycon3( 'column-major', 'upper', 3, A, 3, e, 1, IPIV, 1, 4.0, rcond, work, 1, iwork, 1 );
// rcond[ 0 ] => 1
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **uplo**: `'upper'` or `'lower'`, must match the factorization.
-   **N**: order of the matrix `A`.
-   **A**: input matrix.
-   **LDA**: leading dimension of `A`.
-   **e**: input array.
-   **strideE**: stride length for `e`.
-   **IPIV**: input array.
-   **strideIPIV**: stride length for `IPIV`.
-   **offsetIPIV**: starting index for `IPIV`.
-   **anorm**: anorm.
-   **rcond**: rcond.
-   **WORK**: input array.
-   **strideWORK**: stride length for `WORK`.
-   **IWORK**: output array.
-   **strideIWORK**: stride length for `IWORK`.
-   **offsetIWORK**: starting index for `IWORK`.

#### dsycon_3.ndarray( uplo, N, A, strideA1, strideA2, offsetA, e, strideE, offsetE, IPIV, strideIPIV, offsetIPIV, anorm, rcond, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK )

Estimates the reciprocal of the 1-norm condition number of a real symmetric matrix using the factorization computed by dsytrf_rk, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );

var A = new Float64Array( [ 4.0, 0.0, 0.0, 0.0, 4.0, 0.0, 0.0, 0.0, 4.0 ] );
var e = new Float64Array( [ 0.0, 0.0, 0.0 ] );
var IPIV = new Int32Array( [ 0, 1, 2 ] );
var work = new Float64Array( 6 );
var iwork = new Int32Array( 3 );
var rcond = new Float64Array( 1 );

dsycon3.ndarray( 'upper', 3, A, 1, 3, 0, e, 1, 0, IPIV, 1, 0, 4.0, rcond, work, 1, 0, iwork, 1, 0 );
// rcond[ 0 ] => 1
```

The function has the following additional parameters:

-   **uplo**: specifies the operation type.
-   **N**: number of columns.
-   **A**: input matrix.
-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **e**: input array.
-   **strideE**: stride length for `e`.
-   **offsetE**: starting index for `E`.
-   **IPIV**: input array.
-   **strideIPIV**: stride length for `IPIV`.
-   **offsetIPIV**: starting index for `IPIV`.
-   **anorm**: anorm.
-   **rcond**: rcond.
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

-   The factorization `A = P*U*D*U^T*P^T` (or `A = P*L*D*L^T*P^T`) must be precomputed by `dsytrf_rk`.
-   The diagonal block matrix `D` is split between `A` (diagonal entries) and `e` (super- or sub-diagonal entries describing 2x2 pivots).
-   The estimator uses Higham's 1-norm reverse-communication algorithm (`dlacn2`).

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dsycon3 = require( '@stdlib/lapack/base/dsycon_3' );

var A = new Float64Array( [ 4.0, 0.0, 0.0, 0.0, 4.0, 0.0, 0.0, 0.0, 4.0 ] );
var e = new Float64Array( [ 0.0, 0.0, 0.0 ] );
var IPIV = new Int32Array( [ 0, 1, 2 ] );
var work = new Float64Array( 6 );
var iwork = new Int32Array( 3 );
var rcond = new Float64Array( 1 );

dsycon3( 'column-major', 'upper', 3, A, 3, e, 1, IPIV, 1, 4.0, rcond, work, 1, iwork, 1 );
console.log( rcond[ 0 ] );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dsycon_3.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `DSYCON_3`. Indices are the 1-based Fortran indices of the source.

### Purpose

DSYCON\_3 estimates the reciprocal of the condition number (in the 1-norm) of a real symmetric matrix A using the factorization computed by DSYTRF\_RK or DSYTRF\_BK:

$$
A = P \, U \, D \, (U^T) \, (P^T) \quad\text{or}\quad A = P \, L \, D \, (L^T) \, (P^T)
$$

where U (or L) is unit upper (or lower) triangular matrix, $U^T$ (or $L^T$) is the transpose of U (or L), P is a permutation matrix, $P^T$ is the transpose of P, and D is symmetric and block diagonal with 1-by-1 and 2-by-2 diagonal blocks.

An estimate is obtained for norm(inv(A)), and the reciprocal of the condition number is computed as $\mathrm{RCOND} = 1 / (\mathrm{ANORM} \, \operatorname{norm}(\operatorname{inv}(A)))$. This routine uses BLAS3 solver DSYTRS\_3.

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
