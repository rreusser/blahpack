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

# zlarft

> Forms the triangular factor T of a block reflector H = I - vtvH.

<section class="usage">

## Usage

```javascript
var zlarft = require( '@stdlib/lapack/base/zlarft' );
```

#### zlarft( order, direct, storev, N, K, V, LDV, TAU, strideTAU, T, LDT )

Forms the triangular factor T of a block reflector H = I - vtvH.

```javascript
var zlarft = require( '@stdlib/lapack/base/zlarft' );

var N = 3;
var V = discreteUniform( N * N, -10, 10, opts );
var T = discreteUniform( N * N, -10, 10, opts );
var TAU = discreteUniform( N, -10, 10, opts );

zlarft.ndarray( 'forward', 'columnwise', N, N, V, N, 1, 0, TAU, 1, 0, T, N, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **direct**: `direct`.
-   **storev**: `storev`.
-   **N**: number of columns.
-   **K**: inner dimension.
-   **V**: input array `V`.
-   **LDV**: leading dimension of `V`.
-   **TAU**: input array `TAU`.
-   **strideTAU**: stride length for `TAU`.
-   **T**: input array `T`.
-   **LDT**: leading dimension of `T`.

#### zlarft.ndarray( direct, storev, N, K, V, strideV1, strideV2, offsetV, TAU, strideTAU, offsetTAU, T, strideT1, strideT2, offsetT )

Forms the triangular factor T of a block reflector H = I - vtvH,, using alternative indexing semantics.

```javascript
var zlarft = require( '@stdlib/lapack/base/zlarft' );

var N = 3;
var V = discreteUniform( N * N, -10, 10, opts );
var T = discreteUniform( N * N, -10, 10, opts );
var TAU = discreteUniform( N, -10, 10, opts );

zlarft.ndarray( 'forward', 'columnwise', N, N, V, N, 1, 0, TAU, 1, 0, T, N, 1, 0 );
```

The function has the following additional parameters:

-   **strideV1**: stride of dimension 1 of `V`.
-   **strideV2**: stride of dimension 2 of `V`.
-   **offsetV**: starting index for `V`.
-   **offsetTAU**: starting index for `TAU`.
-   **strideT1**: stride of dimension 1 of `T`.
-   **strideT2**: stride of dimension 2 of `T`.
-   **offsetT**: starting index for `T`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zlarft()` corresponds to the [LAPACK][lapack] level routine [`zlarft`][lapack-zlarft].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zlarft = require( '@stdlib/lapack/base/zlarft' );

var N = 3;
var V = discreteUniform( N * N, -10, 10, opts );
var T = discreteUniform( N * N, -10, 10, opts );
var TAU = discreteUniform( N, -10, 10, opts );

zlarft.ndarray( 'forward', 'columnwise', N, N, V, N, 1, 0, TAU, 1, 0, T, N, 1, 0 );
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

[lapack-zlarft]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zlarft.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->