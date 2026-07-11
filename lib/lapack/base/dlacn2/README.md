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

# dlacn2

> Estimates the 1-norm of a square matrix, using reverse communication for evaluating matrix-vector products.

<section class="usage">

## Usage

```javascript
var dlacn2 = require( '@stdlib/lapack/base/dlacn2' );
```

#### dlacn2( N, v, strideV, x, strideX, ISGN, strideISGN, EST, KASE, ISAVE, strideISAVE )

Estimates the 1-norm of a square matrix, using reverse communication for evaluating matrix-vector products.

```javascript
var dlacn2 = require( '@stdlib/lapack/base/dlacn2' );

var N = 3;
var v = discreteUniform( N, -10, 10, opts );
var x = discreteUniform( N, -10, 10, opts );
var ISGN = discreteUniform( N, -10, 10, opts );
var ISAVE = discreteUniform( N, -10, 10, opts );

dlacn2.ndarray( N, v, 1, 0, x, 1, 0, ISGN, 1, 0, 1, 1, ISAVE, 1, 0 );
```

The function has the following parameters:

-   **N**: number of columns.
-   **v**: `v`.
-   **strideV**: stride length for `V`.
-   **x**: `x`.
-   **strideX**: stride length for `X`.
-   **ISGN**: input array `ISGN`.
-   **strideISGN**: stride length for `ISGN`.
-   **EST**: input array `EST`.
-   **KASE**: input array `KASE`.
-   **ISAVE**: input array `ISAVE`.
-   **strideISAVE**: stride length for `ISAVE`.

#### dlacn2.ndarray( N, v, strideV, offsetV, x, strideX, offsetX, ISGN, strideISGN, offsetISGN, EST, KASE, ISAVE, strideISAVE, offsetISAVE )

Estimates the 1-norm of a square matrix, using reverse communication for evaluating matrix-vector products, using alternative indexing semantics.

```javascript
var dlacn2 = require( '@stdlib/lapack/base/dlacn2' );

var N = 3;
var v = discreteUniform( N, -10, 10, opts );
var x = discreteUniform( N, -10, 10, opts );
var ISGN = discreteUniform( N, -10, 10, opts );
var ISAVE = discreteUniform( N, -10, 10, opts );

dlacn2.ndarray( N, v, 1, 0, x, 1, 0, ISGN, 1, 0, 1, 1, ISAVE, 1, 0 );
```

The function has the following additional parameters:

-   **offsetV**: starting index for `V`.
-   **offsetX**: starting index for `X`.
-   **offsetISGN**: starting index for `ISGN`.
-   **offsetISAVE**: starting index for `ISAVE`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlacn2()` corresponds to the [LAPACK][lapack] level routine [`dlacn2`][lapack-dlacn2].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dlacn2 = require( '@stdlib/lapack/base/dlacn2' );

var N = 3;
var v = discreteUniform( N, -10, 10, opts );
var x = discreteUniform( N, -10, 10, opts );
var ISGN = discreteUniform( N, -10, 10, opts );
var ISAVE = discreteUniform( N, -10, 10, opts );

dlacn2.ndarray( N, v, 1, 0, x, 1, 0, ISGN, 1, 0, 1, 1, ISAVE, 1, 0 );
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

[lapack-dlacn2]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlacn2.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->