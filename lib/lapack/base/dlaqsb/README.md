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

# dlaqsb

> @license Apache-2.0.

<section class="usage">

## Usage

```javascript
var dlaqsb = require( '@stdlib/lapack/base/dlaqsb' );
```

#### dlaqsb( uplo, N, KD, AB, LDAB, S, strideS, scond, amax )

@license Apache-2.0.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dlaqsb = require( '@stdlib/lapack/base/dlaqsb' );

var S = new Float64Array( [ 0.5, 0.25, 0.2, 0.1 ] );

dlaqsb( 'upper', 4, 1, AB, 2, S, 1, 0.02, 25.0 );
```

The function has the following parameters:

-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **N**: number of columns.
-   **KD**: input array `KD`.
-   **AB**: input array `AB`.
-   **LDAB**: leading dimension of `AB`.
-   **S**: input array `S`.
-   **strideS**: stride length for `S`.
-   **scond**: `scond`.
-   **amax**: `amax`.

#### dlaqsb.ndarray( uplo, N, kd, AB, strideAB1, strideAB2, offsetAB, S, strideS, offsetS, scond, amax )

@license Apache-2.0, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dlaqsb = require( '@stdlib/lapack/base/dlaqsb' );

var S = new Float64Array( [ 0.5, 0.25, 0.2, 0.1 ] );

dlaqsb( 'upper', 4, 1, AB, 2, S, 1, 0.02, 25.0 );
```

The function has the following additional parameters:

-   **kd**: `kd`.
-   **strideAB1**: stride of dimension 1 of `AB`.
-   **strideAB2**: stride of dimension 2 of `AB`.
-   **offsetAB**: starting index for `AB`.
-   **offsetS**: starting index for `S`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlaqsb()` corresponds to the [LAPACK][lapack] level routine [`dlaqsb`][lapack-dlaqsb].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dlaqsb = require( '@stdlib/lapack/base/dlaqsb' );

var S = new Float64Array( [ 0.5, 0.25, 0.2, 0.1 ] );

dlaqsb( 'upper', 4, 1, AB, 2, S, 1, 0.02, 25.0 );
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

[lapack-dlaqsb]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlaqsb.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->