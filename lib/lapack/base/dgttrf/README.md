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

# dgttrf

> Computes an LU factorization of a real tridiagonal matrix A using elimination with partial pivoting and row interchanges.

<section class="usage">

## Usage

```javascript
var dgttrf = require( '@stdlib/lapack/base/dgttrf' );
```

#### dgttrf( N, DL, strideDL, d, strideD, DU, strideDU, DU2, strideDU2, IPIV, strideIPIV )

Computes an LU factorization of a real tridiagonal matrix A using elimination with partial pivoting and row interchanges.

```javascript
var dgttrf = require( '@stdlib/lapack/base/dgttrf' );

var N = 3;
var DU = discreteUniform( N * N, -10, 10, opts );
var DL = discreteUniform( N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var DU = discreteUniform( N * N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );

dgttrf.ndarray( N, DL, 1, 0, d, 1, 0, DU, 1, 0, 1, 1, 0, IPIV, 1, 0 );
```

The function has the following parameters:

-   **N**: number of columns.
-   **DL**: input array `DL`.
-   **strideDL**: stride length for `DL`.
-   **d**: `d`.
-   **strideD**: stride length for `D`.
-   **DU**: input array `DU`.
-   **strideDU**: stride length for `DU`.
-   **DU2**: input array `DU2`.
-   **strideDU2**: stride of dimension 2 of `DU`.
-   **IPIV**: input array `IPIV`.
-   **strideIPIV**: stride length for `IPIV`.

#### dgttrf.ndarray( N, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV )

Computes an LU factorization of a real tridiagonal matrix A using elimination with partial pivoting and row interchanges, using alternative indexing semantics.

```javascript
var dgttrf = require( '@stdlib/lapack/base/dgttrf' );

var N = 3;
var DU = discreteUniform( N * N, -10, 10, opts );
var DL = discreteUniform( N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var DU = discreteUniform( N * N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );

dgttrf.ndarray( N, DL, 1, 0, d, 1, 0, DU, 1, 0, 1, 1, 0, IPIV, 1, 0 );
```

The function has the following additional parameters:

-   **offsetDL**: starting index for `DL`.
-   **offsetD**: starting index for `D`.
-   **offsetDU**: starting index for `DU`.
-   **offsetDU2**: starting index for `DU2`.
-   **offsetIPIV**: starting index for `IPIV`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dgttrf()` corresponds to the [LAPACK][lapack] level routine [`dgttrf`][lapack-dgttrf].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dgttrf = require( '@stdlib/lapack/base/dgttrf' );

var N = 3;
var DU = discreteUniform( N * N, -10, 10, opts );
var DL = discreteUniform( N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var DU = discreteUniform( N * N, -10, 10, opts );
var IPIV = discreteUniform( N, -10, 10, opts );

dgttrf.ndarray( N, DL, 1, 0, d, 1, 0, DU, 1, 0, 1, 1, 0, IPIV, 1, 0 );
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

[lapack-dgttrf]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dgttrf.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->