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

# dlagtf

> Computes an LU factorization of a matrix T-λI.

<section class="usage">

## Usage

```javascript
var dlagtf = require( '@stdlib/lapack/base/dlagtf' );
```

#### dlagtf( N, a, strideA, lambda, b, strideB, c, strideC, tol, d, strideD, IN, strideIN )

Computes an LU factorization of a matrix T-λI.

```javascript
var dlagtf = require( '@stdlib/lapack/base/dlagtf' );

var N = 3;
var a = discreteUniform( N, -10, 10, opts );
var b = discreteUniform( N, -10, 10, opts );
var c = discreteUniform( N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var IN = discreteUniform( N, -10, 10, opts );

dlagtf.ndarray( N, a, 1, 0, 1, b, 1, 0, c, 1, 0, 1.0, d, 1, 0, IN, 1, 0 );
```

The function has the following parameters:

-   **N**: number of columns.
-   **a**: `a`.
-   **strideA**: stride length for `A`.
-   **lambda**: `lambda`.
-   **b**: `b`.
-   **strideB**: stride length for `B`.
-   **c**: `c`.
-   **strideC**: stride length for `C`.
-   **tol**: `tol`.
-   **d**: `d`.
-   **strideD**: stride length for `D`.
-   **IN**: input array `IN`.
-   **strideIN**: stride length for `IN`.

#### dlagtf.ndarray( N, a, strideA, offsetA, lambda, b, strideB, offsetB, c, strideC, offsetC, tol, d, strideD, offsetD, IN, strideIN, offsetIN )

Computes an LU factorization of a matrix T-λI, using alternative indexing semantics.

```javascript
var dlagtf = require( '@stdlib/lapack/base/dlagtf' );

var N = 3;
var a = discreteUniform( N, -10, 10, opts );
var b = discreteUniform( N, -10, 10, opts );
var c = discreteUniform( N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var IN = discreteUniform( N, -10, 10, opts );

dlagtf.ndarray( N, a, 1, 0, 1, b, 1, 0, c, 1, 0, 1.0, d, 1, 0, IN, 1, 0 );
```

The function has the following additional parameters:

-   **offsetA**: starting index for `A`.
-   **offsetB**: starting index for `B`.
-   **offsetC**: starting index for `C`.
-   **offsetD**: starting index for `D`.
-   **offsetIN**: starting index for `IN`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlagtf()` corresponds to the [LAPACK][lapack] level routine [`dlagtf`][lapack-dlagtf].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dlagtf = require( '@stdlib/lapack/base/dlagtf' );

var N = 3;
var a = discreteUniform( N, -10, 10, opts );
var b = discreteUniform( N, -10, 10, opts );
var c = discreteUniform( N, -10, 10, opts );
var d = discreteUniform( N, -10, 10, opts );
var IN = discreteUniform( N, -10, 10, opts );

dlagtf.ndarray( N, a, 1, 0, 1, b, 1, 0, c, 1, 0, 1.0, d, 1, 0, IN, 1, 0 );
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

[lapack-dlagtf]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlagtf.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->