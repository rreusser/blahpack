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

# dgees

> Computes the eigenvalues, the Schur form, and, optionally, the matrix of Schur vectors for general matrices.

<section class="usage">

## Usage

```javascript
var dgees = require( '@stdlib/lapack/base/dgees' );
```

#### dgees( jobvs, sort, select, N, A, LDA, sdim, WR, strideWR, WI, strideWI, VS, LDVS, WORK, strideWORK, lwork, BWORK, strideBWORK )

Computes the eigenvalues, the Schur form, and, optionally, the matrix of Schur vectors for general matrices.

```javascript
var dgees = require( '@stdlib/lapack/base/dgees' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var VS = discreteUniform( N * N, -10, 10, opts );
var WR = discreteUniform( N, -10, 10, opts );
var WI = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var BWORK = discreteUniform( N, -10, 10, opts );

dgees.ndarray( 'compute-vectors', 'none', 1, N, A, N, 1, 0, 1, WR, 1, 0, WI, 1, 0, VS, N, 1, 0, WORK, 1, 0, N, BWORK, 1, 0 );
```

The function has the following parameters:

-   **jobvs**: `jobvs`.
-   **sort**: `sort`.
-   **select**: `select`.
-   **N**: number of columns.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **sdim**: `sdim`.
-   **WR**: input array `WR`.
-   **strideWR**: stride length for `WR`.
-   **WI**: input array `WI`.
-   **strideWI**: stride length for `WI`.
-   **VS**: input array `VS`.
-   **LDVS**: leading dimension of `VS`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **lwork**: `lwork`.
-   **BWORK**: input array `BWORK`.
-   **strideBWORK**: stride length for `BWORK`.

#### dgees.ndarray( jobvs, sort, select, N, A, strideA1, strideA2, offsetA, sdim, WR, strideWR, offsetWR, WI, strideWI, offsetWI, VS, strideVS1, strideVS2, offsetVS, WORK, strideWORK, offsetWORK, lwork, BWORK, strideBWORK, offsetBWORK )

Computes the eigenvalues, the Schur form, and, optionally, the matrix of Schur vectors for general matrices, using alternative indexing semantics.

```javascript
var dgees = require( '@stdlib/lapack/base/dgees' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var VS = discreteUniform( N * N, -10, 10, opts );
var WR = discreteUniform( N, -10, 10, opts );
var WI = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var BWORK = discreteUniform( N, -10, 10, opts );

dgees.ndarray( 'compute-vectors', 'none', 1, N, A, N, 1, 0, 1, WR, 1, 0, WI, 1, 0, VS, N, 1, 0, WORK, 1, 0, N, BWORK, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **offsetWR**: starting index for `WR`.
-   **offsetWI**: starting index for `WI`.
-   **strideVS1**: stride of dimension 1 of `VS`.
-   **strideVS2**: stride of dimension 2 of `VS`.
-   **offsetVS**: starting index for `VS`.
-   **offsetWORK**: starting index for `WORK`.
-   **offsetBWORK**: starting index for `BWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dgees()` corresponds to the [LAPACK][lapack] level routine [`dgees`][lapack-dgees].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dgees = require( '@stdlib/lapack/base/dgees' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var VS = discreteUniform( N * N, -10, 10, opts );
var WR = discreteUniform( N, -10, 10, opts );
var WI = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var BWORK = discreteUniform( N, -10, 10, opts );

dgees.ndarray( 'compute-vectors', 'none', 1, N, A, N, 1, 0, 1, WR, 1, 0, WI, 1, 0, VS, N, 1, 0, WORK, 1, 0, N, BWORK, 1, 0 );
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

[lapack-dgees]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dgees.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->