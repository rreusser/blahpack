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

# dlasdt

> Create a tree of subproblems for bidiagonal divide and conquer.

<section class="usage">

## Usage

```javascript
var dlasdt = require( '@stdlib/lapack/base/dlasdt' );
```

#### dlasdt( N, lvl, nd, INODE, strideINODE, NDIML, strideNDIML, NDIMR, strideNDIMR, msub )

Create a tree of subproblems for bidiagonal divide and conquer.

```javascript
var dlasdt = require( '@stdlib/lapack/base/dlasdt' );

var N = 3;
var INODE = discreteUniform( N, -10, 10, opts );
var NDIML = discreteUniform( N, -10, 10, opts );
var NDIMR = discreteUniform( N, -10, 10, opts );

dlasdt.ndarray( N, 1, 1, INODE, 1, 0, NDIML, 1, 0, NDIMR, 1, 0, 1 );
```

The function has the following parameters:

-   **N**: number of columns.
-   **lvl**: `lvl`.
-   **nd**: `nd`.
-   **INODE**: input array `INODE`.
-   **strideINODE**: stride length for `INODE`.
-   **NDIML**: input array `NDIML`.
-   **strideNDIML**: stride length for `NDIML`.
-   **NDIMR**: input array `NDIMR`.
-   **strideNDIMR**: stride length for `NDIMR`.
-   **msub**: `msub`.

#### dlasdt.ndarray( N, lvl, nd, INODE, strideINODE, offsetINODE, NDIML, strideNDIML, offsetNDIML, NDIMR, strideNDIMR, offsetNDIMR, msub )

Create a tree of subproblems for bidiagonal divide and conquer, using alternative indexing semantics.

```javascript
var dlasdt = require( '@stdlib/lapack/base/dlasdt' );

var N = 3;
var INODE = discreteUniform( N, -10, 10, opts );
var NDIML = discreteUniform( N, -10, 10, opts );
var NDIMR = discreteUniform( N, -10, 10, opts );

dlasdt.ndarray( N, 1, 1, INODE, 1, 0, NDIML, 1, 0, NDIMR, 1, 0, 1 );
```

The function has the following additional parameters:

-   **offsetINODE**: starting index for `INODE`.
-   **offsetNDIML**: starting index for `NDIML`.
-   **offsetNDIMR**: starting index for `NDIMR`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlasdt()` corresponds to the [LAPACK][lapack] level routine [`dlasdt`][lapack-dlasdt].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dlasdt = require( '@stdlib/lapack/base/dlasdt' );

var N = 3;
var INODE = discreteUniform( N, -10, 10, opts );
var NDIML = discreteUniform( N, -10, 10, opts );
var NDIMR = discreteUniform( N, -10, 10, opts );

dlasdt.ndarray( N, 1, 1, INODE, 1, 0, NDIML, 1, 0, NDIMR, 1, 0, 1 );
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

[lapack-dlasdt]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlasdt.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->