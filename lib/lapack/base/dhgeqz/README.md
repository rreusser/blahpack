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

# dhgeqz

> Implements the QZ iteration for a real Hessenberg-triangular matrix pair (H,T), computing generalized eigenvalues and optionally the generalized Schur form.

<section class="usage">

## Usage

```javascript
var dhgeqz = require( '@stdlib/lapack/base/dhgeqz' );
```

#### dhgeqz.ndarray( job, compq, compz, N, ilo, ihi, H, strideH1, strideH2, offsetH, T, strideT1, strideT2, offsetT, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK, lwork )

Implements the QZ iteration for a real Hessenberg-triangular matrix pair (H,T), computing generalized eigenvalues and optionally the generalized Schur form, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var H = new Float64Array( [ 2.0, 3.0, 1.5, 4.0 ] );
var T = new Float64Array( [ 1.0, 0.5, 0.0, 2.0 ] );
var ALPHAR = new Float64Array( 2 );
var ALPHAI = new Float64Array( 2 );
var BETA = new Float64Array( 2 );
var Q = new Float64Array( 4 );
var Z = new Float64Array( 4 );
var WORK = new Float64Array( 10 );

var info = dhgeqz.ndarray( 'eigenvalues', 'none', 'none', 2, 0, 1,
    H, 2, 1, 0, T, 2, 1, 0,
    ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0,
    Q, 2, 1, 0, Z, 2, 1, 0,
    WORK, 1, 0, 2 );
