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

# dgeev

> Computes the eigenvalues and, optionally, the left and/or right eigenvectors for general matrices.

<section class="usage">

## Usage

```javascript
var dgeev = require( '@stdlib/lapack/base/dgeev' );
```

#### dgeev( jobvl, jobvr, N, A, LDA, WR, strideWR, WI, strideWI, VL, LDVL, VR, LDVR )

Computes the eigenvalues and, optionally, the left and/or right eigenvectors for general matrices.

```javascript
var dgeev = require( '@stdlib/lapack/base/dgeev' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var VL = discreteUniform( N * N, -10, 10, opts );
var VR = discreteUniform( N * N, -10, 10, opts );
var WR = discreteUniform( N, -10, 10, opts );
var WI = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dgeev.ndarray( 'compute-vectors', 'compute-vectors', N, A, N, 1, 0, WR, 1, 0, WI, 1, 0, VL, N, 1, 0, VR, N, 1, 0, WORK, 1, 0, N );
```

The function has the following parameters:

-   **jobvl**: `jobvl`.
-   **jobvr**: `jobvr`.
-   **N**: number of columns.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **WR**: input array `WR`.
-   **strideWR**: stride length for `WR`.
-   **WI**: input array `WI`.
-   **strideWI**: stride length for `WI`.
-   **VL**: input array `VL`.
-   **LDVL**: leading dimension of `VL`.
-   **VR**: input array `VR`.
-   **LDVR**: leading dimension of `VR`.

#### dgeev.ndarray( jobvl, jobvr, N, A, strideA1, strideA2, offsetA, WR, strideWR, offsetWR, WI, strideWI, offsetWI, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, WORK, strideWORK, offsetWORK, lwork )

Computes the eigenvalues and, optionally, the left and/or right eigenvectors for general matrices, using alternative indexing semantics.

```javascript
var dgeev = require( '@stdlib/lapack/base/dgeev' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var VL = discreteUniform( N * N, -10, 10, opts );
var VR = discreteUniform( N * N, -10, 10, opts );
var WR = discreteUniform( N, -10, 10, opts );
var WI = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dgeev.ndarray( 'compute-vectors', 'compute-vectors', N, A, N, 1, 0, WR, 1, 0, WI, 1, 0, VL, N, 1, 0, VR, N, 1, 0, WORK, 1, 0, N );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **offsetWR**: starting index for `WR`.
-   **offsetWI**: starting index for `WI`.
-   **strideVL1**: stride of dimension 1 of `VL`.
-   **strideVL2**: stride of dimension 2 of `VL`.
-   **offsetVL**: starting index for `VL`.
-   **strideVR1**: stride of dimension 1 of `VR`.
-   **strideVR2**: stride of dimension 2 of `VR`.
-   **offsetVR**: starting index for `VR`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **offsetWORK**: starting index for `WORK`.
-   **lwork**: `lwork`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dgeev()` corresponds to the [LAPACK][lapack] level routine [`dgeev`][lapack-dgeev].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dgeev = require( '@stdlib/lapack/base/dgeev' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var VL = discreteUniform( N * N, -10, 10, opts );
var VR = discreteUniform( N * N, -10, 10, opts );
var WR = discreteUniform( N, -10, 10, opts );
var WI = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dgeev.ndarray( 'compute-vectors', 'compute-vectors', N, A, N, 1, 0, WR, 1, 0, WI, 1, 0, VL, N, 1, 0, VR, N, 1, 0, WORK, 1, 0, N );
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

[lapack-dgeev]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dgeev.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->