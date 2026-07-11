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

# dlabrd

> Reduces the first nb rows and columns of a general matrix to a bidiagonal form.

<section class="usage">

## Usage

```javascript
var dlabrd = require( '@stdlib/lapack/base/dlabrd' );
```

#### dlabrd( order, M, N, nb, A, LDA, d, strideD, e, strideE, TAUQ, strideTAUQ, TAUP, strideTAUP, X, LDX, Y, LDY )

Reduces the first nb rows and columns of a general matrix to a bidiagonal form.

```javascript
var dlabrd = require( '@stdlib/lapack/base/dlabrd' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var X = discreteUniform( N * N, -10, 10, opts );
var Y = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );
var TAUQ = discreteUniform( N, -10, 10, opts );
var TAUP = discreteUniform( N, -10, 10, opts );

dlabrd.ndarray( N, N, N, A, N, 1, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, X, N, 1, 0, Y, N, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **M**: number of rows.
-   **N**: number of columns.
-   **nb**: `nb`.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **d**: `d`.
-   **strideD**: stride length for `D`.
-   **e**: `e`.
-   **strideE**: stride length for `E`.
-   **TAUQ**: input array `TAUQ`.
-   **strideTAUQ**: stride length for `TAUQ`.
-   **TAUP**: input array `TAUP`.
-   **strideTAUP**: stride length for `TAUP`.
-   **X**: input array `X`.
-   **LDX**: leading dimension of `X`.
-   **Y**: input array `Y`.
-   **LDY**: leading dimension of `Y`.

#### dlabrd.ndarray( M, N, nb, A, strideA1, strideA2, offsetA, d, strideD, offsetD, e, strideE, offsetE, TAUQ, strideTAUQ, offsetTAUQ, TAUP, strideTAUP, offsetTAUP, X, strideX1, strideX2, offsetX, Y, strideY1, strideY2, offsetY )

Reduces the first nb rows and columns of a general matrix to a bidiagonal form, using alternative indexing semantics.

```javascript
var dlabrd = require( '@stdlib/lapack/base/dlabrd' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var X = discreteUniform( N * N, -10, 10, opts );
var Y = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );
var TAUQ = discreteUniform( N, -10, 10, opts );
var TAUP = discreteUniform( N, -10, 10, opts );

dlabrd.ndarray( N, N, N, A, N, 1, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, X, N, 1, 0, Y, N, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **offsetD**: starting index for `D`.
-   **offsetE**: starting index for `E`.
-   **offsetTAUQ**: starting index for `TAUQ`.
-   **offsetTAUP**: starting index for `TAUP`.
-   **strideX1**: stride of dimension 1 of `X`.
-   **strideX2**: stride of dimension 2 of `X`.
-   **offsetX**: starting index for `X`.
-   **strideY1**: stride of dimension 1 of `Y`.
-   **strideY2**: stride of dimension 2 of `Y`.
-   **offsetY**: starting index for `Y`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlabrd()` corresponds to the [LAPACK][lapack] level routine [`dlabrd`][lapack-dlabrd].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dlabrd = require( '@stdlib/lapack/base/dlabrd' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var X = discreteUniform( N * N, -10, 10, opts );
var Y = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );
var TAUQ = discreteUniform( N, -10, 10, opts );
var TAUP = discreteUniform( N, -10, 10, opts );

dlabrd.ndarray( N, N, N, A, N, 1, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, X, N, 1, 0, Y, N, 1, 0 );
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

[lapack-dlabrd]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlabrd.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->