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

# dlapmt

> Performs a forward or backward permutation of the columns of a matrix.

<section class="usage">

## Usage

```javascript
var dlapmt = require( '@stdlib/lapack/base/dlapmt' );
```

#### dlapmt( forwrd, M, N, X, LDX, k, strideK )

Performs a forward or backward permutation of the columns of a matrix.

```javascript
var dlapmt = require( '@stdlib/lapack/base/dlapmt' );

var N = 3;
var X = discreteUniform( N * N, -10, 10, opts );
var k = discreteUniform( N, -10, 10, opts );

dlapmt.ndarray( 1, N, N, X, N, 1, 0, k, 1, 0 );
```

The function has the following parameters:

-   **forwrd**: `forwrd`.
-   **M**: number of rows.
-   **N**: number of columns.
-   **X**: input array `X`.
-   **LDX**: leading dimension of `X`.
-   **k**: `k`.
-   **strideK**: stride length for `K`.

#### dlapmt.ndarray( forwrd, M, N, X, strideX1, strideX2, offsetX, k, strideK, offsetK )

Performs a forward or backward permutation of the columns of a matrix, using alternative indexing semantics.

```javascript
var dlapmt = require( '@stdlib/lapack/base/dlapmt' );

var N = 3;
var X = discreteUniform( N * N, -10, 10, opts );
var k = discreteUniform( N, -10, 10, opts );

dlapmt.ndarray( 1, N, N, X, N, 1, 0, k, 1, 0 );
```

The function has the following additional parameters:

-   **strideX1**: stride of dimension 1 of `X`.
-   **strideX2**: stride of dimension 2 of `X`.
-   **offsetX**: starting index for `X`.
-   **offsetK**: starting index for `K`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlapmt()` corresponds to the [LAPACK][lapack] level routine [`dlapmt`][lapack-dlapmt].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dlapmt = require( '@stdlib/lapack/base/dlapmt' );

var N = 3;
var X = discreteUniform( N * N, -10, 10, opts );
var k = discreteUniform( N, -10, 10, opts );

dlapmt.ndarray( 1, N, N, X, N, 1, 0, k, 1, 0 );
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

[lapack-dlapmt]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlapmt.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->