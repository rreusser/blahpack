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

# zlaqge

> Scales a general rectangular matrix, using row and column scaling factors computed by sgeequ.

<section class="usage">

## Usage

```javascript
var zlaqge = require( '@stdlib/lapack/base/zlaqge' );
```

#### zlaqge( M, N, A, LDA, r, strideR, c, strideC, rowcnd, colcnd, amax )

Scales a general rectangular matrix, using row and column scaling factors computed by sgeequ.

```javascript
var zlaqge = require( '@stdlib/lapack/base/zlaqge' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var r = discreteUniform( N, -10, 10, opts );
var c = discreteUniform( N, -10, 10, opts );

zlaqge.ndarray( N, N, A, N, 1, 0, r, 1, 0, c, 1, 0, 1, 1, 1, 'none' );
```

The function has the following parameters:

-   **M**: number of rows.
-   **N**: number of columns.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **r**: `r`.
-   **strideR**: stride length for `R`.
-   **c**: `c`.
-   **strideC**: stride length for `C`.
-   **rowcnd**: `rowcnd`.
-   **colcnd**: `colcnd`.
-   **amax**: `amax`.

#### zlaqge.ndarray( M, N, A, strideA1, strideA2, offsetA, r, strideR, offsetR, c, strideC, offsetC, rowcnd, colcnd, amax, equed )

Scales a general rectangular matrix, using row and column scaling factors computed by sgeequ, using alternative indexing semantics.

```javascript
var zlaqge = require( '@stdlib/lapack/base/zlaqge' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var r = discreteUniform( N, -10, 10, opts );
var c = discreteUniform( N, -10, 10, opts );

zlaqge.ndarray( N, N, A, N, 1, 0, r, 1, 0, c, 1, 0, 1, 1, 1, 'none' );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **offsetR**: starting index for `R`.
-   **offsetC**: starting index for `C`.
-   **equed**: `equed`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zlaqge()` corresponds to the [LAPACK][lapack] level routine [`zlaqge`][lapack-zlaqge].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zlaqge = require( '@stdlib/lapack/base/zlaqge' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var r = discreteUniform( N, -10, 10, opts );
var c = discreteUniform( N, -10, 10, opts );

zlaqge.ndarray( N, N, A, N, 1, 0, r, 1, 0, c, 1, 0, 1, 1, 1, 'none' );
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

[lapack-zlaqge]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zlaqge.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->