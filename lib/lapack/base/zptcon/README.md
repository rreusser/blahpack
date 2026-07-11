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

# zptcon

> Computes the reciprocal of the condition number (in the 1-norm) of a complex Hermitian positive definite tridiagonal matrix using the factorization A = L·D·Lᴴ or A = Uᴴ·D·U computed by ZPTTRF.

<section class="usage">

## Usage

```javascript
var zptcon = require( '@stdlib/lapack/base/zptcon' );
```

#### zptcon( N, d, strideD, e, strideE, anorm, rcond, RWORK, strideRWORK )

Computes the reciprocal of the condition number (in the 1-norm) of a complex Hermitian positive definite tridiagonal matrix using the factorization A = L·D·Lᴴ or A = Uᴴ·D·U computed by ZPTTRF.

```javascript
var zptcon = require( '@stdlib/lapack/base/zptcon' );

var N = 3;
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );
var RWORK = discreteUniform( N, -10, 10, opts );

zptcon.ndarray( N, d, 1, 0, e, 1, 0, 1.0, 1.0, RWORK, 1, 0 );
```

The function has the following parameters:

-   **N**: number of columns.
-   **d**: `d`.
-   **strideD**: stride length for `D`.
-   **e**: `e`.
-   **strideE**: stride length for `E`.
-   **anorm**: `anorm`.
-   **rcond**: `rcond`.
-   **RWORK**: input array `RWORK`.
-   **strideRWORK**: stride length for `RWORK`.

#### zptcon.ndarray( N, d, strideD, offsetD, e, strideE, offsetE, anorm, rcond, RWORK, strideRWORK, offsetRWORK )

Computes the reciprocal of the condition number (in the 1-norm) of a complex Hermitian positive definite tridiagonal matrix using the factorization A = L·D·Lᴴ or A = Uᴴ·D·U computed by ZPTTRF, using alternative indexing semantics.

```javascript
var zptcon = require( '@stdlib/lapack/base/zptcon' );

var N = 3;
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );
var RWORK = discreteUniform( N, -10, 10, opts );

zptcon.ndarray( N, d, 1, 0, e, 1, 0, 1.0, 1.0, RWORK, 1, 0 );
```

The function has the following additional parameters:

-   **offsetD**: starting index for `D`.
-   **offsetE**: starting index for `E`.
-   **offsetRWORK**: starting index for `RWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zptcon()` corresponds to the [LAPACK][lapack] level routine [`zptcon`][lapack-zptcon].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zptcon = require( '@stdlib/lapack/base/zptcon' );

var N = 3;
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );
var RWORK = discreteUniform( N, -10, 10, opts );

zptcon.ndarray( N, d, 1, 0, e, 1, 0, 1.0, 1.0, RWORK, 1, 0 );
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

[lapack-zptcon]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zptcon.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->