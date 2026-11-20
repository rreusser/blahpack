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

# dpbequ

> Computes row and column scalings intended to equilibrate a symmetric positive definite band matrix and reduce its condition number.

<section class="usage">

## Usage

```javascript
var dpbequ = require( '@stdlib/lapack/base/dpbequ' );
```

#### dpbequ( uplo, N, kd, AB, LDAB, s, strideS )

Computes row and column scalings intended to equilibrate a symmetric positive definite band matrix and reduce its condition number.

```javascript
var dpbequ = require( '@stdlib/lapack/base/dpbequ' );

var N = 3;
var AB = discreteUniform( N * N, -10, 10, opts );
var s = discreteUniform( N, -10, 10, opts );

dpbequ.ndarray( 'upper', N, 1, AB, N, 1, 0, s, 1, 0 );
```

The function has the following parameters:

-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **N**: number of columns.
-   **kd**: `kd`.
-   **AB**: input array `AB`.
-   **LDAB**: leading dimension of `AB`.
-   **s**: `s`.
-   **strideS**: stride length for `S`.

#### dpbequ.ndarray( uplo, N, kd, AB, strideAB1, strideAB2, offsetAB, s, strideS, offsetS, scond, amax )

Computes row and column scalings intended to equilibrate a symmetric positive definite band matrix and reduce its condition number, using alternative indexing semantics.

```javascript
var dpbequ = require( '@stdlib/lapack/base/dpbequ' );

var N = 3;
var AB = discreteUniform( N * N, -10, 10, opts );
var s = discreteUniform( N, -10, 10, opts );

dpbequ.ndarray( 'upper', N, 1, AB, N, 1, 0, s, 1, 0 );
```

The function has the following additional parameters:

-   **strideAB1**: stride of dimension 1 of `AB`.
-   **strideAB2**: stride of dimension 2 of `AB`.
-   **offsetAB**: starting index for `AB`.
-   **offsetS**: starting index for `S`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dpbequ()` corresponds to the [LAPACK][lapack] level routine [`dpbequ`][lapack-dpbequ].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dpbequ = require( '@stdlib/lapack/base/dpbequ' );

var N = 3;
var AB = discreteUniform( N * N, -10, 10, opts );
var s = discreteUniform( N, -10, 10, opts );

dpbequ.ndarray( 'upper', N, 1, AB, N, 1, 0, s, 1, 0 );
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

[lapack-dpbequ]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dpbequ.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->