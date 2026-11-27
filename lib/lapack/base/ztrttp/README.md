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

# ztrttp

> Copies a complex triangular matrix from full format (TR) to standard packed format (TP).

<section class="usage">

## Usage

```javascript
var ztrttp = require( '@stdlib/lapack/base/ztrttp' );
```

#### ztrttp( order, uplo, N, A, LDA, AP )

Copies a complex triangular matrix from full format (TR) to standard packed format (TP).

```javascript
var ztrttp = require( '@stdlib/lapack/base/ztrttp' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var AP = discreteUniform( N, -10, 10, opts );

ztrttp.ndarray( 'upper', N, A, N, 1, 0, AP, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **N**: number of columns.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **AP**: input array `AP`.

#### ztrttp.ndarray( uplo, N, A, strideA1, strideA2, offsetA, AP, strideAP, offsetAP )

Copies a complex triangular matrix from full format (TR) to standard packed format (TP), using alternative indexing semantics.

```javascript
var ztrttp = require( '@stdlib/lapack/base/ztrttp' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var AP = discreteUniform( N, -10, 10, opts );

ztrttp.ndarray( 'upper', N, A, N, 1, 0, AP, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **strideAP**: stride length for `AP`.
-   **offsetAP**: starting index for `AP`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `ztrttp()` corresponds to the [LAPACK][lapack] level routine [`ztrttp`][lapack-ztrttp].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var ztrttp = require( '@stdlib/lapack/base/ztrttp' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var AP = discreteUniform( N, -10, 10, opts );

ztrttp.ndarray( 'upper', N, A, N, 1, 0, AP, 1, 0 );
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

[lapack-ztrttp]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__ztrttp.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->