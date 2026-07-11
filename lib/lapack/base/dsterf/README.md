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

# dsterf

> Computes all eigenvalues of a symmetric tridiagonal matrix using the Pal-Walker-Kahan variant of the QL or QR algorithm.

<section class="usage">

## Usage

```javascript
var dsterf = require( '@stdlib/lapack/base/dsterf' );
```

#### dsterf( N, d, strideD, e, strideE )

Computes all eigenvalues of a symmetric tridiagonal matrix using the Pal-Walker-Kahan variant of the QL or QR algorithm.

```javascript
var dsterf = require( '@stdlib/lapack/base/dsterf' );

var N = 3;
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );

dsterf.ndarray( N, d, 1, 0, e, 1, 0 );
```

The function has the following parameters:

-   **N**: number of columns.
-   **d**: `d`.
-   **strideD**: stride length for `D`.
-   **e**: `e`.
-   **strideE**: stride length for `E`.

#### dsterf.ndarray( N, d, strideD, offsetD, e, strideE, offsetE )

Computes all eigenvalues of a symmetric tridiagonal matrix using the Pal-Walker-Kahan variant of the QL or QR algorithm, using alternative indexing semantics.

```javascript
var dsterf = require( '@stdlib/lapack/base/dsterf' );

var N = 3;
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );

dsterf.ndarray( N, d, 1, 0, e, 1, 0 );
```

The function has the following additional parameters:

-   **offsetD**: starting index for `D`.
-   **offsetE**: starting index for `E`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dsterf()` corresponds to the [LAPACK][lapack] level routine [`dsterf`][lapack-dsterf].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dsterf = require( '@stdlib/lapack/base/dsterf' );

var N = 3;
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );

dsterf.ndarray( N, d, 1, 0, e, 1, 0 );
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

[lapack-dsterf]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dsterf.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->