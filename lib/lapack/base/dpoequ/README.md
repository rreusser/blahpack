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

# dpoequ

> Computes row and column scalings intended to equilibrate a symmetric positive definite matrix A and reduce its condition number (with respect to the two-norm).

<section class="usage">

## Usage

```javascript
var dpoequ = require( '@stdlib/lapack/base/dpoequ' );
```

#### dpoequ( N, A, LDA, s, strideS )

Computes row and column scalings intended to equilibrate a symmetric positive definite matrix A and reduce its condition number (with respect to the two-norm).

```javascript
var dpoequ = require( '@stdlib/lapack/base/dpoequ' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var s = discreteUniform( N, -10, 10, opts );

dpoequ.ndarray( N, A, N, 1, 0, s, 1, 0, 1, 1 );
```

The function has the following parameters:

-   **N**: number of columns.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.
-   **s**: `s`.
-   **strideS**: stride length for `S`.

#### dpoequ.ndarray( N, A, strideA1, strideA2, offsetA, s, strideS, offsetS, scond, amax )

Computes row and column scalings intended to equilibrate a symmetric positive definite matrix A and reduce its condition number (with respect to the two-norm), using alternative indexing semantics.

```javascript
var dpoequ = require( '@stdlib/lapack/base/dpoequ' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var s = discreteUniform( N, -10, 10, opts );

dpoequ.ndarray( N, A, N, 1, 0, s, 1, 0, 1, 1 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **offsetS**: starting index for `S`.
-   **scond**: `scond`.
-   **amax**: `amax`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dpoequ()` corresponds to the [LAPACK][lapack] level routine [`dpoequ`][lapack-dpoequ].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dpoequ = require( '@stdlib/lapack/base/dpoequ' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var s = discreteUniform( N, -10, 10, opts );

dpoequ.ndarray( N, A, N, 1, 0, s, 1, 0, 1, 1 );
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

[lapack-dpoequ]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dpoequ.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->