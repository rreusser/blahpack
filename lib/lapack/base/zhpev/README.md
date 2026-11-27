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

# zhpev

> Computes all eigenvalues and optionally eigenvectors of a complex Hermitian matrix in packed storage.

<section class="usage">

## Usage

```javascript
var zhpev = require( '@stdlib/lapack/base/zhpev' );
```

#### zhpev( order, jobz, uplo, N, AP, w, Z, LDZ, WORK, RWORK )

Computes all eigenvalues and optionally eigenvectors of a complex Hermitian matrix in packed storage.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var zhpev = require( '@stdlib/lapack/base/zhpev' );

var AP = new Complex128Array( [ 5, 0, 1, 1, 2, -1, 4, 0, 1, 0, 6, 0 ] );
var w = new Float64Array( 3 );
var Z = new Complex128Array( 9 );
var WORK = new Complex128Array( 10 );
var RWORK = new Float64Array( 10 );

zhpev.ndarray( 'compute-vectors', 'lower', 3, AP, 1, 0, w, 1, 0, Z, 1, 3, 0, WORK, 1, 0, RWORK, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **jobz**: `jobz`.
-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **N**: number of columns.
-   **AP**: input array `AP`.
-   **w**: `w`.
-   **Z**: input array `Z`.
-   **LDZ**: leading dimension of `Z`.
-   **WORK**: input array `WORK`.
-   **RWORK**: input array `RWORK`.

#### zhpev.ndarray( jobz, uplo, N, AP, strideAP, offsetAP, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK )

Computes all eigenvalues and optionally eigenvectors of a complex Hermitian matrix in packed storage, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var zhpev = require( '@stdlib/lapack/base/zhpev' );

var AP = new Complex128Array( [ 5, 0, 1, 1, 2, -1, 4, 0, 1, 0, 6, 0 ] );
var w = new Float64Array( 3 );
var Z = new Complex128Array( 9 );
var WORK = new Complex128Array( 10 );
var RWORK = new Float64Array( 10 );

zhpev.ndarray( 'compute-vectors', 'lower', 3, AP, 1, 0, w, 1, 0, Z, 1, 3, 0, WORK, 1, 0, RWORK, 1, 0 );
```

The function has the following additional parameters:

-   **strideAP**: stride length for `AP`.
-   **offsetAP**: starting index for `AP`.
-   **strideW**: stride length for `W`.
-   **offsetW**: starting index for `W`.
-   **strideZ1**: stride of dimension 1 of `Z`.
-   **strideZ2**: stride of dimension 2 of `Z`.
-   **offsetZ**: starting index for `Z`.
-   **strideWORK**: stride length for `WORK`.
-   **offsetWORK**: starting index for `WORK`.
-   **strideRWORK**: stride length for `RWORK`.
-   **offsetRWORK**: starting index for `RWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zhpev()` corresponds to the [LAPACK][lapack] level routine [`zhpev`][lapack-zhpev].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Complex128Array = require( '@stdlib/array/complex128' );
var zhpev = require( '@stdlib/lapack/base/zhpev' );

var AP = new Complex128Array( [ 5, 0, 1, 1, 2, -1, 4, 0, 1, 0, 6, 0 ] );
var w = new Float64Array( 3 );
var Z = new Complex128Array( 9 );
var WORK = new Complex128Array( 10 );
var RWORK = new Float64Array( 10 );

zhpev.ndarray( 'compute-vectors', 'lower', 3, AP, 1, 0, w, 1, 0, Z, 1, 3, 0, WORK, 1, 0, RWORK, 1, 0 );
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

[lapack-zhpev]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zhpev.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->