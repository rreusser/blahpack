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

# dlaqp2

> Computes a QR factorization with column pivoting of the matrix block.

<section class="usage">

## Usage

```javascript
var dlaqp2 = require( '@stdlib/lapack/base/dlaqp2' );
```

#### dlaqp2( M, N, offset, A, LDA, JPVT, strideJPVT, TAU, strideTAU, VN1, strideVN1, VN2, strideVN2, WORK, strideWORK )

Computes a QR factorization with column pivoting of the matrix block.

```javascript
var dlaqp2 = require( '@stdlib/lapack/base/dlaqp2' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var JPVT = discreteUniform( N, -10, 10, opts );
var TAU = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dlaqp2.ndarray( N, N, 0, A, N, 1, 0, JPVT, 1, 0, TAU, 1, 0, 1, N, 0, 1, 1, 0, WORK, 1, 0 );
```

The function has the following parameters:

-   **M**: number of rows.
-   **N**: number of columns.
-   **offset**: `offset`.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **JPVT**: input array `JPVT`.
-   **strideJPVT**: stride length for `JPVT`.
-   **TAU**: input array `TAU`.
-   **strideTAU**: stride length for `TAU`.
-   **VN1**: input array `VN1`.
-   **strideVN1**: stride of dimension 1 of `VN`.
-   **VN2**: input array `VN2`.
-   **strideVN2**: stride of dimension 2 of `VN`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.

#### dlaqp2.ndarray( M, N, offset, A, strideA1, strideA2, offsetA, JPVT, strideJPVT, offsetJPVT, TAU, strideTAU, offsetTAU, VN1, strideVN1, offsetVN1, VN2, strideVN2, offsetVN2, WORK, strideWORK, offsetWORK )

Computes a QR factorization with column pivoting of the matrix block, using alternative indexing semantics.

```javascript
var dlaqp2 = require( '@stdlib/lapack/base/dlaqp2' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var JPVT = discreteUniform( N, -10, 10, opts );
var TAU = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dlaqp2.ndarray( N, N, 0, A, N, 1, 0, JPVT, 1, 0, TAU, 1, 0, 1, N, 0, 1, 1, 0, WORK, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **offsetJPVT**: starting index for `JPVT`.
-   **offsetTAU**: starting index for `TAU`.
-   **offsetVN1**: starting index for `VN1`.
-   **offsetVN2**: starting index for `VN2`.
-   **offsetWORK**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlaqp2()` corresponds to the [LAPACK][lapack] level routine [`dlaqp2`][lapack-dlaqp2].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dlaqp2 = require( '@stdlib/lapack/base/dlaqp2' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var JPVT = discreteUniform( N, -10, 10, opts );
var TAU = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dlaqp2.ndarray( N, N, 0, A, N, 1, 0, JPVT, 1, 0, TAU, 1, 0, 1, N, 0, 1, 1, 0, WORK, 1, 0 );
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

[lapack-dlaqp2]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlaqp2.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->