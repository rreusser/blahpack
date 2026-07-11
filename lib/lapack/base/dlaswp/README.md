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

# dlaswp

> Performs a series of row interchanges on a general rectangular matrix.

<section class="usage">

## Usage

```javascript
var dlaswp = require( '@stdlib/lapack/base/dlaswp' );
```

#### dlaswp( order, N, A, LDA, k1, k2, IPIV, strideIPIV, incx )

Performs a series of row interchanges on a general rectangular matrix.

```javascript
var dlaswp = require( '@stdlib/lapack/base/dlaswp' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );

dlaswp.ndarray( N, A, N, 1, 0, 1, 1, IPIV, 1, 0, 1 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **N**: number of columns.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **k1**: `k1`.
-   **k2**: `k2`.
-   **IPIV**: input array `IPIV`.
-   **strideIPIV**: stride length for `IPIV`.
-   **incx**: `incx`.

#### dlaswp.ndarray( N, A, strideA1, strideA2, offsetA, k1, k2, IPIV, strideIPIV, offsetIPIV, incx )

Performs a series of row interchanges on a general rectangular matrix, using alternative indexing semantics.

```javascript
var dlaswp = require( '@stdlib/lapack/base/dlaswp' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );

dlaswp.ndarray( N, A, N, 1, 0, 1, 1, IPIV, 1, 0, 1 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **offsetIPIV**: starting index for `IPIV`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlaswp()` corresponds to the [LAPACK][lapack] level routine [`dlaswp`][lapack-dlaswp].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dlaswp = require( '@stdlib/lapack/base/dlaswp' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );

dlaswp.ndarray( N, A, N, 1, 0, 1, 1, IPIV, 1, 0, 1 );
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

[lapack-dlaswp]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlaswp.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->