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

# zlaqhe

> Equilibrates a Hermitian matrix A using the scaling factors in the vector S.

<section class="usage">

## Usage

```javascript
var zlaqhe = require( '@stdlib/lapack/base/zlaqhe' );
```

#### zlaqhe( uplo, N, A, LDA, s, strideS, scond, amax )

Equilibrates a Hermitian matrix A using the scaling factors in the vector S.

```javascript
var zlaqhe = require( '@stdlib/lapack/base/zlaqhe' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var s = discreteUniform( N, -10, 10, opts );

zlaqhe.ndarray( 'upper', N, A, N, 1, 0, s, 1, 0, 1, 1, 'none' );
```

The function has the following parameters:

-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **N**: number of columns.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **s**: `s`.
-   **strideS**: stride length for `S`.
-   **scond**: `scond`.
-   **amax**: `amax`.

#### zlaqhe.ndarray( uplo, N, A, strideA1, strideA2, offsetA, s, strideS, offsetS, scond, amax, equed )

Equilibrates a Hermitian matrix A using the scaling factors in the vector S, using alternative indexing semantics.

```javascript
var zlaqhe = require( '@stdlib/lapack/base/zlaqhe' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var s = discreteUniform( N, -10, 10, opts );

zlaqhe.ndarray( 'upper', N, A, N, 1, 0, s, 1, 0, 1, 1, 'none' );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **offsetS**: starting index for `S`.
-   **equed**: `equed`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zlaqhe()` corresponds to the [LAPACK][lapack] level routine [`zlaqhe`][lapack-zlaqhe].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zlaqhe = require( '@stdlib/lapack/base/zlaqhe' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var s = discreteUniform( N, -10, 10, opts );

zlaqhe.ndarray( 'upper', N, A, N, 1, 0, s, 1, 0, 1, 1, 'none' );
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

[lapack-zlaqhe]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zlaqhe.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->