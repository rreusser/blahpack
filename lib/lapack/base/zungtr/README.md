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

# zungtr

> Generates a complex unitary matrix Q which is defined as the product of n-1 elementary reflectors of order N, as returned by ZHETRD: if UPLO = 'U', Q = H(n-1).

<section class="usage">

## Usage

```javascript
var zungtr = require( '@stdlib/lapack/base/zungtr' );
```

#### zungtr( uplo, N, A, LDA, TAU, strideTAU, WORK, strideWORK )

Generates a complex unitary matrix Q which is defined as the product of n-1 elementary reflectors of order N, as returned by ZHETRD: if UPLO = 'U', Q = H(n-1).

```javascript
var zungtr = require( '@stdlib/lapack/base/zungtr' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var TAU = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

zungtr.ndarray( 'upper', N, A, N, 1, 0, TAU, 1, 0, WORK, 1, 0, N );
```

The function has the following parameters:

-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **N**: number of columns.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **TAU**: input array `TAU`.
-   **strideTAU**: stride length for `TAU`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.

#### zungtr.ndarray( uplo, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK, lwork )

Generates a complex unitary matrix Q which is defined as the product of n-1 elementary reflectors of order N, as returned by ZHETRD: if UPLO = 'U', Q = H(n-1), using alternative indexing semantics.

```javascript
var zungtr = require( '@stdlib/lapack/base/zungtr' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var TAU = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

zungtr.ndarray( 'upper', N, A, N, 1, 0, TAU, 1, 0, WORK, 1, 0, N );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **offsetTAU**: starting index for `TAU`.
-   **offsetWORK**: starting index for `WORK`.
-   **lwork**: `lwork`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zungtr()` corresponds to the [LAPACK][lapack] level routine [`zungtr`][lapack-zungtr].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zungtr = require( '@stdlib/lapack/base/zungtr' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var TAU = discreteUniform( N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

zungtr.ndarray( 'upper', N, A, N, 1, 0, TAU, 1, 0, WORK, 1, 0, N );
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

[lapack-zungtr]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zungtr.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->