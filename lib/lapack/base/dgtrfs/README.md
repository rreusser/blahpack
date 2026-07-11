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

# dgtrfs

> Improves the computed solution to a system of linear equations when the coefficient matrix is tridiagonal, and provides error bounds and backward error estimates for the solution.

<section class="usage">

## Usage

```javascript
var dgtrfs = require( '@stdlib/lapack/base/dgtrfs' );
```

#### dgtrfs( trans, N, nrhs, DL, strideDL, d, strideD, DU, strideDU, DLF, strideDLF, DF, strideDF, DUF, strideDUF, DU2, strideDU2, IPIV, strideIPIV, B, LDB, X, LDX, FERR, strideFERR, BERR, strideBERR, WORK, strideWORK, IWORK, strideIWORK )

Improves the computed solution to a system of linear equations when the coefficient matrix is tridiagonal, and provides error bounds and backward error estimates for the solution.

```javascript
var dgtrfs = require( '@stdlib/lapack/base/dgtrfs' );

var N = 3;
var DU = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var X = discreteUniform( N * N, -10, 10, opts );
var DL = discreteUniform( N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var DU = discreteUniform( N * N, -10, 10, opts );
var DLF = discreteUniform( N, -10, 10, opts );
var DF = discreteUniform( N, -10, 10, opts );
var DUF = discreteUniform( N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );
var FERR = discreteUniform( N, -10, 10, opts );
var BERR = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dgtrfs.ndarray( 'no-transpose', N, N, DL, 1, 0, d, 1, 0, DU, 1, 0, DLF, 1, 0, DF, 1, 0, DUF, 1, 0, 1, 1, 0, IPIV, 1, 0, B, N, 1, 0, X, N, 1, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
```

The function has the following parameters:

-   **trans**: specifies whether the matrix should be transposed.
-   **N**: number of columns.
-   **nrhs**: number of right-hand sides.
-   **DL**: input array `DL`.
-   **strideDL**: stride length for `DL`.
-   **d**: `d`.
-   **strideD**: stride length for `D`.
-   **DU**: input array `DU`.
-   **strideDU**: stride length for `DU`.
-   **DLF**: input array `DLF`.
-   **strideDLF**: stride length for `DLF`.
-   **DF**: input array `DF`.
-   **strideDF**: stride length for `DF`.
-   **DUF**: input array `DUF`.
-   **strideDUF**: stride length for `DUF`.
-   **DU2**: input array `DU2`.
-   **strideDU2**: stride of dimension 2 of `DU`.
-   **IPIV**: input array `IPIV`.
-   **strideIPIV**: stride length for `IPIV`.
-   **B**: input array `B`.
-   **LDB**: leading dimension of `B`.
-   **X**: input array `X`.
-   **LDX**: leading dimension of `X`.
-   **FERR**: input array `FERR`.
-   **strideFERR**: stride length for `FERR`.
-   **BERR**: input array `BERR`.
-   **strideBERR**: stride length for `BERR`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **IWORK**: input array `IWORK`.
-   **strideIWORK**: stride length for `IWORK`.

#### dgtrfs.ndarray( trans, N, nrhs, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, DLF, strideDLF, offsetDLF, DF, strideDF, offsetDF, DUF, strideDUF, offsetDUF, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK )

Improves the computed solution to a system of linear equations when the coefficient matrix is tridiagonal, and provides error bounds and backward error estimates for the solution, using alternative indexing semantics.

```javascript
var dgtrfs = require( '@stdlib/lapack/base/dgtrfs' );

var N = 3;
var DU = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var X = discreteUniform( N * N, -10, 10, opts );
var DL = discreteUniform( N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var DU = discreteUniform( N * N, -10, 10, opts );
var DLF = discreteUniform( N, -10, 10, opts );
var DF = discreteUniform( N, -10, 10, opts );
var DUF = discreteUniform( N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );
var FERR = discreteUniform( N, -10, 10, opts );
var BERR = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dgtrfs.ndarray( 'no-transpose', N, N, DL, 1, 0, d, 1, 0, DU, 1, 0, DLF, 1, 0, DF, 1, 0, DUF, 1, 0, 1, 1, 0, IPIV, 1, 0, B, N, 1, 0, X, N, 1, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
```

The function has the following additional parameters:

-   **offsetDL**: starting index for `DL`.
-   **offsetD**: starting index for `D`.
-   **offsetDU**: starting index for `DU`.
-   **offsetDLF**: starting index for `DLF`.
-   **offsetDF**: starting index for `DF`.
-   **offsetDUF**: starting index for `DUF`.
-   **offsetDU2**: starting index for `DU2`.
-   **offsetIPIV**: starting index for `IPIV`.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **strideX1**: stride of dimension 1 of `X`.
-   **strideX2**: stride of dimension 2 of `X`.
-   **offsetX**: starting index for `X`.
-   **offsetFERR**: starting index for `FERR`.
-   **offsetBERR**: starting index for `BERR`.
-   **offsetWORK**: starting index for `WORK`.
-   **offsetIWORK**: starting index for `IWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dgtrfs()` corresponds to the [LAPACK][lapack] level routine [`dgtrfs`][lapack-dgtrfs].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dgtrfs = require( '@stdlib/lapack/base/dgtrfs' );

var N = 3;
var DU = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var X = discreteUniform( N * N, -10, 10, opts );
var DL = discreteUniform( N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var DU = discreteUniform( N * N, -10, 10, opts );
var DLF = discreteUniform( N, -10, 10, opts );
var DF = discreteUniform( N, -10, 10, opts );
var DUF = discreteUniform( N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );
var FERR = discreteUniform( N, -10, 10, opts );
var BERR = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var IWORK = discreteUniform( N, -10, 10, opts );

dgtrfs.ndarray( 'no-transpose', N, N, DL, 1, 0, d, 1, 0, DU, 1, 0, DLF, 1, 0, DF, 1, 0, DUF, 1, 0, 1, 1, 0, IPIV, 1, 0, B, N, 1, 0, X, N, 1, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
```

</section>

<!-- /.examples -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-dgtrfs]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dgtrfs.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->