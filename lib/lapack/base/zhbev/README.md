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

# zhbev

> Computes all eigenvalues and optionally eigenvectors of a complex Hermitian band matrix.

<section class="usage">

## Usage

```javascript
var zhbev = require( '@stdlib/lapack/base/zhbev' );
```

#### zhbev( order, jobz, uplo, N, kd, AB, LDAB, w, strideW, Z, LDZ, WORK, strideWORK, RWORK, strideRWORK )

Computes all eigenvalues and optionally eigenvectors of a complex Hermitian band matrix.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var zhbev = require( '@stdlib/lapack/base/zhbev' );

var RWORK = new Float64Array( 10 );
var WORK = new Complex128Array( 4 );
var AB = new Complex128Array( 2 * 4 );
var W = new Float64Array( 4 );
var Z = new Complex128Array( 16 );

zhbev( 'column-major', 'compute-vectors', 'lower', 4, 1, AB, 2, W, 1, Z, 4, WORK, 1, RWORK, 1 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **jobz**: `jobz`.
-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **N**: number of columns.
-   **kd**: `kd`.
-   **AB**: input array `AB`.
-   **LDAB**: leading dimension of `AB`.
-   **w**: `w`.
-   **strideW**: stride length for `W`.
-   **Z**: input array `Z`.
-   **LDZ**: leading dimension of `Z`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.
-   **RWORK**: input array `RWORK`.
-   **strideRWORK**: stride length for `RWORK`.

#### zhbev.ndarray( jobz, uplo, N, kd, AB, strideAB1, strideAB2, offsetAB, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK )

Computes all eigenvalues and optionally eigenvectors of a complex Hermitian band matrix, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var zhbev = require( '@stdlib/lapack/base/zhbev' );

var RWORK = new Float64Array( 10 );
var WORK = new Complex128Array( 4 );
var AB = new Complex128Array( 2 * 4 );
var W = new Float64Array( 4 );
var Z = new Complex128Array( 16 );

zhbev( 'column-major', 'compute-vectors', 'lower', 4, 1, AB, 2, W, 1, Z, 4, WORK, 1, RWORK, 1 );
```

The function has the following additional parameters:

-   **strideAB1**: stride of dimension 1 of `AB`.
-   **strideAB2**: stride of dimension 2 of `AB`.
-   **offsetAB**: starting index for `AB`.
-   **offsetW**: starting index for `W`.
-   **strideZ1**: stride of dimension 1 of `Z`.
-   **strideZ2**: stride of dimension 2 of `Z`.
-   **offsetZ**: starting index for `Z`.
-   **offsetWORK**: starting index for `WORK`.
-   **offsetRWORK**: starting index for `RWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zhbev()` corresponds to the [LAPACK][lapack] level routine [`zhbev`][lapack-zhbev].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var zhbev = require( '@stdlib/lapack/base/zhbev' );

var RWORK = new Float64Array( 10 );
var WORK = new Complex128Array( 4 );
var AB = new Complex128Array( 2 * 4 );
var W = new Float64Array( 4 );
var Z = new Complex128Array( 16 );

zhbev( 'column-major', 'compute-vectors', 'lower', 4, 1, AB, 2, W, 1, Z, 4, WORK, 1, RWORK, 1 );
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

[lapack-zhbev]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zhbev.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->