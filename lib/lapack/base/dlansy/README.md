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

# dlansy

> Returns the value of the 1-norm, or the Frobenius norm, or the infinity norm, or the element of largest absolute value of a real symmetric matrix.

<section class="usage">

## Usage

```javascript
var dlansy = require( '@stdlib/lapack/base/dlansy' );
```

#### dlansy( order, norm, uplo, N, A, LDA, WORK, strideWORK )

Returns the value of the 1-norm, or the Frobenius norm, or the infinity norm, or the element of largest absolute value of a real symmetric matrix.

```javascript
var dlansy = require( '@stdlib/lapack/base/dlansy' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dlansy.ndarray( '1', 'upper', N, A, N, 1, 0, WORK, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **norm**: `norm`.
-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **N**: number of columns.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **WORK**: input array `WORK`.
-   **strideWORK**: stride length for `WORK`.

#### dlansy.ndarray( norm, uplo, N, A, strideA1, strideA2, offsetA, WORK, strideWORK, offsetWORK )

Returns the value of the 1-norm, or the Frobenius norm, or the infinity norm, or the element of largest absolute value of a real symmetric matrix, using alternative indexing semantics.

```javascript
var dlansy = require( '@stdlib/lapack/base/dlansy' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dlansy.ndarray( '1', 'upper', N, A, N, 1, 0, WORK, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **offsetWORK**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlansy()` corresponds to the [LAPACK][lapack] level routine [`dlansy`][lapack-dlansy].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dlansy = require( '@stdlib/lapack/base/dlansy' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var WORK = discreteUniform( N, -10, 10, opts );

dlansy.ndarray( '1', 'upper', N, A, N, 1, 0, WORK, 1, 0 );
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

[lapack-dlansy]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlansy.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->