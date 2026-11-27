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

# zlaqhp

> @license Apache-2.0.

<section class="usage">

## Usage

```javascript
var zlaqhp = require( '@stdlib/lapack/base/zlaqhp' );
```

#### zlaqhp( uplo, N, AP, S, strideS, scond, amax )

@license Apache-2.0.

```javascript
var zlaqhp = require( '@stdlib/lapack/base/zlaqhp' );

zlaqhp( 'upper', 3, AP, S, 1, 0.05, 16.0 );
```

The function has the following parameters:

-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **N**: number of columns.
-   **AP**: input array `AP`.
-   **S**: input array `S`.
-   **strideS**: stride length for `S`.
-   **scond**: `scond`.
-   **amax**: `amax`.

#### zlaqhp.ndarray( uplo, N, AP, strideAP, offsetAP, S, strideS, offsetS, scond, amax )

@license Apache-2.0, using alternative indexing semantics.

```javascript
var zlaqhp = require( '@stdlib/lapack/base/zlaqhp' );

zlaqhp( 'upper', 3, AP, S, 1, 0.05, 16.0 );
```

The function has the following additional parameters:

-   **strideAP**: stride length for `AP`.
-   **offsetAP**: starting index for `AP`.
-   **offsetS**: starting index for `S`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zlaqhp()` corresponds to the [LAPACK][lapack] level routine [`zlaqhp`][lapack-zlaqhp].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var zlaqhp = require( '@stdlib/lapack/base/zlaqhp' );

zlaqhp( 'upper', 3, AP, S, 1, 0.05, 16.0 );
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

[lapack-zlaqhp]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zlaqhp.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->