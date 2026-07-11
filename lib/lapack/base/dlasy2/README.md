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

# dlasy2

> Solves the Sylvester matrix equation.

<section class="usage">

## Usage

```javascript
var dlasy2 = require( '@stdlib/lapack/base/dlasy2' );
```

#### dlasy2( ltranl, ltranr, isgn, n1, n2, TL, LDTL, TR, LDTR, B, LDB, scale, X, LDX, xnorm )

Solves the Sylvester matrix equation.

```javascript
var dlasy2 = require( '@stdlib/lapack/base/dlasy2' );

var N = 3;
var TL = discreteUniform( N * N, -10, 10, opts );
var TR = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var X = discreteUniform( N * N, -10, 10, opts );

dlasy2.ndarray( 1, 1, 1, 1, 1, TL, N, 1, 0, TR, N, 1, 0, B, N, 1, 0, 1.0, X, N, 1, 0, 1 );
```

The function has the following parameters:

-   **ltranl**: `ltranl`.
-   **ltranr**: `ltranr`.
-   **isgn**: `isgn`.
-   **n1**: `n1`.
-   **n2**: `n2`.
-   **TL**: input array `TL`.
-   **LDTL**: leading dimension of `TL`.
-   **TR**: input array `TR`.
-   **LDTR**: leading dimension of `TR`.
-   **B**: input array `B`.
-   **LDB**: leading dimension of `B`.
-   **scale**: `scale`.
-   **X**: input array `X`.
-   **LDX**: leading dimension of `X`.
-   **xnorm**: `xnorm`.

#### dlasy2.ndarray( ltranl, ltranr, isgn, n1, n2, TL, strideTL1, strideTL2, offsetTL, TR, strideTR1, strideTR2, offsetTR, B, strideB1, strideB2, offsetB, scale, X, strideX1, strideX2, offsetX, xnorm )

Solves the Sylvester matrix equation, using alternative indexing semantics.

```javascript
var dlasy2 = require( '@stdlib/lapack/base/dlasy2' );

var N = 3;
var TL = discreteUniform( N * N, -10, 10, opts );
var TR = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var X = discreteUniform( N * N, -10, 10, opts );

dlasy2.ndarray( 1, 1, 1, 1, 1, TL, N, 1, 0, TR, N, 1, 0, B, N, 1, 0, 1.0, X, N, 1, 0, 1 );
```

The function has the following additional parameters:

-   **strideTL1**: stride of dimension 1 of `TL`.
-   **strideTL2**: stride of dimension 2 of `TL`.
-   **offsetTL**: starting index for `TL`.
-   **strideTR1**: stride of dimension 1 of `TR`.
-   **strideTR2**: stride of dimension 2 of `TR`.
-   **offsetTR**: starting index for `TR`.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **strideX1**: stride of dimension 1 of `X`.
-   **strideX2**: stride of dimension 2 of `X`.
-   **offsetX**: starting index for `X`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlasy2()` corresponds to the [LAPACK][lapack] level routine [`dlasy2`][lapack-dlasy2].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dlasy2 = require( '@stdlib/lapack/base/dlasy2' );

var N = 3;
var TL = discreteUniform( N * N, -10, 10, opts );
var TR = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var X = discreteUniform( N * N, -10, 10, opts );

dlasy2.ndarray( 1, 1, 1, 1, 1, TL, N, 1, 0, TR, N, 1, 0, B, N, 1, 0, 1.0, X, N, 1, 0, 1 );
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

[lapack-dlasy2]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlasy2.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->