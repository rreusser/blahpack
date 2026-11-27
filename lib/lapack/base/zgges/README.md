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

# zgges

> Computes generalized eigenvalues and Schur form for a pair of complex nonsymmetric matrices

<section class="usage">

## Usage

```javascript
var zgges = require( '@stdlib/lapack/base/zgges' );
```

#### zgges( order, jobvsl, jobvsr, sort, selctg, N, A, LDA, B, LDB, sdim, ALPHA, strideALPHA, BETA, strideBETA, VSL, LDVSL, VSR, LDVSR, WORK, strideWORK, lwork, RWORK, strideRWORK, BWORK, strideBWORK )

Computes generalized eigenvalues and Schur form for a pair of complex nonsymmetric matrices

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var zgges = require( '@stdlib/lapack/base/zgges' );

var A = new Complex128Array( Adata.slice() );
var B = new Complex128Array( Bdata.slice() );
var ALPHA = new Complex128Array( 3 );
var BETA = new Complex128Array( 3 );
var VSL = new Complex128Array( 9 );
var VSR = new Complex128Array( 9 );

zgges( 'column-major', 'compute-vectors', 'compute-vectors', 'none', noop, 3, A, 3, B, 3, ALPHA, BETA, VSL, 3, VSR, 3 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **jobvsl**: specifies the operation type.
-   **jobvsr**: specifies the operation type.
-   **sort**: specifies the operation type.
-   **selctg**: selctg.
-   **N**: number of columns.
-   **A**: input matrix.
-   **LDA**: leading dimension of `A`.
-   **B**: input matrix.
-   **LDB**: leading dimension of `B`.
-   **sdim**: sdim.
-   **ALPHA**: input array.
-   **strideALPHA**: stride length for `ALPHA`.
-   **BETA**: input array.
-   **strideBETA**: stride length for `BETA`.
-   **VSL**: input matrix.
-   **LDVSL**: leading dimension of `VSL`.
-   **VSR**: input matrix.
-   **LDVSR**: leading dimension of `VSR`.
-   **WORK**: input array.
-   **strideWORK**: stride length for `WORK`.
-   **lwork**: lwork.
-   **RWORK**: input array.
-   **strideRWORK**: stride length for `RWORK`.
-   **BWORK**: output array.
-   **strideBWORK**: stride length for `BWORK`.

#### zgges.ndarray( jobvsl, jobvsr, sort, selctg, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, sdim, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, VSL, strideVSL1, strideVSL2, offsetVSL, VSR, strideVSR1, strideVSR2, offsetVSR, WORK, strideWORK, offsetWORK, lwork, RWORK, strideRWORK, offsetRWORK, BWORK, strideBWORK, offsetBWORK )

Computes generalized eigenvalues and Schur form for a pair of complex nonsymmetric matrices, using alternative indexing semantics.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var zgges = require( '@stdlib/lapack/base/zgges' );

var A = new Complex128Array( Adata.slice() );
var B = new Complex128Array( Bdata.slice() );
var ALPHA = new Complex128Array( 3 );
var BETA = new Complex128Array( 3 );
var VSL = new Complex128Array( 9 );
var VSR = new Complex128Array( 9 );

zgges( 'column-major', 'compute-vectors', 'compute-vectors', 'none', noop, 3, A, 3, B, 3, ALPHA, BETA, VSL, 3, VSR, 3 );
```

The function has the following additional parameters:

-   **jobvsl**: specifies the operation type.
-   **jobvsr**: specifies the operation type.
-   **sort**: specifies the operation type.
-   **selctg**: selctg.
-   **N**: number of columns.
-   **A**: input matrix.
-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **B**: input matrix.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **sdim**: sdim.
-   **ALPHA**: input array.
-   **strideALPHA**: stride length for `ALPHA`.
-   **offsetALPHA**: starting index for `ALPHA`.
-   **BETA**: input array.
-   **strideBETA**: stride length for `BETA`.
-   **offsetBETA**: starting index for `BETA`.
-   **VSL**: input matrix.
-   **strideVSL1**: stride of dimension 1 of `VSL`.
-   **strideVSL2**: stride of dimension 2 of `VSL`.
-   **offsetVSL**: starting index for `VSL`.
-   **VSR**: input matrix.
-   **strideVSR1**: stride of dimension 1 of `VSR`.
-   **strideVSR2**: stride of dimension 2 of `VSR`.
-   **offsetVSR**: starting index for `VSR`.
-   **WORK**: input array.
-   **strideWORK**: stride length for `WORK`.
-   **offsetWORK**: starting index for `WORK`.
-   **lwork**: lwork.
-   **RWORK**: input array.
-   **strideRWORK**: stride length for `RWORK`.
-   **offsetRWORK**: starting index for `RWORK`.
-   **BWORK**: output array.
-   **strideBWORK**: stride length for `BWORK`.
-   **offsetBWORK**: starting index for `BWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   See LAPACK reference documentation for full algorithmic details.
</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var zgges = require( '@stdlib/lapack/base/zgges' );

var A = new Complex128Array( Adata.slice() );
var B = new Complex128Array( Bdata.slice() );
var ALPHA = new Complex128Array( 3 );
var BETA = new Complex128Array( 3 );
var VSL = new Complex128Array( 9 );
var VSR = new Complex128Array( 9 );

zgges( 'column-major', 'compute-vectors', 'compute-vectors', 'none', noop, 3, A, 3, B, 3, ALPHA, BETA, VSL, 3, VSR, 3 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zgges.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `ZGGES`. Indices are the 1-based Fortran indices of the source.

### Purpose

ZGGES computes for a pair of N-by-N complex nonsymmetric matrices (A,B), the generalized eigenvalues, the generalized complex Schur form (S, T), and optionally left and/or right Schur vectors (`VSL` and `VSR`). This gives the generalized Schur factorization

$$
(A,B) = ( (\mathrm{VSL}) \, S \, (\mathrm{VSR})^H, (\mathrm{VSL}) \, T \, (\mathrm{VSR})^H )
$$

where $(\mathrm{VSR})^H$ is the conjugate-transpose of `VSR`.

Optionally, it also orders the eigenvalues so that a selected cluster of eigenvalues appears in the leading diagonal blocks of the upper triangular matrix S and the upper triangular matrix T. The leading columns of `VSL` and `VSR` then form an unitary basis for the corresponding left and right eigenspaces (deflating subspaces).

(If only the generalized eigenvalues are needed, use the driver ZGGEV instead, which is faster.)

A generalized eigenvalue for a pair of matrices (A,B) is a scalar w or a ratio $\alpha /\beta = w$, such that $A - w \, B$ is singular. It is usually represented as the pair ($\alpha$,$\beta$), as there is a reasonable interpretation for $\beta =0$, and even for both being zero.

A pair of matrices (S,T) is in generalized complex Schur form if S and T are upper triangular and, in addition, the diagonal elements of T are non-negative real numbers.

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
