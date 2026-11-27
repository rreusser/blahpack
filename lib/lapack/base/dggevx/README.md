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

# dggevx

> Compute generalized eigenvalues, eigenvectors, and optional balancing/condition numbers for a pair of real non-symmetric matrices.

<section class="usage">

## Usage

```javascript
var dggevx = require( '@stdlib/lapack/base/dggevx' );
```

#### dggevx( order, balanc, jobvl, jobvr, sense, N, A, LDA, B, LDB, ALPHAR, strideALPHAR, ALPHAI, strideALPHAI, BETA, strideBETA, VL, LDVL, VR, LDVR, LSCALE, strideLSCALE, RSCALE, strideRSCALE, RCONDE, strideRCONDE, RCONDV, strideRCONDV )

Computes for a pair of N-by-N real nonsymmetric matrices (A,B) the generalized eigenvalues, and, optionally, the left and/or right generalized eigenvectors, along with optional balancing (ILO/IHI/LSCALE/RSCALE/ABNRM/BBNRM).

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var A = new Float64Array( [ 2.0, 0.0, 0.0, 3.0 ] );
var B = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
var ALPHAR = new Float64Array( 2 );
var ALPHAI = new Float64Array( 2 );
var BETA = new Float64Array( 2 );
var VL = new Float64Array( 1 );
var VR = new Float64Array( 1 );
var LSCALE = new Float64Array( 2 );
var RSCALE = new Float64Array( 2 );
var RCONDE = new Float64Array( 2 );
var RCONDV = new Float64Array( 2 );

var out = dggevx( 'column-major', 'none', 'no-vectors', 'no-vectors', 'none', 2, A, 2, B, 2, ALPHAR, 1, ALPHAI, 1, BETA, 1, VL, 1, VR, 1, LSCALE, 1, RSCALE, 1, RCONDE, 1, RCONDV, 1 );
// out => { info: 0, ilo: 1, ihi: 2, abnrm: 3.0, bbnrm: 1.0 }
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **balanc**: balancing option (`'none'`, `'permute'`, `'scale'`, or `'both'`).
-   **jobvl**: `'compute-vectors'` to compute left eigenvectors, `'no-vectors'` otherwise.
-   **jobvr**: `'compute-vectors'` to compute right eigenvectors, `'no-vectors'` otherwise.
-   **sense**: reciprocal condition numbers to compute (`'none'`, `'eigenvalues'`, `'right-vectors'`, or `'both'`). Currently only `'none'` is supported — passing any other value throws, pending translation of `dtgsna`.
-   **N**: order of `A` and `B`.
-   **A**: input matrix, overwritten on exit.
-   **LDA**: leading dimension of `A`.
-   **B**: input matrix, overwritten on exit.
-   **LDB**: leading dimension of `B`.
-   **ALPHAR**: output, real parts of alpha (length `N`).
-   **strideALPHAR**: stride for `ALPHAR`.
-   **ALPHAI**: output, imaginary parts of alpha (length `N`).
-   **strideALPHAI**: stride for `ALPHAI`.
-   **BETA**: output, beta values (length `N`).
-   **strideBETA**: stride for `BETA`.
-   **VL**: output, left eigenvectors.
-   **LDVL**: leading dimension of `VL`.
-   **VR**: output, right eigenvectors.
-   **LDVR**: leading dimension of `VR`.
-   **LSCALE**: output, permutation/scaling factors (length `N`).
-   **strideLSCALE**: stride for `LSCALE`.
-   **RSCALE**: output, permutation/scaling factors (length `N`).
-   **strideRSCALE**: stride for `RSCALE`.
-   **RCONDE**: output, reciprocal condition numbers of eigenvalues (length `N`). Currently unused.
-   **strideRCONDE**: stride for `RCONDE`.
-   **RCONDV**: output, reciprocal condition numbers of right eigenvectors (length `N`). Currently unused.
-   **strideRCONDV**: stride for `RCONDV`.

The function returns an object `{ info, ilo, ihi, abnrm, bbnrm }`. `info` is `0` on success, `1..N` if the QZ iteration failed, or `N+1`/`N+2` for other errors. `ilo` and `ihi` are the 1-based row/column indices of the central submatrix produced by balancing. `abnrm` and `bbnrm` are the one-norms of the original (unscaled) `A` and `B`.

