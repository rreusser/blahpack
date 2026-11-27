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

# dgges

> Compute the generalized eigenvalues, the generalized real Schur form (S,T), and optionally the left and/or right matrices of Schur vectors for a pair of N-by-N real nonsymmetric matrices (A,B).

<section class="usage">

## Usage

```javascript
var dgges = require( '@stdlib/lapack/base/dgges' );
```

#### dgges( order, jobvsl, jobvsr, sort, selctg, N, A, LDA, B, LDB, ALPHAR, ALPHAI, BETA, VSL, LDVSL, VSR, LDVSR )

Computes the generalized eigenvalues, the generalized real Schur form (S,T), and optionally the left and/or right matrices of Schur vectors for a pair of N-by-N real nonsymmetric matrices (A,B).

```javascript
var Float64Array = require( '@stdlib/array/float64' );

function noop() { return false; }

var A = new Float64Array( [ 1, 0, 0, 2 ] );
var B = new Float64Array( [ 1, 0, 0, 1 ] );
var ALPHAR = new Float64Array( 2 );
var ALPHAI = new Float64Array( 2 );
var BETA = new Float64Array( 2 );
var VSL = new Float64Array( 4 );
var VSR = new Float64Array( 4 );

var result = dgges( 'column-major', 'compute-vectors', 'compute-vectors', 'none', noop, 2, A, 2, B, 2, ALPHAR, ALPHAI, BETA, VSL, 2, VSR, 2 );
// result.info => 0
// result.sdim => 0
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **jobvsl**: `'compute-vectors'` to compute left Schur vectors, `'no-vectors'` to not.
-   **jobvsr**: `'compute-vectors'` to compute right Schur vectors, `'no-vectors'` to not.
-   **sort**: `'sort'` to order eigenvalues, `'none'` to not.
-   **selctg**: selection function `(alphar, alphai, beta) => boolean`.
-   **N**: order of matrices A and B.
-   **A**: input matrix A (N x N), overwritten by Schur form S on exit.
-   **LDA**: leading dimension of `A`.
-   **B**: input matrix B (N x N), overwritten by triangular form T on exit.
-   **LDB**: leading dimension of `B`.
-   **ALPHAR**: output: real parts of generalized eigenvalues (length N).
-   **ALPHAI**: output: imaginary parts of generalized eigenvalues (length N).
-   **BETA**: output: scaling factors for eigenvalues (length N).
-   **VSL**: output: left Schur vectors (N x N).
-   **LDVSL**: leading dimension of `VSL`.
-   **VSR**: output: right Schur vectors (N x N).
-   **LDVSR**: leading dimension of `VSR`.

The function returns an object with properties:

-   **info**: integer status code (0 = success).
-   **sdim**: number of eigenvalues for which `selctg` is true.

#### dgges.ndarray( jobvsl, jobvsr, sort, selctg, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA, VSL, strideVSL1, strideVSL2, offsetVSL, VSR, strideVSR1, strideVSR2, offsetVSR )

Computes the generalized eigenvalues and real Schur form, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

function noop() { return false; }

var A = new Float64Array( [ 1, 0, 0, 2 ] );
var B = new Float64Array( [ 1, 0, 0, 1 ] );
var ALPHAR = new Float64Array( 2 );
var ALPHAI = new Float64Array( 2 );
var BETA = new Float64Array( 2 );
var VSL = new Float64Array( 4 );
var VSR = new Float64Array( 4 );

var result = dgges.ndarray( 'compute-vectors', 'compute-vectors', 'none', noop, 2, A, 1, 2, 0, B, 1, 2, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, VSL, 1, 2, 0, VSR, 1, 2, 0 );
// result.info => 0
// result.sdim => 0
```

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   On exit, `A` is overwritten by the quasi-upper-triangular matrix S of the generalized Schur form, and `B` is overwritten by the upper-triangular matrix T.

-   The generalized eigenvalues are represented as `(ALPHAR[j] + i*ALPHAI[j]) / BETA[j]`.

-   When `sort` is `'sort'`, eigenvalues for which `selctg` returns `true` are reordered to the leading diagonal blocks. Complex conjugate pairs are always reordered together.

-   Workspace arrays are allocated internally.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dgges = require( '@stdlib/lapack/base/dgges' );

function noop() { return false; }

var A = new Float64Array( [ 1, 4, 7, 2, 5, 8, 3, 6, 10 ] );
var B = new Float64Array( [ 1, 0, 0, 0, 2, 0, 0, 0, 3 ] );
var ALPHAR = new Float64Array( 3 );
var ALPHAI = new Float64Array( 3 );
var BETA = new Float64Array( 3 );
var VSL = new Float64Array( 9 );
var VSR = new Float64Array( 9 );

var result = dgges( 'column-major', 'compute-vectors', 'compute-vectors', 'none', noop, 3, A, 3, B, 3, ALPHAR, ALPHAI, BETA, VSL, 3, VSR, 3 );
console.log( 'info:', result.info );
console.log( 'eigenvalues:', ALPHAR[0]/BETA[0], ALPHAR[1]/BETA[1], ALPHAR[2]/BETA[2] );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dgges.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `DGGES`. Indices are the 1-based Fortran indices of the source.

### Purpose

DGGES computes for a pair of N-by-N real nonsymmetric matrices (A,B), the generalized eigenvalues, the generalized real Schur form (S,T), optionally, the left and/or right matrices of Schur vectors (`VSL` and `VSR`). This gives the generalized Schur factorization

$$
(A,B) = ( (\mathrm{VSL}) \, S \, (\mathrm{VSR})^T, (\mathrm{VSL}) \, T \, (\mathrm{VSR})^T )
$$

Optionally, it also orders the eigenvalues so that a selected cluster of eigenvalues appears in the leading diagonal blocks of the upper quasi-triangular matrix S and the upper triangular matrix T.The leading columns of `VSL` and `VSR` then form an orthonormal basis for the corresponding left and right eigenspaces (deflating subspaces).

(If only the generalized eigenvalues are needed, use the driver DGGEV instead, which is faster.)

A generalized eigenvalue for a pair of matrices (A,B) is a scalar w or a ratio $\alpha /\beta = w$, such that $A - w \, B$ is singular. It is usually represented as the pair ($\alpha$,$\beta$), as there is a reasonable interpretation for $\beta =0$ or both being zero.

A pair of matrices (S,T) is in generalized real Schur form if T is upper triangular with non-negative diagonal and S is block upper triangular with 1-by-1 and 2-by-2 blocks. 1-by-1 blocks correspond to real generalized eigenvalues, while 2-by-2 blocks of S will be "standardized" by making the corresponding elements of T have the form:

$$
\begin{bmatrix} a & 0 \\ 0 & b \end{bmatrix}
$$

and the pair of corresponding 2-by-2 blocks in S and T will have a complex conjugate pair of generalized eigenvalues.

</section>

<!-- fortran-docs:end -->