// info => 0
```

The function has the following parameters:

-   **job**: `'eigenvalues'` to compute eigenvalues only, or `'schur'` to compute the generalized Schur form.
-   **compq**: `'none'` to not compute Q, `'initialize'` to initialize Q to the identity, or `'update'` to update a pre-existing Q.
-   **compz**: `'none'` to not compute Z, `'initialize'` to initialize Z to the identity, or `'update'` to update a pre-existing Z.
-   **N**: order of the matrices H and T.
-   **ilo**: start index of the balanced submatrix (0-based).
-   **ihi**: end index of the balanced submatrix (0-based).
-   **H**: upper Hessenberg matrix.
-   **strideH1**: stride of the first dimension of `H`.
-   **strideH2**: stride of the second dimension of `H`.
-   **offsetH**: starting index for `H`.
-   **T**: upper triangular matrix.
-   **strideT1**: stride of the first dimension of `T`.
-   **strideT2**: stride of the second dimension of `T`.
-   **offsetT**: starting index for `T`.
-   **ALPHAR**: real parts of generalized eigenvalues.
-   **strideALPHAR**: stride for `ALPHAR`.
-   **offsetALPHAR**: starting index for `ALPHAR`.
-   **ALPHAI**: imaginary parts of generalized eigenvalues.
-   **strideALPHAI**: stride for `ALPHAI`.
-   **offsetALPHAI**: starting index for `ALPHAI`.
-   **BETA**: scaling factors for eigenvalues.
-   **strideBETA**: stride for `BETA`.
-   **offsetBETA**: starting index for `BETA`.
-   **Q**: left Schur vectors.
-   **strideQ1**: first dimension stride of `Q`.
-   **strideQ2**: second dimension stride of `Q`.
-   **offsetQ**: starting index for `Q`.
-   **Z**: right Schur vectors.
-   **strideZ1**: first dimension stride of `Z`.
-   **strideZ2**: second dimension stride of `Z`.
-   **offsetZ**: starting index for `Z`.
-   **WORK**: workspace array.
-   **strideWORK**: stride for `WORK`.
-   **offsetWORK**: starting index for `WORK`.
-   **lwork**: workspace size.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   The generalized eigenvalues are `(ALPHAR(j) + i*ALPHAI(j)) / BETA(j)`, for j = 0, ..., N-1.
-   `H` must be in upper Hessenberg form and `T` must be in upper triangular form on entry.
-   The function returns INFO: 0 on success, j+1 if the j-th eigenvalue failed to converge, N+1 or N+2 for unexpected failures.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dhgeqz = require( '@stdlib/lapack/base/dhgeqz' );

var H = new Float64Array( [ 2.0, 3.0, 1.5, 4.0 ] );
var T = new Float64Array( [ 1.0, 0.5, 0.0, 2.0 ] );
var ALPHAR = new Float64Array( 2 );
var ALPHAI = new Float64Array( 2 );
var BETA = new Float64Array( 2 );
var Q = new Float64Array( 4 );
var Z = new Float64Array( 4 );
var WORK = new Float64Array( 10 );

var info = dhgeqz.ndarray( 'eigenvalues', 'none', 'none', 2, 0, 1,
    H, 2, 1, 0, T, 2, 1, 0,
    ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0,
    Q, 2, 1, 0, Z, 2, 1, 0,
    WORK, 1, 0, 2 );

console.log( 'info:', info );
console.log( 'ALPHAR:', ALPHAR );
console.log( 'BETA:', BETA );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dhgeqz.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `DHGEQZ`. Indices are the 1-based Fortran indices of the source.

### Purpose

DHGEQZ computes the eigenvalues of a real matrix pair (H,T), where H is an upper Hessenberg matrix and T is upper triangular, using the double-shift QZ method. Matrix pairs of this type are produced by the reduction to generalized upper Hessenberg form of a real matrix pair (A,B):

$$
A = Q_{1} \, H \, Z_{1}^T, B = Q_{1} \, T \, Z_{1}^T
$$

as computed by DGGHRD.

If `JOB='S'`, then the Hessenberg-triangular pair (H,T) is also reduced to generalized Schur form,

$$
H = Q \, S \, Z^T, T = Q \, P \, Z^T
$$

where Q and Z are orthogonal matrices, P is an upper triangular matrix, and S is a quasi-triangular matrix with 1-by-1 and 2-by-2 diagonal blocks.

The 1-by-1 blocks correspond to real eigenvalues of the matrix pair (H,T) and the 2-by-2 blocks correspond to complex conjugate pairs of eigenvalues.

Additionally, the 2-by-2 upper triangular diagonal blocks of P corresponding to 2-by-2 blocks of S are reduced to positive diagonal form, i.e., if S(j+1,j) is non-zero, then $P(j+1,j) = P(j,j+1) = 0$, $P(j,j) > 0$, and $P(j+1,j+1) > 0$.

Optionally, the orthogonal matrix Q from the generalized Schur factorization may be postmultiplied into an input matrix Q1, and the orthogonal matrix Z may be postmultiplied into an input matrix Z1. If Q1 and Z1 are the orthogonal matrices from DGGHRD that reduced the matrix pair (A,B) to generalized upper Hessenberg form, then the output matrices $Q_{1} \, Q$ and $Z_{1} \, Z$ are the orthogonal factors from the generalized Schur factorization of (A,B):

$$
A = (Q_{1} \, Q) \, S \, (Z_{1} \, Z)^T, B = (Q_{1} \, Q) \, P \, (Z_{1} \, Z)^T
$$

To avoid overflow, eigenvalues of the matrix pair (H,T) (equivalently, of (A,B)) are computed as a pair of values ($\alpha$,$\beta$), where $\alpha$ is complex and $\beta$ real. If $\beta$ is nonzero, $\lambda = \alpha / \beta$ is an eigenvalue of the generalized nonsymmetric eigenvalue problem (GNEP)

$$
A \, x = \lambda \, B \, x
$$

and if $\alpha$ is nonzero, $\mu = \beta / \alpha$ is an eigenvalue of the alternate form of the GNEP

$$
\mu \, A \, y = B \, y
$$

Real eigenvalues can be read directly from the generalized Schur form:

$$
\alpha = S(i,i), \beta = P(i,i)
$$

Ref: C.B. Moler & G.W. Stewart, "An Algorithm for Generalized Matrix

-   Eigenvalue Problems", SIAM J. Numer. Anal., 10(1973),
-   pp. 241--256.

### Further Details

Iteration counters:

JITER -- counts iterations. IITER -- counts iterations run since ILAST was last

-   changed. This is therefore reset only when a 1-by-1 or
-   2-by-2 block deflates off the bottom.

</section>

<!-- fortran-docs:end -->

<section class="related">

</section>

<!-- /.related -->

<section class="links">

</section>

<!-- /.links -->
