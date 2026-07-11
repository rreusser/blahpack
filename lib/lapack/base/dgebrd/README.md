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

# dgebrd

> Reduces a general real M-by-N matrix A to upper or lower bidiagonal form B by an orthogonal transformation: Qᵀ·A·P = B.

<section class="usage">

## Usage

```javascript
var dgebrd = require( '@stdlib/lapack/base/dgebrd' );
```

#### dgebrd( order, M, N, A, LDA, d, strideD, e, strideE, TAUQ, strideTAUQ, TAUP, strideTAUP, WORK, strideWORK, lwork )

Reduces a general real M-by-N matrix A to upper or lower bidiagonal form B by an orthogonal transformation: Qᵀ·A·P = B.

```javascript
var dgebrd = require( '@stdlib/lapack/base/dgebrd' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );
var TAUQ = discreteUniform( N, -10, 10, opts );
var TAUP = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dgebrd.ndarray( N, N, A, N, 1, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0, N );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **M**: number of rows.
-   **N**: number of columns.
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
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **lwork**: `lwork`.

#### dgebrd.ndarray( M, N, A, strideA1, strideA2, offsetA, d, strideD, offsetD, e, strideE, offsetE, TAUQ, strideTAUQ, offsetTAUQ, TAUP, strideTAUP, offsetTAUP, WORK, strideWORK, offsetWORK, lwork )

Reduces a general real M-by-N matrix A to upper or lower bidiagonal form B by an orthogonal transformation: Qᵀ·A·P = B, using alternative indexing semantics.

```javascript
var dgebrd = require( '@stdlib/lapack/base/dgebrd' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );
var TAUQ = discreteUniform( N, -10, 10, opts );
var TAUP = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dgebrd.ndarray( N, N, A, N, 1, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0, N );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **offsetD**: starting index for `D`.
-   **offsetE**: starting index for `E`.
-   **offsetTAUQ**: starting index for `TAUQ`.
-   **offsetTAUP**: starting index for `TAUP`.
-   **offsetWORK**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dgebrd()` corresponds to the [LAPACK][lapack] level routine [`dgebrd`][lapack-dgebrd].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dgebrd = require( '@stdlib/lapack/base/dgebrd' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );
var TAUQ = discreteUniform( N, -10, 10, opts );
var TAUP = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dgebrd.ndarray( N, N, A, N, 1, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0, N );
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

[lapack-dgebrd]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dgebrd.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->