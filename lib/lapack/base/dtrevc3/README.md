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

# dtrevc3

> Computes some or all of the right and/or left eigenvectors of a real upper quasi-triangular matrix T.

<section class="usage">

## Usage

```javascript
var dtrevc3 = require( '@stdlib/lapack/base/dtrevc3' );
```

#### dtrevc3( side, howmny, SELECT, strideSELECT, N, T, LDT, VL, LDVL, VR, LDVR, mm, M, WORK, strideWORK, lwork )

Computes some or all of the right and/or left eigenvectors of a real upper quasi-triangular matrix T.

```javascript
var dtrevc3 = require( '@stdlib/lapack/base/dtrevc3' );

var N = 3;
var T = discreteUniform( N * N, -10, 10, opts );
var VL = discreteUniform( N * N, -10, 10, opts );
var VR = discreteUniform( N * N, -10, 10, opts );
var SELECT = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dtrevc3.ndarray( 'left', 'all', SELECT, 1, 0, N, T, N, 1, 0, VL, N, 1, 0, VR, N, 1, 0, N, N, WORK, 1, 0, N );
```

The function has the following parameters:

-   **side**: specifies the side of the operation.
-   **howmny**: `howmny`.
-   **SELECT**: input array `SELECT`.
-   **strideSELECT**: stride length for `SELECT`.
-   **N**: number of columns.
-   **T**: input array `T`.
-   **LDT**: leading dimension of `T`.
-   **VL**: input array `VL`.
-   **LDVL**: leading dimension of `VL`.
-   **VR**: input array `VR`.
-   **LDVR**: leading dimension of `VR`.
-   **mm**: `mm`.
-   **M**: number of rows.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **lwork**: `lwork`.

#### dtrevc3.ndarray( side, howmny, SELECT, strideSELECT, offsetSELECT, N, T, strideT1, strideT2, offsetT, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, mm, M, WORK, strideWORK, offsetWORK, lwork )

Computes some or all of the right and/or left eigenvectors of a real upper quasi-triangular matrix T, using alternative indexing semantics.

```javascript
var dtrevc3 = require( '@stdlib/lapack/base/dtrevc3' );

var N = 3;
var T = discreteUniform( N * N, -10, 10, opts );
var VL = discreteUniform( N * N, -10, 10, opts );
var VR = discreteUniform( N * N, -10, 10, opts );
var SELECT = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dtrevc3.ndarray( 'left', 'all', SELECT, 1, 0, N, T, N, 1, 0, VL, N, 1, 0, VR, N, 1, 0, N, N, WORK, 1, 0, N );
```

The function has the following additional parameters:

-   **offsetSELECT**: starting index for `SELECT`.
-   **strideT1**: stride of dimension 1 of `T`.
-   **strideT2**: stride of dimension 2 of `T`.
-   **offsetT**: starting index for `T`.
-   **strideVL1**: stride of dimension 1 of `VL`.
-   **strideVL2**: stride of dimension 2 of `VL`.
-   **offsetVL**: starting index for `VL`.
-   **strideVR1**: stride of dimension 1 of `VR`.
-   **strideVR2**: stride of dimension 2 of `VR`.
-   **offsetVR**: starting index for `VR`.
-   **offsetWORK**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dtrevc3()` corresponds to the [LAPACK][lapack] level routine [`dtrevc3`][lapack-dtrevc3].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dtrevc3 = require( '@stdlib/lapack/base/dtrevc3' );

var N = 3;
var T = discreteUniform( N * N, -10, 10, opts );
var VL = discreteUniform( N * N, -10, 10, opts );
var VR = discreteUniform( N * N, -10, 10, opts );
var SELECT = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dtrevc3.ndarray( 'left', 'all', SELECT, 1, 0, N, T, N, 1, 0, VL, N, 1, 0, VR, N, 1, 0, N, N, WORK, 1, 0, N );
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

[lapack-dtrevc3]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dtrevc3.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->