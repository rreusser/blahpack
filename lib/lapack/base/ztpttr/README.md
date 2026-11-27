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

# ztpttr

> Copies a complex triangular matrix from standard packed format (TP) to full format (TR).

<section class="usage">

## Usage

```javascript
var ztpttr = require( '@stdlib/lapack/base/ztpttr' );
```

#### ztpttr( order, uplo, N, AP, A, LDA )

Copies a complex triangular matrix from standard packed format (TP) to full format (TR).

```javascript
var ztpttr = require( '@stdlib/lapack/base/ztpttr' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var AP = discreteUniform( N, -10, 10, opts );

ztpttr.ndarray( 'upper', N, AP, 1, 0, A, N, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **N**: number of columns.
-   **AP**: input array `AP`.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.

#### ztpttr.ndarray( uplo, N, AP, strideAP, offsetAP, A, strideA1, strideA2, offsetA )

Copies a complex triangular matrix from standard packed format (TP) to full format (TR), using alternative indexing semantics.

```javascript
var ztpttr = require( '@stdlib/lapack/base/ztpttr' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var AP = discreteUniform( N, -10, 10, opts );

ztpttr.ndarray( 'upper', N, AP, 1, 0, A, N, 1, 0 );
```

The function has the following additional parameters:

-   **strideAP**: stride length for `AP`.
-   **offsetAP**: starting index for `AP`.
-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `ztpttr()` corresponds to the [LAPACK][lapack] level routine [`ztpttr`][lapack-ztpttr].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var ztpttr = require( '@stdlib/lapack/base/ztpttr' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var AP = discreteUniform( N, -10, 10, opts );

ztpttr.ndarray( 'upper', N, AP, 1, 0, A, N, 1, 0 );
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

[lapack-ztpttr]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__ztpttr.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->