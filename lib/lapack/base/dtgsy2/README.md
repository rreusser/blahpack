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

# dtgsy2

> Solves the generalized Sylvester equation (unblocked algorithm).

<section class="usage">

## Usage

```javascript
var dtgsy2 = require( '@stdlib/lapack/base/dtgsy2' );
```

#### dtgsy2( trans, ijob, M, N, A, LDA, B, LDB, C, LDC, D, LDD, E, LDE, F, LDF, scale, rdsum, rdscal, IWORK, strideIWORK, pq )

Solves the generalized Sylvester equation (unblocked algorithm).

```javascript
var dtgsy2 = require( '@stdlib/lapack/base/dtgsy2' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var C = discreteUniform( N * N, -10, 10, opts );
var D = discreteUniform( N * N, -10, 10, opts );
var E = discreteUniform( N * N, -10, 10, opts );
var F = discreteUniform( N * N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dtgsy2.ndarray( 'no-transpose', 1, N, N, A, N, 1, 0, B, N, 1, 0, C, N, 1, 0, D, N, 1, 0, E, N, 1, 0, F, N, 1, 0, 1.0, 1, 1, IWORK, 1, 0, 1 );
```

The function has the following parameters:

-   **trans**: specifies whether the matrix should be transposed.
-   **ijob**: `ijob`.
-   **M**: number of rows.
-   **N**: number of columns.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **B**: input array `B`.
-   **LDB**: leading dimension of `B`.
-   **C**: input array `C`.
-   **LDC**: leading dimension of `C`.
-   **D**: input array `D`.
-   **LDD**: leading dimension of `D`.
-   **E**: input array `E`.
-   **LDE**: leading dimension of `E`.
-   **F**: input array `F`.
-   **LDF**: leading dimension of `F`.
-   **scale**: `scale`.
-   **rdsum**: `rdsum`.
-   **rdscal**: `rdscal`.
-   **IWORK**: input array `IWORK`.
-   **strideIWORK**: stride length for `IWORK`.
-   **pq**: `pq`.

#### dtgsy2.ndarray( trans, ijob, M, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, C, strideC1, strideC2, offsetC, D, strideD1, strideD2, offsetD, E, strideE1, strideE2, offsetE, F, strideF1, strideF2, offsetF, scale, rdsum, rdscal, IWORK, strideIWORK, offsetIWORK, pq )

Solves the generalized Sylvester equation (unblocked algorithm), using alternative indexing semantics.

```javascript
var dtgsy2 = require( '@stdlib/lapack/base/dtgsy2' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var C = discreteUniform( N * N, -10, 10, opts );
var D = discreteUniform( N * N, -10, 10, opts );
var E = discreteUniform( N * N, -10, 10, opts );
var F = discreteUniform( N * N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dtgsy2.ndarray( 'no-transpose', 1, N, N, A, N, 1, 0, B, N, 1, 0, C, N, 1, 0, D, N, 1, 0, E, N, 1, 0, F, N, 1, 0, 1.0, 1, 1, IWORK, 1, 0, 1 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **strideC1**: stride of dimension 1 of `C`.
-   **strideC2**: stride of dimension 2 of `C`.
-   **offsetC**: starting index for `C`.
-   **strideD1**: stride of dimension 1 of `D`.
-   **strideD2**: stride of dimension 2 of `D`.
-   **offsetD**: starting index for `D`.
-   **strideE1**: stride of dimension 1 of `E`.
-   **strideE2**: stride of dimension 2 of `E`.
-   **offsetE**: starting index for `E`.
-   **strideF1**: stride of dimension 1 of `F`.
-   **strideF2**: stride of dimension 2 of `F`.
-   **offsetF**: starting index for `F`.
-   **offsetIWORK**: starting index for `IWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dtgsy2()` corresponds to the [LAPACK][lapack] level routine [`dtgsy2`][lapack-dtgsy2].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dtgsy2 = require( '@stdlib/lapack/base/dtgsy2' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var C = discreteUniform( N * N, -10, 10, opts );
var D = discreteUniform( N * N, -10, 10, opts );
var E = discreteUniform( N * N, -10, 10, opts );
var F = discreteUniform( N * N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dtgsy2.ndarray( 'no-transpose', 1, N, N, A, N, 1, 0, B, N, 1, 0, C, N, 1, 0, D, N, 1, 0, E, N, 1, 0, F, N, 1, 0, 1.0, 1, 1, IWORK, 1, 0, 1 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dtgsy2.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `DTGSY2`. Indices are the 1-based Fortran indices of the source.

### Purpose

DTGSY2 solves the generalized Sylvester equation:

$A \, R - L \, B$ = scale \* C (1) $D \, R - L \, E$ = scale \* F,

using Level 1 and 2 BLAS. where R and L are unknown M-by-N matrices, (A, D), (B, E) and (C, F) are given matrix pairs of size M-by-M, N-by-N and M-by-N, respectively, with real entries. (A, D) and (B, E) must be in generalized Schur canonical form, i.e. A, B are upper quasi triangular and D, E are upper triangular. The solution (R, L) overwrites (C, F). $0 \le \mathrm{SCALE} \le 1$ is an output scaling factor chosen to avoid overflow.

In matrix notation solving equation (1) corresponds to solve $Z \, x$ = scale\*b, where Z is defined as

```text
Z = [ kron(In, A)  -kron(B**T, Im) ]             (2)
    [ kron(In, D)  -kron(E**T, Im) ],
```

Ik is the identity matrix of size k and $X^T$ is the transpose of X. kron(X, Y) is the Kronecker product between the matrices X and Y. In the process of solving (1), we solve a number of such systems where Dim(In), Dim(In) = 1 or 2.

If `TRANS = 'T'`, solve the transposed system $Z^T \, y$ = scale\*b for y, which is equivalent to solve for R and L in

$A^T \, R + D^T \, L$ = scale \* C (3) $R \, B^T + L \, E^T$ = scale \* -F

This case is used to compute an estimate of Dif\[(A, D), (B, E)\] = sigma\_min(Z) using reverse communication with DLACON.

DTGSY2 also (`IJOB` \>= 1) contributes to the computation in DTGSYL of an upper bound on the separation between to matrix pairs. Then the input (A, D), (B, E) are sub-pencils of the matrix pair in DTGSYL. See DTGSYL for details.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-dtgsy2]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dtgsy2.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->