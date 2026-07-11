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

# zgees

> Computes the eigenvalues, the Schur form, and, optionally, the matrix of Schur vectors for general matrices.

<section class="usage">

## Usage

```javascript
var zgees = require( '@stdlib/lapack/base/zgees' );
```

#### zgees( jobvs, sort, select, N, A, LDA, sdim, W, strideW, VS, LDVS, WORK, strideWORK, lwork, RWORK, strideRWORK, BWORK, strideBWORK )

Computes the eigenvalues, the Schur form, and, optionally, the matrix of Schur vectors for general matrices.

```javascript
var zgees = require( '@stdlib/lapack/base/zgees' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var VS = discreteUniform( N * N, -10, 10, opts );
var W = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var RWORK = discreteUniform( N, -10, 10, opts );
var BWORK = discreteUniform( N, -10, 10, opts );

zgees.ndarray( 'compute-vectors', 'none', 1, N, A, N, 1, 0, 1, W, 1, 0, VS, N, 1, 0, WORK, 1, 0, N, RWORK, 1, 0, BWORK, 1, 0 );
```

The function has the following parameters:

-   **jobvs**: `jobvs`.
-   **sort**: `sort`.
-   **select**: `select`.
-   **N**: number of columns.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **sdim**: `sdim`.
-   **W**: input array `W`.
-   **strideW**: stride length for `W`.
-   **VS**: input array `VS`.
-   **LDVS**: leading dimension of `VS`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **lwork**: `lwork`.
-   **RWORK**: input array `RWORK`.
-   **strideRWORK**: stride length for `RWORK`.
-   **BWORK**: input array `BWORK`.
-   **strideBWORK**: stride length for `BWORK`.

#### zgees.ndarray( jobvs, sort, select, N, A, strideA1, strideA2, offsetA, sdim, W, strideW, offsetW, VS, strideVS1, strideVS2, offsetVS, WORK, strideWORK, offsetWORK, lwork, RWORK, strideRWORK, offsetRWORK, BWORK, strideBWORK, offsetBWORK )

Computes the eigenvalues, the Schur form, and, optionally, the matrix of Schur vectors for general matrices,, using alternative indexing semantics.

```javascript
var zgees = require( '@stdlib/lapack/base/zgees' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var VS = discreteUniform( N * N, -10, 10, opts );
var W = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var RWORK = discreteUniform( N, -10, 10, opts );
var BWORK = discreteUniform( N, -10, 10, opts );

zgees.ndarray( 'compute-vectors', 'none', 1, N, A, N, 1, 0, 1, W, 1, 0, VS, N, 1, 0, WORK, 1, 0, N, RWORK, 1, 0, BWORK, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **offsetW**: starting index for `W`.
-   **strideVS1**: stride of dimension 1 of `VS`.
-   **strideVS2**: stride of dimension 2 of `VS`.
-   **offsetVS**: starting index for `VS`.
-   **offsetWORK**: starting index for `WORK`.
-   **offsetRWORK**: starting index for `RWORK`.
-   **offsetBWORK**: starting index for `BWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zgees()` corresponds to the [LAPACK][lapack] level routine [`zgees`][lapack-zgees].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zgees = require( '@stdlib/lapack/base/zgees' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var VS = discreteUniform( N * N, -10, 10, opts );
var W = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var RWORK = discreteUniform( N, -10, 10, opts );
var BWORK = discreteUniform( N, -10, 10, opts );

zgees.ndarray( 'compute-vectors', 'none', 1, N, A, N, 1, 0, 1, W, 1, 0, VS, N, 1, 0, WORK, 1, 0, N, RWORK, 1, 0, BWORK, 1, 0 );
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

[lapack-zgees]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zgees.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->