#### dggevx.ndarray( balanc, jobvl, jobvr, sense, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, LSCALE, strideLSCALE, offsetLSCALE, RSCALE, strideRSCALE, offsetRSCALE, RCONDE, strideRCONDE, offsetRCONDE, RCONDV, strideRCONDV, offsetRCONDV )

Same as above using ndarray indexing semantics. Takes a pair of strides and an offset for each input/output array in place of a single leading dimension.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   Workspace (`WORK`, `IWORK`, `BWORK`) is allocated internally; there is no `LWORK` parameter.
-   `sense` values other than `'none'` require `dtgsna`, which is not yet translated. Passing any other value throws an error.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dggevx = require( '@stdlib/lapack/base/dggevx' );

var A = new Float64Array( [ 2.0, 0.0, 0.0, 5.0 ] );
var B = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
var ALPHAR = new Float64Array( 2 );
var ALPHAI = new Float64Array( 2 );
var BETA = new Float64Array( 2 );
var VL = new Float64Array( 1 );
var VR = new Float64Array( 1 );
var LSCALE = new Float64Array( 2 );
var RSCALE = new Float64Array( 2 );
var RCONDE = new Float64Array( 2 );
var RCONDV = new Float64Array( 2 );

var out = dggevx( 'column-major', 'none', 'no-vectors', 'no-vectors', 'none', 2, A, 2, B, 2, ALPHAR, 1, ALPHAI, 1, BETA, 1, VL, 1, VR, 1, LSCALE, 1, RSCALE, 1, RCONDE, 1, RCONDV, 1 );
console.log( out );
console.log( 'eigenvalue 0:', ALPHAR[ 0 ] / BETA[ 0 ] );
console.log( 'eigenvalue 1:', ALPHAR[ 1 ] / BETA[ 1 ] );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dggevx.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `DGGEVX`. Indices are the 1-based Fortran indices of the source.

### Purpose

DGGEVX computes for a pair of N-by-N real nonsymmetric matrices (A,B) the generalized eigenvalues, and optionally, the left and/or right generalized eigenvectors.

Optionally also, it computes a balancing transformation to improve the conditioning of the eigenvalues and eigenvectors (`ILO`, `IHI`, `LSCALE`, `RSCALE`, `ABNRM`, and `BBNRM`), reciprocal condition numbers for the eigenvalues (`RCONDE`), and reciprocal condition numbers for the right eigenvectors (`RCONDV`).

A generalized eigenvalue for a pair of matrices (A,B) is a scalar $\lambda$ or a ratio $\alpha /\beta = \lambda$, such that $A - \lambda \, B$ is singular. It is usually represented as the pair ($\alpha$,$\beta$), as there is a reasonable interpretation for $\beta =0$, and even for both being zero.

The right eigenvector v(j) corresponding to the eigenvalue lambda(j) of (A,B) satisfies

$$
A \, v(j) = \lambda (j) \, B \, v(j)
$$

The left eigenvector u(j) corresponding to the eigenvalue lambda(j) of (A,B) satisfies

$$
u(j)^H \, A = \lambda (j) \, u(j)^H \, B
$$

where $u(j)^H$ is the conjugate-transpose of u(j).

### Further Details

Balancing a matrix pair (A,B) includes, first, permuting rows and columns to isolate eigenvalues, second, applying diagonal similarity transformation to the rows and columns to make the rows and columns as close in norm as possible. The computed reciprocal condition numbers correspond to the balanced matrix. Permuting rows and columns will not change the condition numbers (in exact arithmetic) but diagonal scaling will. For further explanation of balancing, see section 4.11.1.2 of LAPACK Users' Guide.

An approximate error bound on the chordal distance between the i-th computed generalized eigenvalue w and the corresponding exact eigenvalue $\lambda$ is

chord(w, $\lambda$) \<= $\mathrm{EPS} \, \operatorname{norm}(\mathrm{ABNRM}, \mathrm{BBNRM}) / \mathrm{RCONDE}(I)$

An approximate error bound for the angle between the i-th computed eigenvector `VL(i)` or `VR(i)` is given by

$$
\mathrm{EPS} \, \operatorname{norm}(\mathrm{ABNRM}, \mathrm{BBNRM}) / \mathrm{DIF}(i)
$$

For further explanation of the reciprocal condition numbers `RCONDE` and `RCONDV`, see section 4.11 of LAPACK User's Guide.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

</section>

<!-- /.links -->
