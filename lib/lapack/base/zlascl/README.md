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

# zlascl

> Multiplies a general rectangular matrix by a real scalar defined as cto/cfrom.

<section class="usage">

## Usage

```javascript
var zlascl = require( '@stdlib/lapack/base/zlascl' );
```

#### zlascl( order, type, kl, ku, cfrom, cto, M, N, A, LDA )

Multiplies a general rectangular matrix by a real scalar defined as cto/cfrom.

```javascript
var zlascl = require( '@stdlib/lapack/base/zlascl' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );

zlascl.ndarray( 1, N, N, 1, 1, N, N, A, N, 1, 0 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **type**: `type`.
-   **kl**: number of subdiagonals.
-   **ku**: number of superdiagonals.
-   **cfrom**: `cfrom`.
-   **cto**: `cto`.
-   **M**: number of rows.
-   **N**: number of columns.
-   **A**: input array `A`.
-   **LDA**: leading dimension of `A`.

#### zlascl.ndarray( type, kl, ku, cfrom, cto, M, N, A, strideA1, strideA2, offsetA )

Multiplies a general rectangular matrix by a real scalar defined as cto/cfrom, using alternative indexing semantics.

```javascript
var zlascl = require( '@stdlib/lapack/base/zlascl' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );

zlascl.ndarray( 1, N, N, 1, 1, N, N, A, N, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zlascl()` corresponds to the [LAPACK][lapack] level routine [`zlascl`][lapack-zlascl].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zlascl = require( '@stdlib/lapack/base/zlascl' );

var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );

zlascl.ndarray( 1, N, N, 1, 1, N, N, A, N, 1, 0 );
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

[lapack-zlascl]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zlascl.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->