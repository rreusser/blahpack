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

# dlagv2

> Computes the Generalized Schur factorization of a real 2-by-2 matrix pencil (A,B) where B is upper triangular.

<section class="usage">

## Usage

```javascript
var dlagv2 = require( '@stdlib/lapack/base/dlagv2' );
```

#### dlagv2( A, LDA, B, LDB, alphar, alphai, beta )

Computes the Generalized Schur factorization of a real 2-by-2 matrix pencil (A,B) where B is upper triangular.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dlagv2 = require( '@stdlib/lapack/base/dlagv2' );

var A = new Float64Array( [ 4.0, 2.0, 1.0, 3.0 ] );
var B = new Float64Array( [ 2.0, 0.0, 1.0, 1.0 ] );
var alphar = new Float64Array( 2 );
var alphai = new Float64Array( 2 );
var beta = new Float64Array( 2 );

dlagv2.ndarray( A, 1, 2, 0, B, 1, 2, 0, alphar, 1, 0, alphai, 1, 0, beta, 1, 0 );
```

The function has the following parameters:

-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **B**: input array `B`.
-   **LDB**: leading dimension of `B`.
-   **alphar**: `alphar`.
-   **alphai**: `alphai`.
-   **beta**: scalar constant.

#### dlagv2.ndarray( A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, alphar, strideALPHAR, offsetALPHAR, alphai, strideALPHAI, offsetALPHAI, beta, strideBETA, offsetBETA, csl, snl, csr, snr )

Computes the Generalized Schur factorization of a real 2-by-2 matrix pencil (A,B) where B is upper triangular, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dlagv2 = require( '@stdlib/lapack/base/dlagv2' );

var A = new Float64Array( [ 4.0, 2.0, 1.0, 3.0 ] );
var B = new Float64Array( [ 2.0, 0.0, 1.0, 1.0 ] );
var alphar = new Float64Array( 2 );
var alphai = new Float64Array( 2 );
var beta = new Float64Array( 2 );

dlagv2.ndarray( A, 1, 2, 0, B, 1, 2, 0, alphar, 1, 0, alphai, 1, 0, beta, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.
-   **strideALPHAR**: stride length for `ALPHAR`.
-   **offsetALPHAR**: starting index for `ALPHAR`.
-   **strideALPHAI**: stride length for `ALPHAI`.
-   **offsetALPHAI**: starting index for `ALPHAI`.
-   **strideBETA**: stride length for `BETA`.
-   **offsetBETA**: starting index for `BETA`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlagv2()` corresponds to the [LAPACK][lapack] level routine [`dlagv2`][lapack-dlagv2].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dlagv2 = require( '@stdlib/lapack/base/dlagv2' );

var A = new Float64Array( [ 4.0, 2.0, 1.0, 3.0 ] );
var B = new Float64Array( [ 2.0, 0.0, 1.0, 1.0 ] );
var alphar = new Float64Array( 2 );
var alphai = new Float64Array( 2 );
var beta = new Float64Array( 2 );

dlagv2.ndarray( A, 1, 2, 0, B, 1, 2, 0, alphar, 1, 0, alphai, 1, 0, beta, 1, 0 );
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

[lapack-dlagv2]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlagv2.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->