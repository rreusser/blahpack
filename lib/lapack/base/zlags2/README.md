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

# zlags2

> Computes 2-by-2 unitary matrices U, V, and Q for the generalized upper (lower) triangular form.

<section class="usage">

## Usage

```javascript
var zlags2 = require( '@stdlib/lapack/base/zlags2' );
```

#### zlags2( upper, a1, a2, a3, b1, b2, b3, csu, snu, csv, snv, csq, snq )

Computes 2-by-2 unitary matrices U, V, and Q for the generalized upper (lower) triangular form.

```javascript
var zlags2 = require( '@stdlib/lapack/base/zlags2' );

zlags2( true, 4.0, new Complex128( 2.0, 1.0 ), 3.0, 1.0, new Complex128( 0.5, 0.25 ), 2.0 );
```

The function has the following parameters:

-   **upper**: `upper`.
-   **a1**: `a1`.
-   **a2**: `a2`.
-   **a3**: `a3`.
-   **b1**: `b1`.
-   **b2**: `b2`.
-   **b3**: `b3`.

#### zlags2.ndarray( upper, a1, a2, a3, b1, b2, b3, csu, snu, csv, snv, csq, snq )

Computes 2-by-2 unitary matrices U, V, and Q for the generalized upper (lower) triangular form, using alternative indexing semantics.

```javascript
var zlags2 = require( '@stdlib/lapack/base/zlags2' );

zlags2( true, 4.0, new Complex128( 2.0, 1.0 ), 3.0, 1.0, new Complex128( 0.5, 0.25 ), 2.0 );
```

The function has the following additional parameters:


</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zlags2()` corresponds to the [LAPACK][lapack] level routine [`zlags2`][lapack-zlags2].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zlags2 = require( '@stdlib/lapack/base/zlags2' );

zlags2( true, 4.0, new Complex128( 2.0, 1.0 ), 3.0, 1.0, new Complex128( 0.5, 0.25 ), 2.0 );
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

[lapack-zlags2]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zlags2.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->