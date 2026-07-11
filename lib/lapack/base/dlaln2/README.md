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

# dlaln2

> Solves a 1-by-1 or 2-by-2 linear system of equations of the specified form.

<section class="usage">

## Usage

```javascript
var dlaln2 = require( '@stdlib/lapack/base/dlaln2' );
```

#### dlaln2( ltrans, na, nw, smin, ca, A, LDA, d1, d2, B, LDB, wr, wi, X, LDX )

Solves a 1-by-1 or 2-by-2 linear system of equations of the specified form.

```javascript
var dlaln2 = require( '@stdlib/lapack/base/dlaln2' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var X = discreteUniform( N * N, -10, 10, opts );

dlaln2.ndarray( 1, 1, 1, 1, 1, A, N, 1, 0, 1, 1, B, N, 1, 0, 1, 1, X, N, 1, 0, 1.0, 1 );
```

The function has the following parameters:

-   **ltrans**: `ltrans`.
-   **na**: `na`.
-   **nw**: `nw`.
-   **smin**: `smin`.
-   **ca**: `ca`.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **d1**: `d1`.
-   **d2**: `d2`.
-   **B**: input array `B`.
-   **LDB**: leading dimension of `B`.
-   **wr**: `wr`.
-   **wi**: `wi`.
-   **X**: input array `X`.
-   **LDX**: leading dimension of `X`.

#### dlaln2.ndarray( ltrans, na, nw, smin, ca, A, strideA1, strideA2, offsetA, d1, d2, B, strideB1, strideB2, offsetB, wr, wi, X, strideX1, strideX2, offsetX, scale, xnorm )

Solves a 1-by-1 or 2-by-2 linear system of equations of the specified form, using alternative indexing semantics.

```javascript
var dlaln2 = require( '@stdlib/lapack/base/dlaln2' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var X = discreteUniform( N * N, -10, 10, opts );

dlaln2.ndarray( 1, 1, 1, 1, 1, A, N, 1, 0, 1, 1, B, N, 1, 0, 1, 1, X, N, 1, 0, 1.0, 1 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **strideX1**: stride of dimension 1 of `X`.
-   **strideX2**: stride of dimension 2 of `X`.
-   **offsetX**: starting index for `X`.
-   **scale**: `scale`.
-   **xnorm**: `xnorm`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlaln2()` corresponds to the [LAPACK][lapack] level routine [`dlaln2`][lapack-dlaln2].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dlaln2 = require( '@stdlib/lapack/base/dlaln2' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var B = discreteUniform( N * N, -10, 10, opts );
var X = discreteUniform( N * N, -10, 10, opts );

dlaln2.ndarray( 1, 1, 1, 1, 1, A, N, 1, 0, 1, 1, B, N, 1, 0, 1, 1, X, N, 1, 0, 1.0, 1 );
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

[lapack-dlaln2]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlaln2.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->