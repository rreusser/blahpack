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

# zgeev

> Computes the eigenvalues and, optionally, the left and/or right eigenvectors for general matrices.

<section class="usage">

## Usage

```javascript
var zgeev = require( '@stdlib/lapack/base/zgeev' );
```

#### zgeev( jobvl, jobvr, N, A, LDA, w, strideW, VL, LDVL, VR, LDVR, WORK, strideWORK, lwork, RWORK, strideRWORK )

Computes the eigenvalues and, optionally, the left and/or right eigenvectors for general matrices.

```javascript
var zgeev = require( '@stdlib/lapack/base/zgeev' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var VL = discreteUniform( N * N, -10, 10, opts );
var VR = discreteUniform( N * N, -10, 10, opts );
var w = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var RWORK = discreteUniform( N, -10, 10, opts );

zgeev.ndarray( 'compute-vectors', 'compute-vectors', N, A, N, 1, 0, w, 1, 0, VL, N, 1, 0, VR, N, 1, 0, WORK, 1, 0, N, RWORK, 1, 0 );
```

The function has the following parameters:

-   **jobvl**: `jobvl`.
-   **jobvr**: `jobvr`.
-   **N**: number of columns.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **w**: `w`.
-   **strideW**: stride length for `W`.
-   **VL**: input array `VL`.
-   **LDVL**: leading dimension of `VL`.
-   **VR**: input array `VR`.
-   **LDVR**: leading dimension of `VR`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **lwork**: `lwork`.
-   **RWORK**: input array `RWORK`.
-   **strideRWORK**: stride length for `RWORK`.

#### zgeev.ndarray( jobvl, jobvr, N, A, strideA1, strideA2, offsetA, w, strideW, offsetW, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, WORK, strideWORK, offsetWORK, lwork, RWORK, strideRWORK, offsetRWORK )

Computes the eigenvalues and, optionally, the left and/or right eigenvectors for general matrices, using alternative indexing semantics.

```javascript
var zgeev = require( '@stdlib/lapack/base/zgeev' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var VL = discreteUniform( N * N, -10, 10, opts );
var VR = discreteUniform( N * N, -10, 10, opts );
var w = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var RWORK = discreteUniform( N, -10, 10, opts );

zgeev.ndarray( 'compute-vectors', 'compute-vectors', N, A, N, 1, 0, w, 1, 0, VL, N, 1, 0, VR, N, 1, 0, WORK, 1, 0, N, RWORK, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **offsetW**: starting index for `W`.
-   **strideVL1**: stride of dimension 1 of `VL`.
-   **strideVL2**: stride of dimension 2 of `VL`.
-   **offsetVL**: starting index for `VL`.
-   **strideVR1**: stride of dimension 1 of `VR`.
-   **strideVR2**: stride of dimension 2 of `VR`.
-   **offsetVR**: starting index for `VR`.
-   **offsetWORK**: starting index for `WORK`.
-   **offsetRWORK**: starting index for `RWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zgeev()` corresponds to the [LAPACK][lapack] level routine [`zgeev`][lapack-zgeev].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zgeev = require( '@stdlib/lapack/base/zgeev' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var VL = discreteUniform( N * N, -10, 10, opts );
var VR = discreteUniform( N * N, -10, 10, opts );
var w = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );
var RWORK = discreteUniform( N, -10, 10, opts );

zgeev.ndarray( 'compute-vectors', 'compute-vectors', N, A, N, 1, 0, w, 1, 0, VL, N, 1, 0, VR, N, 1, 0, WORK, 1, 0, N, RWORK, 1, 0 );
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

[lapack-zgeev]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zgeev.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->