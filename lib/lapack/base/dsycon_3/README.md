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

## Reference documentation

From the reference LAPACK 3.12.0 source of `DSYCON_3`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

### Purpose

DSYCON\_3 estimates the reciprocal of the condition number (in the 1-norm) of a real symmetric matrix A using the factorization computed by DSYTRF\_RK or DSYTRF\_BK:

$$
A = P \, U \, D \, (U^T) \, (P^T) \quad\text{or}\quad A = P \, L \, D \, (L^T) \, (P^T)
$$

where U (or L) is unit upper (or lower) triangular matrix, $U^T$ (or $L^T$) is the transpose of U (or L), P is a permutation matrix, $P^T$ is the transpose of P, and D is symmetric and block diagonal with 1-by-1 and 2-by-2 diagonal blocks.

An estimate is obtained for norm(inv(A)), and the reciprocal of the condition number is computed as $\mathrm{RCOND} = 1 / (\mathrm{ANORM} \, \operatorname{norm}(\operatorname{inv}(A)))$. This routine uses BLAS3 solver DSYTRS\_3.

### Arguments

#### UPLO `[in]`

_CHARACTER\*1_

Specifies whether the details of the factorization are stored as an upper or lower triangular matrix:

-   `= 'U'`: Upper triangular, form is $A = P \, U \, D \, (U^T) \, (P^T)$;
-   `= 'L'`: Lower triangular, form is $A = P \, L \, D \, (L^T) \, (P^T)$.

#### N `[in]`

_INTEGER_

The order of the matrix A. $N \ge 0$.

#### A `[in]`

_DOUBLE PRECISION array, dimension (LDA,N)_

Diagonal of the block diagonal matrix D and factors U or L as computed by DSYTRF\_RK and DSYTRF\_BK:

-   a) ONLY diagonal elements of the symmetric block diagonal matrix D on the diagonal of A, i.e. $D(k,k) = A(k,k)$; (superdiagonal (or subdiagonal) elements of D should be provided on entry in array E), and
-   b) If `UPLO = 'U'`: factor U in the superdiagonal part of A. If `UPLO = 'L'`: factor L in the subdiagonal part of A.

#### LDA `[in]`

_INTEGER_

The leading dimension of the array A. $\mathrm{LDA} \ge \max (1,N)$.

#### E `[in]`

_DOUBLE PRECISION array, dimension (N)_

On entry, contains the superdiagonal (or subdiagonal) elements of the symmetric block diagonal matrix D with 1-by-1 or 2-by-2 diagonal blocks, where If `UPLO = 'U'`: $E(i) = D(i-1,i)$,$i=2$:N, `E(1)` not referenced; If `UPLO = 'L'`: $E(i) = D(i+1,i)$,$i=1$:N-1, `E(N)` not referenced.

NOTE: For 1-by-1 diagonal block D(k), where $1 \le k \le N$, the element `E(k)` is not referenced in both `UPLO = 'U'` or `UPLO = 'L'` cases.

#### IPIV `[in]`

_INTEGER array, dimension (N)_

Details of the interchanges and the block structure of D as determined by DSYTRF\_RK or DSYTRF\_BK.

#### ANORM `[in]`

_DOUBLE PRECISION_

The 1-norm of the original matrix A.

#### RCOND `[out]`

_DOUBLE PRECISION_

The reciprocal of the condition number of the matrix A, computed as $\mathrm{RCOND} = 1/(\mathrm{ANORM} \, \mathrm{AINVNM})$, where AINVNM is an estimate of the 1-norm of inv(A) computed in this routine.

#### WORK `[out]`

_DOUBLE PRECISION array, dimension (2\*N)_

#### IWORK `[out]`

_INTEGER array, dimension (N)_

#### INFO `[out]`

_INTEGER_

-   `= 0`: successful exit
-   `< 0`: if `INFO = -i`, the i-th argument had an illegal value

### Contributors

June 2017, Igor Kozachenko,

-   Computer Science Division,
-   University of California, Berkeley

September 2007, Sven Hammarling, Nicholas J. Higham, Craig Lucas,

-   School of Mathematics,
-   University of Manchester

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
