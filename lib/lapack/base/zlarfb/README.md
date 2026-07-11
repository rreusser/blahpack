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

# zlarfb

> Applies a block reflector or its conjugate-transpose to a general rectangular matrix.

<section class="usage">

## Usage

```javascript
var zlarfb = require( '@stdlib/lapack/base/zlarfb' );
```

#### zlarfb( order, side, trans, direct, storev, M, N, K, V, LDV, T, LDT, C, LDC, WORK, LDWORK )

Applies a block reflector or its conjugate-transpose to a general rectangular matrix.

```javascript
var zlarfb = require( '@stdlib/lapack/base/zlarfb' );

var N = 3;
var V = discreteUniform( N * N, -10, 10, opts );
var T = discreteUniform( N * N, -10, 10, opts );
var C = discreteUniform( N * N, -10, 10, opts );
var WORK = discreteUniform( N * N, -10, 10, opts );

zlarfb.ndarray( 'left', 'no-transpose', 'forward', 'columnwise', N, N, N, V, N, 1, 0, T, N, 1, 0, C, N, 1, 0, WORK, N, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **side**: specifies the side of the operation.
-   **trans**: specifies whether the matrix should be transposed.
-   **direct**: `direct`.
-   **storev**: `storev`.
-   **M**: number of rows.
-   **N**: number of columns.
-   **K**: inner dimension.
-   **V**: input array `V`.
-   **LDV**: leading dimension of `V`.
-   **T**: input array `T`.
-   **LDT**: leading dimension of `T`.
-   **C**: input array `C`.
-   **LDC**: leading dimension of `C`.
-   **WORK**: input array `WORK`.
-   **LDWORK**: leading dimension of `WORK`.

#### zlarfb.ndarray( side, trans, direct, storev, M, N, K, V, strideV1, strideV2, offsetV, T, strideT1, strideT2, offsetT, C, strideC1, strideC2, offsetC, WORK, strideWORK1, strideWORK2, offsetWORK )

Applies a block reflector or its conjugate-transpose to a general rectangular matrix, using alternative indexing semantics.

```javascript
var zlarfb = require( '@stdlib/lapack/base/zlarfb' );

var N = 3;
var V = discreteUniform( N * N, -10, 10, opts );
var T = discreteUniform( N * N, -10, 10, opts );
var C = discreteUniform( N * N, -10, 10, opts );
var WORK = discreteUniform( N * N, -10, 10, opts );

zlarfb.ndarray( 'left', 'no-transpose', 'forward', 'columnwise', N, N, N, V, N, 1, 0, T, N, 1, 0, C, N, 1, 0, WORK, N, 1, 0 );
```

The function has the following additional parameters:

-   **strideV1**: stride of dimension 1 of `V`.
-   **strideV2**: stride of dimension 2 of `V`.
-   **offsetV**: starting index for `V`.
-   **strideT1**: stride of dimension 1 of `T`.
-   **strideT2**: stride of dimension 2 of `T`.
-   **offsetT**: starting index for `T`.
-   **strideC1**: stride of dimension 1 of `C`.
-   **strideC2**: stride of dimension 2 of `C`.
-   **offsetC**: starting index for `C`.
-   **strideWORK1**: stride of dimension 1 of `WORK`.
-   **strideWORK2**: stride of dimension 2 of `WORK`.
-   **offsetWORK**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zlarfb()` corresponds to the [LAPACK][lapack] level routine [`zlarfb`][lapack-zlarfb].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zlarfb = require( '@stdlib/lapack/base/zlarfb' );

var N = 3;
var V = discreteUniform( N * N, -10, 10, opts );
var T = discreteUniform( N * N, -10, 10, opts );
var C = discreteUniform( N * N, -10, 10, opts );
var WORK = discreteUniform( N * N, -10, 10, opts );

zlarfb.ndarray( 'left', 'no-transpose', 'forward', 'columnwise', N, N, N, V, N, 1, 0, T, N, 1, 0, C, N, 1, 0, WORK, N, 1, 0 );
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

[lapack-zlarfb]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zlarfb.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->