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

# dlags2

> Computes 2-by-2 orthogonal matrices U, V, and Q, and applies them to matrices A and B such that the rows of the transformed A and B are parallel.

<section class="usage">

## Usage

```javascript
var dlags2 = require( '@stdlib/lapack/base/dlags2' );
```

#### dlags2( upper, a1, a2, a3, b1, b2, b3 )

Computes 2-by-2 orthogonal matrices U, V, and Q, and applies them to matrices A and B such that the rows of the transformed A and B are parallel.

```javascript
var dlags2 = require( '@stdlib/lapack/base/dlags2' );

dlags2.ndarray( 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 );
```

The function has the following parameters:

-   **upper**: `upper`.
-   **a1**: `a1`.
-   **a2**: `a2`.
-   **a3**: `a3`.
-   **b1**: `b1`.
-   **b2**: `b2`.
-   **b3**: `b3`.

#### dlags2.ndarray( upper, a1, a2, a3, b1, b2, b3, csu, snu, csv, snv, csq, snq )

Computes 2-by-2 orthogonal matrices U, V, and Q, and applies them to matrices A and B such that the rows of the transformed A and B are parallel, using alternative indexing semantics.

```javascript
var dlags2 = require( '@stdlib/lapack/base/dlags2' );

dlags2.ndarray( 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 );
```

The function has the following additional parameters:

-   **csu**: `csu`.
-   **snu**: `snu`.
-   **csv**: `csv`.
-   **snv**: `snv`.
-   **csq**: `csq`.
-   **snq**: `snq`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlags2()` corresponds to the [LAPACK][lapack] level routine [`dlags2`][lapack-dlags2].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dlags2 = require( '@stdlib/lapack/base/dlags2' );

dlags2.ndarray( 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 );
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

[lapack-dlags2]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlags2.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->