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

# zlansf

> Returns the one-norm, Frobenius norm, infinity-norm, or largest absolute value of a complex Hermitian matrix in RFP format.

<section class="usage">

## Usage

```javascript
var zlansf = require( '@stdlib/lapack/base/zlansf' );
```

#### zlansf( norm, transr, uplo, N, A, WORK )

Returns the one-norm, Frobenius norm, infinity-norm, or largest absolute value of a complex Hermitian matrix in RFP format.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var zlansf = require( '@stdlib/lapack/base/zlansf' );

var WORK = new Float64Array( 3 );

zlansf( 'one-norm', 'no-transpose', 'upper', 3, A, WORK );
```

The function has the following parameters:

-   **norm**: `norm`.
-   **transr**: `transr`.
-   **uplo**: specifies whether the upper or lower triangular part is referenced.
-   **N**: number of columns.
-   **A**: input array `A`.
-   **WORK**: input array `WORK`.

#### zlansf.ndarray( norm, transr, uplo, N, A, strideA, offsetA, WORK, strideWORK, offsetWORK )

Returns the one-norm, Frobenius norm, infinity-norm, or largest absolute value of a complex Hermitian matrix in RFP format, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var zlansf = require( '@stdlib/lapack/base/zlansf' );

var WORK = new Float64Array( 3 );

zlansf( 'one-norm', 'no-transpose', 'upper', 3, A, WORK );
```

The function has the following additional parameters:

-   **strideA**: stride length for `A`.
-   **offsetA**: starting index for `A`.
-   **strideWORK**: stride length for `WORK`.
-   **offsetWORK**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zlansf()` corresponds to the [LAPACK][lapack] level routine [`zlansf`][lapack-zlansf].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var zlansf = require( '@stdlib/lapack/base/zlansf' );

var WORK = new Float64Array( 3 );

zlansf( 'one-norm', 'no-transpose', 'upper', 3, A, WORK );
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

[lapack-zlansf]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__zlansf.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->