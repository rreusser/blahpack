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

# zpftrs

> @license Apache-2.0.

<section class="usage">

## Usage

```javascript
var zpftrs = require( '@stdlib/lapack/base/zpftrs' );
```

#### zpftrs( order, transr, uplo, N, nrhs, A, strideA, B, LDB )

@license Apache-2.0.

```javascript
var zpftrs = require( '@stdlib/lapack/base/zpftrs' );

zpftrs.ndarray( 'no-transpose', 'lower', 3, 1, A, 1, 0, B, 1, 3, 0 );
```

The function has the following parameters:

-   **transr**: `transr`.
-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **N**: number of columns.
-   **nrhs**: number of right-hand sides.
-   **A**: input array `A`.
-   **B**: input array `B`.

#### zpftrs.ndarray( transr, uplo, N, nrhs, A, strideA, offsetA, B, strideB1, strideB2, offsetB )

@license Apache-2.0, using alternative indexing semantics.

```javascript
var zpftrs = require( '@stdlib/lapack/base/zpftrs' );

zpftrs.ndarray( 'no-transpose', 'lower', 3, 1, A, 1, 0, B, 1, 3, 0 );
```

The function has the following additional parameters:

-   **strideA**: stride length for `A`.
-   **offsetA**: starting index for `A`.
-   **strideB1**: stride of dimension 1 of `B`.
-   **strideB2**: stride of dimension 2 of `B`.
-   **offsetB**: starting index for `B`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zpftrs()` corresponds to the [LAPACK][lapack] level routine [`zpftrs`][lapack-zpftrs].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zpftrs = require( '@stdlib/lapack/base/zpftrs' );

zpftrs.ndarray( 'no-transpose', 'lower', 3, 1, A, 1, 0, B, 1, 3, 0 );
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

[lapack-zpftrs]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zpftrs.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->